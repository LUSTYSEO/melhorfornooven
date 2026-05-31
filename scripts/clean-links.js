import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDirectories = [
  path.join(__dirname, '../src/content/posts'),
  path.join(__dirname, '../src/content/pages')
];

const linkRegex = /https?:\/\/(?:[a-zA-Z0-9.-]+\.)?(?:melhorfornooven\.com\.br|melhorfornooven\.vercel\.app)\/([a-zA-Z0-9_-]+)\/?/g;

targetDirectories.forEach(dir => {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir).filter(file => file.endsWith('.mdoc') || file.endsWith('.md'));

  files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let replacedCount = 0;

    const newContent = content.replace(linkRegex, (match, slug) => {
      replacedCount++;
      return `/${slug}`;
    });

    if (replacedCount > 0) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✓ [${file}]: Corrigidos ${replacedCount} links.`);
    }
  });
});
