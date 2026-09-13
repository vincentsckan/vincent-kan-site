import express from 'express';
import { execFile } from 'node:child_process';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import makeWASocket, {
  Browsers,
  DisconnectReason,
  jidNormalizedUser,
  normalizeMessageContent,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';
import fetch from 'node-fetch';
import pino from 'pino';
import QRCode from 'qrcode';
import qrcode from 'qrcode-terminal';

const execFileAsync = promisify(execFile);

const app = express();
const PORT = Number(process.env.PORT || 3000);
const OPENCLAW_BASE_URL = process.env.OPENCLAW_BASE_URL || 'http://10.0.12.102:18789';
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN || process.env.OPENCLAW_GATEWAY_TOKEN || '';
const OPENCLAW_MODEL = process.env.OPENCLAW_MODEL || '';
const OPENCLAW_BIN = process.env.OPENCLAW_BIN || 'openclaw';
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'openclaw-whatsapp';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const WHATSAPP_GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || 'v23.0';
const WHATSAPP_AUTH_DIR = process.env.WHATSAPP_AUTH_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), '.auth');
const WHATSAPP_QR_PATH = process.env.WHATSAPP_QR_PATH || path.join(path.dirname(fileURLToPath(import.meta.url)), 'whatsapp-qr.png');
let whatsappConnection = 'starting';
const sentMessageIds = new Set();

app.use(express.json({ limit: '1mb' }));

function makeOpenClawPrompt(message) {
  return `You are a helpful assistant. Answer briefly and clearly. User says: ${message}`;
}

async function inferWithOpenClaw(prompt) {
  const args = ['infer', 'model', 'run', '--gateway'];
  if (OPENCLAW_MODEL) args.push('--model', OPENCLAW_MODEL);
  args.push('--prompt', prompt, '--json');

  const { stdout } = await execFileAsync(
    OPENCLAW_BIN,
    args,
    {
      env: {
        ...process.env,
        OPENCLAW_GATEWAY_TOKEN: OPENCLAW_TOKEN
      },
      timeout: 120000,
      maxBuffer: 2 * 1024 * 1024
    }
  );

  const result = JSON.parse(stdout.trim());
  if (!result.ok || !result.outputs?.[0]?.text) {
    throw new Error('OpenClaw returned no text output');
  }

  return result.outputs[0].text;
}

async function sendWhatsAppMessage(to, text) {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID');
  }

  const response = await fetch(
    `https://graph.facebook.com/${WHATSAPP_GRAPH_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { preview_url: false, body: text }
      })
    }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`WhatsApp API ${response.status}: ${details}`);
  }
}

async function startWhatsAppWeb() {
  const { state, saveCreds } = await useMultiFileAuthState(WHATSAPP_AUTH_DIR);
  const socket = makeWASocket({
    auth: state,
    browser: Browsers.macOS('OpenClaw Bridge'),
    logger: pino({ level: 'silent' }),
    markOnlineOnConnect: false,
    printQRInTerminal: false
  });

  socket.ev.on('creds.update', saveCreds);
  socket.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('\nWhatsApp QR: scan with WhatsApp -> Linked devices -> Link a device\n');
      qrcode.generate(qr, { small: true });
      QRCode.toFile(WHATSAPP_QR_PATH, qr, { width: 1024, margin: 4 })
        .then(() => console.log(`WhatsApp QR image saved: ${WHATSAPP_QR_PATH}`))
        .catch((error) => console.error('QR image error:', error));
    }

    if (connection === 'open') {
      whatsappConnection = 'connected';
      console.log('WhatsApp Web connected.');
    }

    if (connection === 'close') {
      whatsappConnection = 'disconnected';
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) {
        setTimeout(() => startWhatsAppWeb().catch((error) => console.error('WhatsApp restart error:', error)), 3000);
      } else {
        console.error('WhatsApp logged out. Resetting auth state and regenerating QR...');
        rm(WHATSAPP_AUTH_DIR, { recursive: true, force: true })
          .catch((error) => console.error('Auth reset error:', error))
          .finally(() => {
            setTimeout(() => startWhatsAppWeb().catch((error) => console.error('WhatsApp restart error:', error)), 3000);
          });
      }
    }
  });

  socket.ev.on('messages.upsert', async ({ messages, type }) => {
    console.log(`WhatsApp messages.upsert: type=${type}, count=${messages.length}`);
    if (type !== 'notify') return;

    for (const message of messages) {
      const ownJid = socket.user?.id ? jidNormalizedUser(socket.user.id) : null;
      const messageJid = message.key.remoteJid ? jidNormalizedUser(message.key.remoteJid) : null;
      const ownLid = socket.user?.lid ? jidNormalizedUser(socket.user.lid) : null;
      const isSelfChat = Boolean(
        (ownJid && messageJid === ownJid) ||
        (ownLid && messageJid === ownLid)
      );
      const isBridgeReply = message.key.id && sentMessageIds.has(message.key.id);

      if ((message.key.fromMe && (!isSelfChat || isBridgeReply)) || !message.message || !message.key.remoteJid) {
        console.log('WhatsApp message skipped:', JSON.stringify({
          fromMe: message.key.fromMe,
          isSelfChat,
          isBridgeReply,
          remoteJid: message.key.remoteJid,
          messageKeys: message.message ? Object.keys(message.message) : []
        }));
        continue;
      }
      const content = normalizeMessageContent(message.message);
      const text = content?.conversation || content?.extendedTextMessage?.text;
      if (!text) {
        console.log('WhatsApp message has no text:', JSON.stringify({
          remoteJid: message.key.remoteJid,
          messageKeys: Object.keys(message.message),
          contentKeys: content ? Object.keys(content) : []
        }));
        continue;
      }

      try {
        console.log(`WhatsApp incoming text from ${message.key.remoteJid}`);
        const reply = await inferWithOpenClaw(makeOpenClawPrompt(text));
        const sent = await socket.sendMessage(message.key.remoteJid, { text: reply });
        if (sent?.key?.id) sentMessageIds.add(sent.key.id);
        console.log(`WhatsApp reply sent to ${message.key.remoteJid}`);
      } catch (error) {
        console.error('WhatsApp message error:', error);
      }
    }
  });
}

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.status(403).send('Forbidden');
});

app.post('/webhook', async (req, res) => {
  try {
    const body = req.body || {};
    const entry = body.entry || [];

    let messageText = null;
    let from = null;

    for (const item of entry) {
      const changes = item.changes || [];
      for (const change of changes) {
        const value = change.value || {};
        const messages = value.messages || [];
        for (const msg of messages) {
          if (!msg.text || !msg.from) continue;
          messageText = msg.text.body || msg.text;
          from = msg.from;
        }
      }
    }

    if (!messageText || !from) {
      return res.status(200).json({ status: 'ignored' });
    }

    const prompt = makeOpenClawPrompt(messageText);

    const resultText = await inferWithOpenClaw(prompt);

    await sendWhatsAppMessage(from, resultText);

    return res.status(200).json({
      ok: true,
      from,
      userMessage: messageText,
      botReply: resultText,
      delivered: true
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ ok: false, error: String(error) });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true, status: 'live', whatsapp: whatsappConnection }));

app.listen(PORT, () => {
  console.log(`WhatsApp bridge listening on http://0.0.0.0:${PORT}`);
  console.log(`OpenClaw base URL: ${OPENCLAW_BASE_URL}`);
  console.log(`Verify token: ${WHATSAPP_VERIFY_TOKEN}`);
  startWhatsAppWeb().catch((error) => {
    whatsappConnection = 'error';
    console.error('WhatsApp startup error:', error);
  });
});
