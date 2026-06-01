import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDirectories = [
  path.join(__dirname, '../src/content/posts'),
  path.join(__dirname, '../src/content/pages')
];

targetDirectories.forEach(dir => {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir).filter(file => file.endsWith('.mdoc') || file.endsWith('.md'));

  files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace "/wp-contentuploads/" with "/wp-content/uploads/"
    const wrongPattern = /\/wp-contentuploads\//g;
    if (wrongPattern.test(content)) {
      const newContent = content.replace(wrongPattern, '/wp-content/uploads/');
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✓ [${file}]: Corrigidos caminhos de imagem.`);
    }
  });
});
