import fs from 'fs';
import path from 'path';
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

// Function to check if a URL is the author's photo (Gravatar link)
function isAuthorPhoto(url) {
  if (!url) return false;
  // The Gravatar placeholder URL is the author's photo used across the articles
  return url.includes('gravatar.com');
}

// Helper to clean WordPress size suffixes from a filename (e.g. -1024x683)
function cleanImageName(filename) {
  // Strip extension
  let name = filename.replace(/\.[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)?$/gi, '');
  // Strip sizing suffix like -1024x683 or -150x150
  const sizeSuffixRegex = /-\d+x\d+$/i;
  name = name.replace(sizeSuffixRegex, '');
  return name;
}

// Clean and normalize a token (lowercase, fix typos)
function normalizeToken(token) {
  return token.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/airfyer/g, 'airfryer');
}

// Extract tokens from a string (slug or filename)
function getTokens(str) {
  if (!str) return [];
  // Split by non-alphanumeric characters, hyphens, underscores, or spaces
  const rawTokens = str.split(/[-_\s.]+/);
  const tokens = [];
  
  for (let i = 0; i < rawTokens.length; i++) {
    const tok = normalizeToken(rawTokens[i]);
    if (tok.length > 0) {
      if (tok === 'airfryer') {
        tokens.push('air');
        tokens.push('fryer');
        tokens.push('airfryer');
      } else {
        tokens.push(tok);
      }
    }
  }
  
  // Add combined token for 'air' and 'fryer' if they appear consecutively
  for (let i = 0; i < tokens.length - 1; i++) {
    if (tokens[i] === 'air' && tokens[i+1] === 'fryer') {
      tokens.push('airfryer');
    }
  }
  
  return [...new Set(tokens)]; // return unique tokens
}

// Calculate similarity score between a post slug and an image using token Jaccard similarity and unique keyword bonuses
function calculateMatchScore(slug, imageCleanedName) {
  const slugLower = slug.toLowerCase();
  const imgLower = imageCleanedName.toLowerCase();
  
  if (slugLower === imgLower) {
    return 1000; // Absolute perfect match
  }
  
  const slugTokens = getTokens(slug);
  const imgTokens = getTokens(imageCleanedName);
  
  // Portuguese stop words to ignore in matching
  const stopWords = new Set(['de', 'do', 'da', 'o', 'a', 'os', 'as', 'em', 'um', 'uma', 'e', 'ou', 'se', 'por', 'na', 'no', 'nas', 'nos', 'com', 'para', 'que', 'ao', 'aos', 'entre']);
  
  const cleanedSlugTokens = slugTokens.filter(t => !stopWords.has(t));
  const cleanedImgTokens = imgTokens.filter(t => !stopWords.has(t));
  
  if (cleanedSlugTokens.length === 0) return 0;
  
  // Words that are too generic to trigger unique topic matches
  const genericSubjectWords = new Set(['air', 'fryer', 'oven', 'airfryer']);
  
  let matchCount = 0;
  let hasUniqueMatch = false;
  
  for (const token of cleanedSlugTokens) {
    if (cleanedImgTokens.includes(token)) {
      matchCount++;
      if (!genericSubjectWords.has(token)) {
        hasUniqueMatch = true;
      }
    }
  }
  
  if (matchCount > 0) {
    // Jaccard-like similarity: intersection / union of cleaned tokens
    const unionSize = new Set([...cleanedSlugTokens, ...cleanedImgTokens]).size;
    let score = (matchCount / unionSize) * 100;
    
    // Add a massive bonus if we matched a highly specific topic keyword
    if (hasUniqueMatch) {
      score += 200;
    }
    
    return score;
  }
  
  return 0;
}

