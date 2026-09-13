#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const commandArgs = args[0] === '/create-agent' ? args.slice(1) : args;
const agentName = commandArgs[0]?.trim();

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
  enabled: true
};

await mkdir(agentsDir, { recursive: true });

try {
  await writeFile(agentPath, `${JSON.stringify(agentConfig, null, 2)}\n`, {
    encoding: 'utf8',
    flag: 'wx'
  });
  console.log(`Created agent config: ${agentPath}`);
} catch (error) {
  if (error?.code === 'EEXIST') {
    console.log(`Agent already exists: ${agentPath}`);
    process.exit(0);
  }

  throw error;
}
