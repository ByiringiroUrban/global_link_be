import { spawnSync } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: tsx scripts/prisma.ts <prisma-command> [args...]');
  process.exit(1);
}

const result = spawnSync('npx', ['prisma', ...args], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