async function run() {
  const isWriteMode = process.argv.includes('--write');
  console.log(`Modo: ${isWriteMode ? 'ESCRITA (Alterando arquivos)' : 'DRY-RUN (Simulação)'}`);

  // 1. Map all physical image files in public/wp-content/uploads/
  const uploadsDir = path.join(publicDir, 'wp-content/uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.error(`Erro: Diretório ${uploadsDir} não existe.`);
    return;
  }

  const allFiles = walkDir(uploadsDir);
  const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']);
  const physicalImages = allFiles.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return imageExtensions.has(ext);
  }).map(file => {
    const relativePath = '/' + path.relative(publicDir, file).replace(/\\/g, '/');
    const filename = path.basename(file);
    const cleanedName = cleanImageName(filename);
    const hasSizeSuffix = /-\d+x\d+(\.[a-zA-Z0-9]+)?$/.test(filename);
    return {
      absolutePath: file,
      relativePath,
      filename,
      cleanedName,
      hasSizeSuffix
    };
  });

  console.log(`Mapeadas ${physicalImages.length} imagens físicas em public/wp-content/uploads/`);

  // 2. Read all files in src/content/posts/ and src/content/pages/
  const contentFiles = [];
  for (const dir of contentDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = walkDir(dir).filter(f => f.endsWith('.md') || f.endsWith('.mdoc'));
    for (const file of files) {
      contentFiles.push({
        absolutePath: file,
        filename: path.basename(file),
        slug: path.basename(file, path.extname(file)),
        content: fs.readFileSync(file, 'utf8')
      });
    }
  }

  console.log(`Lidos ${contentFiles.length} arquivos de conteúdo.`);

  let matchCount = 0;
  let updateCount = 0;
  let skippedCount = 0;

  for (const fileObj of contentFiles) {
    const { content, slug, filename } = fileObj;
    
    // Parse frontmatter
    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatterMatch) {
      console.warn(`[Aviso] Frontmatter não encontrado no arquivo: ${filename}`);
      continue;
    }

    const frontmatterBlock = frontmatterMatch[1];
    
    // Extract thumbnail
    const thumbnailMatch = frontmatterBlock.match(/thumbnail:\s*["']?([^"\n\r']*)["']?/);
    const currentThumbnail = thumbnailMatch ? thumbnailMatch[1] : null;

    // Check if the current thumbnail is already different from the author's photo (or doesn't exist)
    if (!currentThumbnail || !isAuthorPhoto(currentThumbnail)) {
      skippedCount++;
      continue;
    }

    // Try to find the best matching physical image
    let bestMatch = null;
    let highestScore = 0;

    for (const img of physicalImages) {
      const score = calculateMatchScore(slug, img.cleanedName);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = img;
      } else if (score === highestScore && score > 0 && bestMatch) {
        // Tie-breaker logic:
        // 1. Prefer image without sizing suffix (original)
        if (bestMatch.hasSizeSuffix && !img.hasSizeSuffix) {
          bestMatch = img;
        }
        // 2. Prefer the shorter relative path/filename
        else if (bestMatch.hasSizeSuffix === img.hasSizeSuffix) {
          if (img.relativePath.length < bestMatch.relativePath.length) {
            bestMatch = img;
          }
        }
      }
    }

    // Threshold score to accept a match
    const MATCH_THRESHOLD = 30;

    if (bestMatch && highestScore >= MATCH_THRESHOLD) {
      matchCount++;
      console.log(`\n[Match Inteligente] Post: "${slug}"`);
      console.log(`  Thumbnail atual: ${currentThumbnail}`);
      console.log(`  Nova imagem encontrada: ${bestMatch.relativePath} (Score: ${highestScore.toFixed(1)})`);

      if (isWriteMode) {
        // Update frontmatter content
        let updatedFrontmatter = frontmatterBlock;
        if (thumbnailMatch) {
          // Replace existing thumbnail
          updatedFrontmatter = frontmatterBlock.replace(
            /thumbnail:\s*["']?([^"\n\r']*)["']?/,
            `thumbnail: "${bestMatch.relativePath}"`
          );
        } else {
          // Append thumbnail if not present
          updatedFrontmatter = frontmatterBlock + `\nthumbnail: "${bestMatch.relativePath}"`;
        }

        // Reconstruct the file content
        const updatedContent = content.replace(
          /^---\r?\n([\s\S]*?)\r?\n---/,
          `---\n${updatedFrontmatter}\n---`
        );

        fs.writeFileSync(fileObj.absolutePath, updatedContent, 'utf8');
        console.log(`  ✓ Arquivo ${filename} atualizado com sucesso!`);
        updateCount++;
      }
    } else {
      console.log(`\n[Sem Match] Post: "${slug}"`);
      console.log(`  Thumbnail atual: ${currentThumbnail}`);
      console.log(`  Nenhuma imagem física compatível encontrada (Score máximo: ${highestScore.toFixed(1)}).`);
    }
  }

  console.log(`\n==================================================`);
  console.log(`RELATÓRIO FINAL:`);
  console.log(`- Total de posts analisados: ${contentFiles.length}`);
  console.log(`- Posts com thumbnail correto já definido (ignorados): ${skippedCount}`);
  console.log(`- Matches inteligentes encontrados: ${matchCount}`);
  if (isWriteMode) {
    console.log(`- Arquivos atualizados fisicamente: ${updateCount}`);
  } else {
    console.log(`- (Nenhum arquivo foi alterado. Rode com o argumento --write para aplicar as alterações)`);
  }
  console.log(`==================================================`);
}

run().catch(err => {
  console.error("Erro na execução do script:", err);
});
