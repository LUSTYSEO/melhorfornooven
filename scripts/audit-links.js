import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsDir = path.join(__dirname, '../src/content/posts');
const pagesDir = path.join(__dirname, '../src/content/pages');

// 1. Mapear todos os slugs reais (arquivos que existem)
const allRealSlugs = [];
[postsDir, pagesDir].forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      if (file.endsWith('.md') || file.endsWith('.mdoc')) {
        allRealSlugs.push(file.replace(/\.mdoc?$/, ''));
      }
    });
  }
});

console.log(`Mapeados ${allRealSlugs.length} slugs reais no projeto.`);

// Mapeamento manual para slugs de páginas de produto que não existem mais
// Redireciona para o post de comparação/análise mais próximo que existe
const manualRedirects = {
  // Electrolux
  '/electrolux-eaf90-ritalobo-12-litros': '/melhor-air-fryer-oven-electrolux',
  '/electrolux-eaf91-rita-lobo':          '/melhor-air-fryer-oven-electrolux',
  '/eletrolux-eaf51-5l':                  '/melhor-air-fryer-oven-electrolux',
  '/elextrolux-eaf20':                    '/melhor-air-fryer-oven-electrolux',
  '/electrolux-eaf10':                    '/melhor-air-fryer-oven-electrolux',
  // Oster
  '/forno-oven-oster-25l-ofor25':         '/air-fryer-oven-oster',
  '/oster-ofrt90-mult-touch':             '/air-fryer-oven-oster',
  '/oster-fritadeira-super-fryer-10l-3-em-1': '/air-fryer-oven-oster',
  // Britânia
  '/airfrye-oven-britania-16l-baf16':     '/air-fryer-britania-e-boa',
  '/airfryer-britania-5l-brf50':          '/air-fryer-britania-e-boa',
  '/britania-3l-bfr31':                   '/air-fryer-britania-e-boa',
  '/bella-cuccina-oven-bcfr02':           '/air-fryer-britania-e-boa',
  // Mondial
  '/airfrier-mondial-12l-analogica':      '/air-fryer-oven-mondial',
  '/mondial-forno-oven-25litros':         '/air-fryer-oven-mondial',
  '/airfryer-mondial-afon-12l-vermelha':  '/air-fryer-oven-mondial',
  // Philco
  '/airfryer-philco-40-litros-pfe40l':    '/air-fryer-oven-philco',
  '/air-fryer-philco-11l':                '/air-fryer-oven-philco',
  // Philips Walita
  '/airfryer-philips-serie-5000':         '/air-fryer-philips-walita-e-boa',
  '/airfryer-philips-xl-digital-ri9270':  '/air-fryer-philips-walita-e-boa',
  '/airfryer-philips-serie-300-ri9252':   '/air-fryer-philips-walita-e-boa',
  '/airfryer-philips-serie-300-ri9201':   '/air-fryer-philips-walita-e-boa',
  '/airfryer-philips-serie-1000-xl':      '/air-fryer-philips-walita-e-boa',
  // WAP
  '/wap-12litros-oven':                   '/air-fryer-wap-e-boa',
  '/wap-air-frier-barbecue':              '/air-fryer-wap-e-boa',
  '/wap-air-fryer-mega-famiy':            '/air-fryer-wap-e-boa',
  // Formas silicone (produtos)
  '/panela-silicone-quadrada-airfryer':         '/forma-de-silicone-para-air-fryer-oven',
  '/kit-2-formas-de-silicone-airfryer':         '/forma-de-silicone-para-air-fryer-oven',
  '/kit-5-formas-de-silicone-airfryer-microondas': '/forma-de-silicone-para-air-fryer-oven',
  '/tapete-silicone-airfryer':                  '/forma-de-silicone-para-air-fryer-oven',
};

// Função para achar o slug mais parecido (fallback automático)
function findBestMatch(brokenSlug) {
  // Checa o mapeamento manual primeiro
  if (manualRedirects[`/${brokenSlug}`]) {
    return manualRedirects[`/${brokenSlug}`];
  }

  const cleanBroken = brokenSlug.replace(/^\//, '').toLowerCase();
  
  // Tenta encontrar se o arquivo real contém grande parte do link quebrado (ou vice-versa)
  const bestMatch = allRealSlugs.find(realSlug => {
    const cleanReal = realSlug.toLowerCase();
    return cleanReal.includes(cleanBroken) || cleanBroken.includes(cleanReal) || 
           cleanReal.replace(/-/g, '') === cleanBroken.replace(/-/g, '');
  });
  
  return bestMatch ? `/${bestMatch}` : null;
}

// 2. Corrigir os arquivos
let totalFixed = 0;

[postsDir, pagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') || f.endsWith('.mdoc'));
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let fileChanged = false;

    // Busca links markdown no formato [texto](/link) e [![alt](img)](/link)
    const linkRegex = /\[([^\]]+)\]\((\/[^\)]+)\)/g;
    
    content = content.replace(linkRegex, (match, text, url) => {
      // Ignora links de imagens ou assets (com extensão de arquivo)
      if (url.includes('.')) return match;

      // Ignora âncoras
      if (url.startsWith('/#')) return match;
      
      const slugToCheck = url.replace(/^\//, ''); // tira a barra
      if (!allRealSlugs.includes(slugToCheck)) {
        // Link quebrado encontrado!
        const fixedUrl = findBestMatch(slugToCheck);
        if (fixedUrl) {
          console.log(`✓ Corrigido em [${file}]: ${url} -> ${fixedUrl}`);
          fileChanged = true;
          totalFixed++;
          return `[${text}](${fixedUrl})`;
        } else {
          console.log(`⚠️ Sem salvação em [${file}]: ${url}`);
        }
      }
      return match;
    });

    if (fileChanged) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  });
});

console.log(`\nAuditoria concluída! ${totalFixed} links quebrados foram corrigidos.`);
