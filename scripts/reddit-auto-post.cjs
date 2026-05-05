// reddit-auto-post.cjs
// Parses REDDIT-POST-TEMPLATES.md, tracks usage state, and outputs/previews templates.
// Does NOT post to Reddit — safe to run without API credentials.
//
// Usage:
//   node scripts/reddit-auto-post.cjs            — Show preview of next unposted template
//   node scripts/reddit-auto-post.cjs --preview   — Same (explicit preview mode)
//   node scripts/reddit-auto-post.cjs --list      — Show all templates with status
//   node scripts/reddit-auto-post.cjs --export-csv — Export all templates as reddit-posts.csv
//   node scripts/reddit-auto-post.cjs --mark-failed <id> — Mark template <id> as failed
//   node scripts/reddit-auto-post.cjs --reset     — Reset state (all templates unposted)

const fs = require('fs');
const path = require('path');

const TEMPLATES_FILE = path.join(__dirname, '..', 'REDDIT-POST-TEMPLATES.md');
const STATE_FILE = path.join(__dirname, '..', '.reddit-post-state.json');
const CSV_OUTPUT = path.join(__dirname, '..', 'reddit-posts.csv');

// ─── State management ──────────────────────────────────────────────────────

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  } catch {
    return { posted: [], failed: [], lastPosted: null, version: 1 };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

// ─── Template parsing ──────────────────────────────────────────────────────

function parseTemplates(markdown) {
  const templates = [];
  const lines = markdown.split('\n');

  let current = null;
  let bodyStarted = false;
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track code blocks
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    // Detect template headers: "## Template N — ..."
    const templateMatch = line.match(/^## Template (\d+)\s*[—–-]\s*(.+)/);
    if (templateMatch) {
      if (current) templates.push(current);
      current = {
        id: parseInt(templateMatch[1], 10),
        title: templateMatch[2].trim(),
        rawTitle: '',
        body: '',
        subreddit: '',
        type: '',
        time: '',
        slug: '',
      };
      bodyStarted = false;
      continue;
    }

    if (!current) continue;

    // Extract fields from the sub-headers
    const subredditMatch = line.match(/^\*\*TARGET:\*\*\s*(.+)/i) ||
                           line.match(/\*\*TARGET:\*\*\s*(.+)/i);
    if (subredditMatch) {
      current.subreddit = subredditMatch[1].trim();
      current.body += line + '\n';
      continue;
    }

    const typeMatch = line.match(/^\*\*TYPE:\*\*\s*(.+)/i) ||
                      line.match(/\*\*TYPE:\*\*\s*(.+)/i);
    if (typeMatch) {
      current.type = typeMatch[1].trim();
      current.body += line + '\n';
      continue;
    }

    const timeMatch = line.match(/^\*\*TIME:\*\*\s*(.+)/i) ||
                      line.match(/\*\*TIME:\*\*\s*(.+)/i);
    if (timeMatch) {
      current.time = timeMatch[1].trim();
      current.body += line + '\n';
      continue;
    }

    // Detect BODY / TITLE sections
    const bodyHeaderMatch = line.match(/^\*\*BODY:\*\*$/i);
    if (bodyHeaderMatch) {
      bodyStarted = true;
      current.body += line + '\n';
      continue;
    }

    const titleMatch = line.match(/^\*\*TITLE:\*\*$/i);
    if (titleMatch) {
      current.body += line + '\n';
      continue;
    }

    // Capture raw title inside triple backticks (the actual post title)
    if (line.trim() && !line.trim().startsWith('```') && !inCodeBlock) {
      // Check if this is the title after **TITLE:**
      const prevLine = i > 0 ? lines[i - 1] : '';
      if (prevLine.trim() === '**TITLE:**') {
        current.rawTitle = line.trim();
      }
    }

    // Detect URL/slug (disclosurehk.com link)
    const slugMatch = line.match(/https:\/\/www\.disclosurehk\.com\/blog\/([^/)\s]+)/);
    if (slugMatch && !current.slug) {
      current.slug = slugMatch[1];
    }

    current.body += line + '\n';
  }

  // Push last template
  if (current) templates.push(current);

  return templates;
}

// ─── Load and parse templates ──────────────────────────────────────────────

function loadTemplates() {
  if (!fs.existsSync(TEMPLATES_FILE)) {
    console.error(`[ERROR] Templates file not found: ${TEMPLATES_FILE}`);
    console.error('        Run this script from the project root or check the path.');
    process.exit(1);
  }
  const markdown = fs.readFileSync(TEMPLATES_FILE, 'utf-8');
  return parseTemplates(markdown);
}

// ─── Format for display ────────────────────────────────────────────────────

