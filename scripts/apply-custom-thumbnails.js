import fs from 'fs';
import path from 'path';

const postsDir = './src/content/posts';

// Dicionário atualizado com as novas adições do usuário
const updates = {
  "melhor-air-fryer-oven.mdoc": "/wp-content/uploads/2025/09/melhor-air-fryer-oven-1.jpg",
  "receitas-para-air-fryer-oven.mdoc": "/wp-content/uploads/2025/09/50-receitas-para-Air-Fryer-Oven.jpg",
  "forma-de-silicone-para-air-fryer-oven.mdoc": "/wp-content/uploads/2025/11/como-usar-forma-de-silicone-air-fryer-oven.jpg.webp",
  "air-fryer-oven-oster.mdoc": "/wp-content/uploads/2025/09/air-fryer-oven-oster-e-boa-analise.jpg",
  "batata-frita-na-air-fryer-oven.mdoc": "/wp-content/uploads/2025/09/air-fryer-oven-oster-e-boa-analise.jpg",
  "melhor-air-fryer-oven-espeto-giratorio.mdoc": "/wp-content/uploads/2025/11/melhor-air-fryer-oven-espeto-giratorio-frango-assado.webp",
  "como-usar-o-espeto-giratorio-air-fryer-oster.mdoc": "/wp-content/uploads/2026/01/como-usar-espeto-giratorio-air-fryer-oster.webp",
  "air-fryer-oven-com-espeto-giratorio.mdoc": "/wp-content/uploads/2025/09/air-fryer-oven-espeto-giratorio.webp"
};

Object.entries(updates).forEach(([filename, newImage]) => {
  // Testa tanto para .mdoc quanto para .md
  let filePath = path.join(postsDir, filename);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(postsDir, filename.replace('.mdoc', '.md'));
  }
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Substitui a linha do thumbnail mantendo o formato correto
    const updatedContent = content.replace(/thumbnail:\s*["'].*?["']/, `thumbnail: "${newImage}"`);
    
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`✓ Thumbnail atualizado: ${filename}`);
  } else {
    console.log(`✗ ARQUIVO NÃO ENCONTRADO: ${filename}`);
  }
});
