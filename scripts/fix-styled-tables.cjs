const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../src/content/posts');

// Fix melhor-air-fryer-oven-ate-500-reais.mdoc
// Remove the duplicate paragraph (line 27) and the HTML table (line 29)
// Keep the Markdown table that's already there (lines 31-36)
const file1 = path.join(postsDir, 'melhor-air-fryer-oven-ate-500-reais.mdoc');
if (fs.existsSync(file1)) {
  let content = fs.readFileSync(file1, 'utf8');
  
  // Remove the duplicate paragraph
  content = content.replace(
    /Para quem gosta de ir direto ao ponto, aqui está um resumo rápido das nossas principais escolhas que cabem no seu bolso\.\r?\n\r?\nPara quem gosta de ir direto ao ponto, aqui está um resumo rápido das nossas principais escolhas que cabem no seu bolso\./,
    'Para quem gosta de ir direto ao ponto, aqui está um resumo rápido das nossas principais escolhas que cabem no seu bolso.'
  );
  
  // Remove the HTML table line (starts with <table style= and ends with </table>)
  content = content.replace(/\r?\n<table style="[^"]*">[^\n]*<\/table>\r?\n/g, '\n');
  
  fs.writeFileSync(file1, content, 'utf8');
  console.log('✅ Fixed: melhor-air-fryer-oven-ate-500-reais.mdoc');
} else {
  console.log('⚠️ File not found: melhor-air-fryer-oven-ate-500-reais.mdoc');
}

// Scan ALL .mdoc files for any remaining <table style= patterns
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdoc'));
let otherFilesFound = [];

files.forEach(file => {
  if (file === 'melhor-air-fryer-oven-ate-500-reais.mdoc') return; // already handled
  
  const filePath = path.join(postsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('<table style=')) {
    otherFilesFound.push(file);
  }
});

if (otherFilesFound.length > 0) {
  console.log('\n⚠️ Other files with <table style=> found:');
  otherFilesFound.forEach(f => console.log(`  - ${f}`));
} else {
  console.log('\n✅ No other files with styled HTML tables found.');
}

console.log('\nDone!');
