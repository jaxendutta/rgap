#!/usr/bin/env node

/**
 * Prunes older deployments across all Vercel projects,
 * ensuring each project keeps at most MAX_KEEP deployments (default: 3).
 *
 * Usage:
 *   node scripts/prune_vercel_deployments.mjs [max_to_keep]
 */

import { execSync } from 'child_process';

const MAX_KEEP = parseInt(process.argv[2] || '3', 10);

const projects = [
  'rgap', 'pvc', 'jeffrey', 'sabeer', 'v3', 'asher', 
  'pens', 'vedanta-ottawa', 'v2', 'jaxpot', 'jxn', 
  'tictactoe', 'emma', 'cs492-csam'
];

console.log(`=== VERCEL DEPLOYMENT PRUNER (Max ${MAX_KEEP} per project) ===\n`);

let totalDeleted = 0;

for (const p of projects) {
  try {
    const raw = execSync(`npx vercel ls ${p} --limit 100`, { stdio: ['pipe', 'pipe', 'pipe'] }).toString();
    const urls = raw.split('\n')
      .map(l => l.trim())
      .filter(l => l.startsWith('https://') && l.includes('.vercel.app') && !l.includes('anirban.ca'));
    
    const unique = Array.from(new Set(urls));
    
    if (unique.length > MAX_KEEP) {
      const toDelete = unique.slice(MAX_KEEP);
      console.log(`[${p}] Has ${unique.length} deployments. Pruning ${toDelete.length} older ones...`);
      for (const u of toDelete) {
        try {
          execSync(`npx vercel rm ${u} --yes`, { stdio: ['pipe', 'pipe', 'pipe'] });
          console.log(`  ✓ Deleted: ${u}`);
          totalDeleted++;
        } catch (e) {
          console.log(`  ✗ Failed to delete ${u}: ${e.message}`);
        }
      }
    } else {
      console.log(`[${p}] Clean (${unique.length}/${MAX_KEEP} deployments)`);
    }
  } catch (e) {
    console.log(`[${p}] Error fetching deployments: ${e.message}`);
  }
}

console.log(`\nPruning complete! Total deleted: ${totalDeleted}`);
