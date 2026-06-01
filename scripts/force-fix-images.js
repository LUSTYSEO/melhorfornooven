import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsDir = path.join(__dirname, '../src/content/posts');
const publicDir = path.join(__dirname, '../public');
const uploadsDir = path.join(publicDir, 'wp-content/uploads');

function findPhysicalImages(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findPhysicalImages(fullPath, list);
    } else if (/\.(jpe?g|png|webp|gif)$/i.test(file)) {
      list.push(fullPath);
    }
  });
  return list;
}

const physicalImages = findPhysicalImages(uploadsDir);
console.log(`Encontradas ${physicalImages.length} imagens físicas no disco.`);

const postFiles = fs.readdirSync(postsDir).filter(file => file.endsWith('.mdoc') || file.endsWith('.md'));

postFiles.forEach(file => {
  const filePath = path.join(postsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const slug = path.basename(file, path.extname(file));

  const fmMatch = content.match(/^---([\s\S]+?)---/);
  if (!fmMatch) return;

  const frontmatter = fmMatch[1];
  
  let targetImage = null;
  const bodyImgMatch = content.replace(fmMatch[0], '').match(/!\[.*?\]\((.*?)\)/);
  if (bodyImgMatch) {
    const bodyImgPath = bodyImgMatch[1];
    const normalizedBodyPath = bodyImgPath.replace(/^\//, '').replace(/\\/g, '/').toLowerCase();
    const match = physicalImages.find(img => {
      const rel = img.replace(publicDir, '').replace(/\\/g, '/').replace(/^\//, '').toLowerCase();
      return rel === normalizedBodyPath || path.basename(img).toLowerCase() === path.basename(bodyImgPath).toLowerCase();
    });
    if (match) {
      targetImage = match.replace(publicDir, '').replace(/\\/g, '/');
    }
  }

  if (!targetImage) {
    const match = physicalImages.find(img => path.basename(img).toLowerCase().includes(slug.toLowerCase()));
    if (match) {
      targetImage = match.replace(publicDir, '').replace(/\\/g, '/');
    }
  }

  if (targetImage) {
    if (!targetImage.startsWith('/')) {
      targetImage = '/' + targetImage;
    }

    let updatedFm = frontmatter;
    if (frontmatter.includes('thumbnail:')) {
      // Support both \n and \r\n line endings
      updatedFm = frontmatter.replace(/thumbnail:\s*["']?.*?["']?\r?\n/, `thumbnail: "${targetImage}"\n`);
    } else {
      updatedFm = frontmatter + `thumbnail: "${targetImage}"\n`;
    }

    const newContent = content.replace(frontmatter, updatedFm);
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✓ Post [${file}] atualizado com a imagem exata: ${targetImage}`);
  } else {
    console.log(`✗ Não foi possível encontrar imagem correspondente para o post [${file}]`);
  }
});
