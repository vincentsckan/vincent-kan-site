#!/usr/bin/env node

import { mkdir, access, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { constants } from 'node:fs';

const args = process.argv.slice(2);
const commandArgs = args[0] === '/create-agent' ? args.slice(1) : args;
const agentName = commandArgs[0]?.trim().toLowerCase();

if (!agentName) {
  console.error('Usage: npm run create-agent -- <agent-name>');
  console.error('   or: npm run create-agent -- /create-agent <agent-name>');
  process.exit(1);
}

if (!/^[a-z0-9][a-z0-9-]*$/.test(agentName)) {
  console.error('Agent name must contain only lowercase letters, numbers, and hyphens.');
  process.exit(1);
}

const agentsDir = path.resolve(process.cwd(), 'agents');
const agentPath = path.join(agentsDir, `${agentName}.json`);

const agentConfig = {
  name: agentName,
  enabled: true,
  command: `/create-agent ${agentName}`
};

await mkdir(agentsDir, { recursive: true });

try {
  await access(agentPath, constants.F_OK);
  console.log(`Agent already exists: ${agentPath}`);
  process.exit(0);
} catch {
  await writeFile(agentPath, `${JSON.stringify(agentConfig, null, 2)}\n`, 'utf8');
  console.log(`Created agent config: ${agentPath}`);
}