function formatPreview(template, status) {
  const statusBadge = status === 'posted' ? '✅ POSTED' :
                       status === 'failed' ? '❌ FAILED' :
                       '🔄 READY TO POST';

  const lines = [];
  lines.push(`━━━ Template #${template.id} — ${template.title} ${statusBadge} ━━━`);
  lines.push(`  Subreddit: ${template.subreddit || '(not specified)'}`);
  lines.push(`  Best Time: ${template.time || '(not specified)'}`);
  lines.push(`  Slug: ${template.slug || '(no link found)'}`);
  lines.push('');
  if (template.rawTitle) {
    lines.push(`  📰 TITLE: ${template.rawTitle}`);
    lines.push('');
  }
  // Show first ~500 chars of body
  const bodyPreview = template.body.trim().substring(0, 600);
  lines.push('  📝 BODY (preview):');
  lines.push(bodyPreview);
  if (template.body.trim().length > 600) lines.push('  ... (truncated)');
  lines.push('');
  return lines.join('\n');
}

// ─── Export CSV ────────────────────────────────────────────────────────────

function exportCSV(templates, state) {
  const header = 'ID,Title,Subreddit,BestTime,Slug,Status,TitleText';
  const rows = templates.map(t => {
    const status = state.posted.includes(t.id) ? 'posted' :
                   state.failed.includes(t.id) ? 'failed' : 'ready';
    // Escape CSV fields
    const esc = s => `"${(s || '').replace(/"/g, '""')}"`;
    const titleText = t.rawTitle || '';
    return [t.id, esc(t.title), esc(t.subreddit), esc(t.time), esc(t.slug), status, esc(titleText)].join(',');
  });

  fs.writeFileSync(CSV_OUTPUT, header + '\n' + rows.join('\n'));
  console.log(`[OK] Exported ${templates.length} templates → ${CSV_OUTPUT}`);
}

// ─── Main ──────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const mode = args.includes('--preview') ? 'preview' :
               args.includes('--list') ? 'list' :
               args.includes('--export-csv') ? 'export-csv' :
               args.includes('--reset') ? 'reset' :
               args.includes('--mark-failed') ? 'mark-failed' :
               'preview'; // default: preview

  const state = loadState();
  const templates = loadTemplates();

  if (templates.length === 0) {
    console.error('[ERROR] No templates found. Check REDDIT-POST-TEMPLATES.md format.');
    process.exit(1);
  }

  if (mode === 'reset') {
    saveState({ posted: [], failed: [], lastPosted: null, version: 1 });
    console.log('[OK] State reset. All templates marked as unposted.');
    return;
  }

  if (mode === 'mark-failed') {
    const idIdx = args.indexOf('--mark-failed') + 1;
    const id = parseInt(args[idIdx], 10);
    if (!id || id < 1 || id > templates.length) {
      console.error(`[ERROR] Invalid template ID. Use a number between 1 and ${templates.length}.`);
      process.exit(1);
    }
    if (!state.failed.includes(id)) state.failed.push(id);
    saveState(state);
    console.log(`[OK] Template #${id} marked as failed.`);
    return;
  }

  if (mode === 'export-csv') {
    exportCSV(templates, state);
    return;
  }

  if (mode === 'list') {
    console.log(`\n📋 All ${templates.length} Templates:\n`);
    for (const t of templates) {
      const status = state.posted.includes(t.id) ? '✅' :
                     state.failed.includes(t.id) ? '❌' : '⬜';
      console.log(`  #${String(t.id).padEnd(2)} ${status} ${t.title}`);
      console.log(`      → ${t.subreddit || '(no subreddit)'} | Slug: ${t.slug || '—'}`);
    }
    console.log(`\n   Posted: ${state.posted.length} | Failed: ${state.failed.length} | Remaining: ${templates.length - state.posted.length - state.failed.length}`);
    return;
  }

  // ─── Preview mode (default) ────────────────────────────────────────────────

  // Find next unposted template (in order)
  const nextTemplate = templates.find(t =>
    !state.posted.includes(t.id) && !state.failed.includes(t.id)
  );

  if (!nextTemplate) {
    console.log('\n🎉 All templates have been posted or failed!');
    console.log('   Use --reset to re-enable all, or add more templates to REDDIT-POST-TEMPLATES.md');
    return;
  }

  console.log(formatPreview(nextTemplate, 'ready'));

  // Mark as posted after preview? No — only manual, controlled posting.
  console.log('ℹ️  This is a preview. To mark as posted, add the template id to .reddit-post-state.json');
  console.log('   Or run with --list to see all templates and use --export-csv for manual posting.');
}

main();
