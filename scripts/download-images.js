import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const xmlPath = path.join(__dirname, '../data/migracao/melhorfornooven.WordPress.2026-05-24.xml');
const baseOutputDir = path.join(__dirname, '../public');

if (!fs.existsSync(xmlPath)) {
  console.error('Arquivo XML não encontrado em: ' + xmlPath);
  process.exit(1);
}

const xmlContent = fs.readFileSync(xmlPath, 'utf8');
const attachmentRegex = /<wp:attachment_url><!\[CDATA\[(https?:\/\/[^\]]+)\]\]><\/wp:attachment_url>/g;
let match;
const urls = [];

while ((match = attachmentRegex.exec(xmlContent)) !== null) {
  urls.push(match[1]);
}

console.log(`Encontradas ${urls.length} imagens no XML. Iniciando downloads...`);

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;

    client.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Status: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function start() {
  for (const url of urls) {
    try {
      const urlPath = new URL(url).pathname;
      const destPath = path.join(baseOutputDir, urlPath);
      const destDir = path.dirname(destPath);

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      console.log(`Baixando: ${urlPath}...`);
      await download(url, destPath);
      console.log(`✓ Salvo com sucesso!`);
    } catch (err) {
      console.error(`✗ Erro ao baixar: ${err.message}`);
    }
  }
  console.log('Todos os downloads concluídos!');
}

start();
