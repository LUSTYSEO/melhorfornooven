import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');
const contentDirs = [
  path.join(__dirname, '../src/content/posts'),
  path.join(__dirname, '../src/content/pages')
];

// Helper to recursively walk a directory and list all files
function walkDir(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

// Promise wrapper for downloading a file
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;

    client.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error(`Status: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  // 1. Get all physical files in public/wp-content
  const wpContentDir = path.join(publicDir, 'wp-content');
  const physicalFiles = [];
  walkDir(wpContentDir, physicalFiles);

  // Create a map of lowercase relative path to actual cased relative path
  const physicalFilesMap = new Map();
  function updatePhysicalFilesMap() {
    physicalFilesMap.clear();
    const currentFiles = [];
    walkDir(wpContentDir, currentFiles);
    for (const filePath of currentFiles) {
      const relativePath = '/' + path.relative(publicDir, filePath).replace(/\\/g, '/');
      physicalFilesMap.set(relativePath.toLowerCase(), relativePath);
    }
  }
  
  updatePhysicalFilesMap();
  console.log(`Mapeados ${physicalFilesMap.size} arquivos físicos locais em public/wp-content.`);

  // We will collect all files and their contents
  const filesToProcess = [];
  for (const dir of contentDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = walkDir(dir).filter(f => f.endsWith('.md') || f.endsWith('.mdoc'));
    for (const file of files) {
      filesToProcess.push({
        path: file,
        name: path.basename(file),
        content: fs.readFileSync(file, 'utf8')
      });
    }
  }

  console.log(`Encontrados ${filesToProcess.length} arquivos de conteúdo para análise.`);

  // Find all unique wp-content URLs in all files
  const uniqueUrls = new Set();
  const genericWpContentRegex = /((?:["']|\())([^"'\s()]*wp-content[^"'\s()]*?)((?:["']|\)))/g;

  for (const fileObj of filesToProcess) {
    let match;
    while ((match = genericWpContentRegex.exec(fileObj.content)) !== null) {
      const prefix = match[1];
      const url = match[2];
      const suffix = match[3];
      if ((prefix === '(' && suffix === ')') || (prefix !== '(' && suffix !== ')')) {
        uniqueUrls.add(url);
      }
    }
  }

  console.log(`Identificados ${uniqueUrls.size} links únicos do wp-content nas páginas/posts.`);

  // Analyze and download missing ones
  const urlMapping = new Map(); // originalUrl -> fixedUrl

  for (const url of uniqueUrls) {
    let normalized = url;
    
    // Remove domain
    const domainRegex = /^https?:\/\/(?:www\.)?melhorfornooven\.com\.br(\/wp-content\/.*)/i;
    const match = normalized.match(domainRegex);
    if (match) {
      normalized = match[1];
    }

    if (!normalized.startsWith('/wp-content/')) {
      urlMapping.set(url, url);
      continue;
    }

    let decodedPath;
    try {
      decodedPath = decodeURIComponent(normalized);
    } catch (e) {
      decodedPath = normalized;
    }

    const lowercased = decodedPath.toLowerCase();

    // Check if exists physically in local map
    if (physicalFilesMap.has(lowercased)) {
      urlMapping.set(url, physicalFilesMap.get(lowercased));
      continue;
    }

    // Check if it's a WordPress resized suffix
    const suffixRegex = /-\d+x\d+(\.[a-zA-Z0-9]+)$/;
    if (suffixRegex.test(lowercased)) {
      const strippedLower = lowercased.replace(suffixRegex, '$1');
      if (physicalFilesMap.has(strippedLower)) {
        const correctCased = physicalFilesMap.get(strippedLower);
        console.log(`[Resized Map] "${url}" -> "${correctCased}" (usando original local)`);
        urlMapping.set(url, correctCased);
        continue;
      }
    }

    // If we reach here, the file does not exist locally. Let's try downloading it!
    console.log(`\n[Download] Arquivo não encontrado localmente: "${normalized}"`);
    const localDestPath = path.join(publicDir, decodedPath);
    const localDestDir = path.dirname(localDestPath);
    if (!fs.existsSync(localDestDir)) {
      fs.mkdirSync(localDestDir, { recursive: true });
    }

    const liveUrl = `https://melhorfornooven.com.br${normalized}`;
    
    // First try downloading the sized file
    try {
      console.log(`  Tentando baixar arquivo com tamanho: ${liveUrl}`);
      await downloadFile(liveUrl, localDestPath);
      console.log(`  ✓ Baixado com sucesso!`);
      updatePhysicalFilesMap();
      urlMapping.set(url, physicalFilesMap.get(lowercased) || normalized);
      continue;
    } catch (err) {
      console.log(`  ✗ Falha ao baixar arquivo com tamanho: ${err.message}`);
    }

    // If sized file download failed, try stripping size and downloading original
    if (suffixRegex.test(lowercased)) {
      const strippedNormalized = normalized.replace(suffixRegex, '$1');
      const strippedDecoded = decodedPath.replace(suffixRegex, '$1');
      const strippedLower = strippedDecoded.toLowerCase();
      const strippedDestPath = path.join(publicDir, strippedDecoded);
      const strippedLiveUrl = `https://melhorfornooven.com.br${strippedNormalized}`;

      try {
        console.log(`  Tentando baixar original: ${strippedLiveUrl}`);
        await downloadFile(strippedLiveUrl, strippedDestPath);
        console.log(`  ✓ Baixado original com sucesso!`);
        updatePhysicalFilesMap();
        urlMapping.set(url, physicalFilesMap.get(strippedLower) || strippedNormalized);
        continue;
      } catch (err) {
        console.log(`  ✗ Falha ao baixar original: ${err.message}`);
      }
    }

    // If everything failed, keep normalized but warn
    console.warn(`  ⚠ Não foi possível resolver ou baixar o arquivo para: "${url}"`);
    urlMapping.set(url, normalized);
  }

  // 3. Perform replacements in files
  console.log(`\nIniciando atualizações nos arquivos de conteúdo...`);
  let filesUpdatedCount = 0;

  for (const fileObj of filesToProcess) {
    let content = fileObj.content;
    let hasChanges = false;

    content = content.replace(genericWpContentRegex, (match, prefix, url, suffix) => {
      if ((prefix === '(' && suffix !== ')') || (prefix !== '(' && suffix === ')')) {
        return match;
      }

      if (urlMapping.has(url)) {
        const replacement = urlMapping.get(url);
        if (replacement !== url) {
          hasChanges = true;
          return `${prefix}${replacement}${suffix}`;
        }
      }
      return match;
    });

    if (hasChanges) {
      fs.writeFileSync(fileObj.path, content, 'utf8');
      console.log(`✓ Atualizado: ${fileObj.name}`);
      filesUpdatedCount++;
    }
  }

  console.log(`\nPronto! Total de arquivos modificados: ${filesUpdatedCount}`);
}

run().catch(err => {
  console.error("Erro na execução do script:", err);
});
