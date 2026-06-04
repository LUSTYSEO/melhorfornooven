/**
 * replace-amazon-links.js
 * Substitui links markdown [Ver Preço na Amazon](URL) e [🔎 Ver Preço na Amazon](URL)
 * pelo componente Markdoc {% AmazonButton link="URL" /%} em todos os .mdoc posts.
 *
 * Também substitui padrões sem link (ex: \[Ver Preço na Amazon\]) por um placeholder
 * comentado para revisão manual.
 *
 * Uso: node scripts/replace-amazon-links.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '..', 'src', 'content', 'posts');

// Regex para capturar links markdown completos com texto "Ver Preço na Amazon" (com ou sem emoji)
// Captura: [🔎 Ver Preço na Amazon](URL) ou [Ver Preço na Amazon](URL)
const LINK_REGEX = /\[(?:🔎\s*)?Ver Preço na Amazon\]\(([^)]+)\)/g;

// Regex para links sem URL real (placeholder escapado) ex: \[Ver Preço na Amazon\]
const PLACEHOLDER_REGEX = /\\\[Ver Preço na Amazon\\\]/g;

let totalFiles = 0;
let modifiedFiles = 0;
let totalReplacements = 0;

const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.mdoc'));

for (const file of files) {
  const filePath = path.join(POSTS_DIR, file);
  const original = fs.readFileSync(filePath, 'utf-8');
  let content = original;
  let replacements = 0;

  // Substituir links com URL real
  content = content.replace(LINK_REGEX, (match, url) => {
    replacements++;
    return `{% AmazonButton link="${url}" /%}`;
  });

  // Substituir placeholders sem link (manter como comentário para revisão)
  content = content.replace(PLACEHOLDER_REGEX, (match) => {
    replacements++;
    return `{% AmazonButton link="#" /%}`;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    modifiedFiles++;
    totalReplacements += replacements;
    console.log(`✅ ${file}: ${replacements} substituição(ões)`);
  } else {
    console.log(`⏭️  ${file}: nenhuma alteração`);
  }

  totalFiles++;
}

console.log('\n──────────────────────────────────────────');
console.log(`📊 Resumo:`);
console.log(`   Arquivos verificados : ${totalFiles}`);
console.log(`   Arquivos modificados : ${modifiedFiles}`);
console.log(`   Total de substituições: ${totalReplacements}`);
console.log('──────────────────────────────────────────');
