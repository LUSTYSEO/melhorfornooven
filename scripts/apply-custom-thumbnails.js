import fs from 'fs';
import path from 'path';

const postsDir = './src/content/posts';

// O Dicionário de Curadoria feito pelo usuário
const updates = {
  "air-fryer-wap-e-boa.mdoc": "/wp-content/uploads/2025/11/air-fryer-wap-e-boa-modelos.webp",
  "melhor-air-fryer-oven-custo-beneficio.mdoc": "/wp-content/uploads/2025/11/melhor-air-fryer-oven-custo-beneficio-comparativo.webp",
  "onde-comprar-air-fryer-oven.mdoc": "/wp-content/uploads/2025/10/mulher-indecisa-escolhendo-air-fryer-loja.webp",
  "melhor-air-fryer-oven-electrolux.mdoc": "/wp-content/uploads/2025/10/air-fryer-electrolux-e-boa.jpg",
  "air-fryer-britania-e-boa.mdoc": "/wp-content/uploads/2025/10/air-fryer-britania-e-boa.jpg",
  "air-fryer-oven-philco-pfr2200p-e-boa.mdoc": "/wp-content/uploads/2025/10/air-fryer-oven-philco-pfr2200p-review-analise.webp",
  "air-fryer-oven-mondial.mdoc": "/wp-content/uploads/2025/09/air-fryer-oven-mondial-analise-completa.jpg",
  "air-fryer-oven-oster.mdoc": "/wp-content/uploads/2025/11/air-fryer-oven-oster-e-boa-analise.jpg",
  "air-fryer-oven-philco.mdoc": "/wp-content/uploads/2025/09/air-fryer-oven-philco-analise-modelo.jpg",
  "air-fryer-oven.mdoc": "/wp-content/uploads/2025/09/melhor-air-fryer-oven-multifuncional.webp",
  "pode-usar-forma-de-aluminio-na-air-fryer-oven.mdoc": "/wp-content/uploads/2025/10/pode-usar-forma-de-aluminio-na-air-fryer-oven.webp",
  "air-fryer-oven-com-espeto-giratorio.mdoc": "/wp-content/uploads/2025/09/air-fryer-oven-espeto-giratorio.webp"
};

Object.entries(updates).forEach(([filename, newImage]) => {
  const filePath = path.join(postsDir, filename);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Substitui a linha do thumbnail mantendo o formato correto
    const updatedContent = content.replace(/thumbnail:\s*["'].*?["']/, `thumbnail: "${newImage}"`);
    
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`✓ Thumbnail atualizado: ${filename}`);
  } else {
    console.log(`✗ ARQUIVO NÃO ENCONTRADO: ${filename} (Verifique se a extensão é .md ou .mdoc)`);
  }
});
