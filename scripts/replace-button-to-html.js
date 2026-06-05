/**
 * replace-button-to-html.js
 * Substitui TODOS os padrões {% AmazonButton link="..." /%} (single e multi-linha)
 * por <a href="..."> HTML direto, compatível com Markdoc allowHTML: true.
 *
 * Padrões tratados:
 *   1. Single-line: {% AmazonButton link="URL" /%}
 *   2. Multi-line:  {% AmazonButton\n   link="URL"\n   /%}
 *   3. Dentro de bullet: * **{% AmazonButton link="#" /%}**
 *   4. Dentro de tabela: | ... | {% AmazonButton link="URL" /%} |
 *
 * Uso: node scripts/replace-button-to-html.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '..', 'src', 'content', 'posts');

const HTML_BUTTON = (url) =>
  `<a href="${url}" target="_blank" rel="nofollow noopener" style="background-color:#228B22;color:white;padding:8px 12px;text-decoration:none;border-radius:4px;font-weight:bold;font-size:14px;display:inline-block;">Ver Preço na Amazon</a>`;

let totalFiles = 0;
let modifiedFiles = 0;
let totalReplacements = 0;

const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.mdoc'));

for (const file of files) {
  const filePath = path.join(POSTS_DIR, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;
  let replacements = 0;

  // ── Passo 1: Normalizar multi-linha → single-line ────────────────────────
  // Captura padrões quebrados em múltiplas linhas:
  //   {% AmazonButton\n   link="URL"\n   /%}
  // e os colapsa em uma linha única antes de substituir.
  content = content.replace(
    /\{%\s*AmazonButton[\s\S]*?link="([^"]+)"[\s\S]*?\/\s*%\}/g,
    (match, url) => {
      replacements++;
      return HTML_BUTTON(url);
    }
  );

  // ── Passo 2: Limpar fragmentos quebrados que possam ter sobrado ──────────
  // Ex: /%} que ficou solto após edição manual parcial
  content = content.replace(/\s*\/%\}\s*/g, ' ');

  // ── Passo 3: Remover possíveis {% AmazonButton sem fechamento ────────────
  content = content.replace(/\{%\s*AmazonButton[^%]*$/gm, '');

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
