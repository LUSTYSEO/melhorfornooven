import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const tasks = [
  {
    type: 'resize',
    input: 'public/wp-content/uploads/2026/03/diferenca-espeto-giratorio-vs-cesto-air-fryer.jpg.webp',
    output: 'public/wp-content/uploads/2026/03/diferenca-espeto-giratorio-vs-cesto-air-fryer.jpg.webp',
    maxWidth: 640,
    quality: 80
  },
  {
    type: 'convert',
    input: 'public/wp-content/uploads/2025/09/air-fryer-oven-philco-analise-modelo.jpg',
    output: 'public/wp-content/uploads/2025/09/air-fryer-oven-philco-analise-modelo.webp',
    maxWidth: 720,
    quality: 80,
    oldExtUrl: '/wp-content/uploads/2025/09/air-fryer-oven-philco-analise-modelo.jpg',
    newExtUrl: '/wp-content/uploads/2025/09/air-fryer-oven-philco-analise-modelo.webp'
  },
  {
    type: 'resize',
    input: 'public/wp-content/uploads/2025/11/melhor-air-fryer-oven-espeto-giratorio-frango-assado.webp',
    output: 'public/wp-content/uploads/2025/11/melhor-air-fryer-oven-espeto-giratorio-frango-assado.webp',
    maxWidth: 680,
    quality: 80
  },
  {
    type: 'convert',
    input: 'public/wp-content/uploads/2025/09/air-fryer-oven-oster-ofrt790-digital.jpg',
    output: 'public/wp-content/uploads/2025/09/air-fryer-oven-oster-ofrt790-digital.webp',
    maxWidth: 640,
    quality: 80,
    oldExtUrl: '/wp-content/uploads/2025/09/air-fryer-oven-oster-ofrt790-digital.jpg',
    newExtUrl: '/wp-content/uploads/2025/09/air-fryer-oven-oster-ofrt790-digital.webp'
  }
];

function walkDir(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.vercel' && file !== 'dist') {
        walkDir(fullPath, fileList);
      }
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

async function run() {
  console.log('--- Iniciando otimização de imagens ---');

  for (const task of tasks) {
    const inPath = path.join(rootDir, task.input);
    const outPath = path.join(rootDir, task.output);

    if (!fs.existsSync(inPath)) {
      console.warn(`[AVISO] Arquivo não encontrado: ${task.input}`);
      continue;
    }

    const beforeStat = fs.statSync(inPath);
    const inBuffer = fs.readFileSync(inPath);
    
    const transformed = await sharp(inBuffer)
      .resize({ width: task.maxWidth, withoutEnlargement: true })
      .webp({ quality: task.quality })
      .toBuffer();

    fs.writeFileSync(outPath, transformed);
    const afterStat = fs.statSync(outPath);

    console.log(`✓ Processado: ${task.input} -> ${task.output}`);
    console.log(`  Tamanho original: ${(beforeStat.size / 1024).toFixed(1)} KB -> Novo tamanho: ${(afterStat.size / 1024).toFixed(1)} KB`);

    if (task.oldExtUrl && task.newExtUrl) {
      console.log(`  Atualizando referências no código: ${task.oldExtUrl} -> ${task.newExtUrl}`);
      const codeFiles = walkDir(path.join(rootDir, 'src'));
      let modifiedCount = 0;
      for (const file of codeFiles) {
        if (file.endsWith('.astro') || file.endsWith('.mdoc') || file.endsWith('.md') || file.endsWith('.yaml') || file.endsWith('.json') || file.endsWith('.js') || file.endsWith('.ts')) {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes(task.oldExtUrl)) {
            const updated = content.replaceAll(task.oldExtUrl, task.newExtUrl);
            fs.writeFileSync(file, updated, 'utf8');
            console.log(`    Modificado: ${path.relative(rootDir, file)}`);
            modifiedCount++;
          }
        }
      }
      console.log(`  Total de arquivos atualizados: ${modifiedCount}`);
    }
  }

  console.log('--- Otimização concluída com sucesso ---');
}

run().catch(err => {
  console.error('Erro na otimização:', err);
  process.exit(1);
});
