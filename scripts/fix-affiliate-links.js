import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '..', 'src', 'content', 'posts');

const PRODUCT_LINKS = {
  'BAF16A': 'https://amzn.to/4eczJtD',
  'BFR50': 'https://amzn.to/4dT97ib',
  'BCFR05': 'https://amzn.to/43PsBOP',
  'BFR31': 'https://amzn.to/43S6yXO',
  'OFOR250': 'https://amzn.to/4erb8SX',
  'OFRT790': 'https://amzn.to/4e5hgz3',
  'OFRT660': 'https://amzn.to/3RNJHdm',
  'AFO-12L-BI': 'https://amzn.to/3S88sRr',
  'PFE40I': 'https://amzn.to/43PtcA3',
  'PFR2000P': 'https://www.amazon.com.br/Fritadeira-Oven-PFR2200P-Philco-127v/dp/B08R93TVRG?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2ED0R0D5LX984&dib=eyJ2IjoiMSJ9.L8XloE6oIMGo_8vhJpsamxJZJPTdzPYLqFAp9Q7Czv3scpc4KlIMZjcQJfpMBxld1wjDd6It1hSnVGQtqSzHOwbkcLtCh48VJfzxrfPJKLbVZJ8SQ-Mgu5vs3YFrDd8-xR7Fs6s3fj8SzkxkhrjLwqpH9eU2RRnFmP53oEfIWZbEMr7xII3P8gSGm7yzyxRCCG7MrdCNkG2HAjtA-Oh9uYLWA88E9-XkdH1y_Szt_Sw_nDoikJFExos8QDFrfDG3y2Cjnz_fcpe0l2kglpaIFy8vti3qA8nuADtTsZRAEds.OBo0bk-utZF50yhvoCNy9Z7QjgxuO7Z_nf0IX38yyAA&dib_tag=se&keywords=Brit%C3%A2nia%2BOven%2BBAF16A%2B%2816L%29&qid=1780749340&sprefix=brit%C3%A2nia%2Boven%2Bbaf16a%2B16l%2B%2Caps%2C213&sr=8-1-spons&ufe=app_do%3Aamzn1.fos.25548f35-0de7-44b3-b28e-0f56f3f96147&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&linkCode=ll2&tag=blogairfryeroven-20&linkId=e3225280d1d123f94c64bb5586f5d621&ref_=as_li_ss_tl',
  'PFR2200P': 'https://www.amazon.com.br/Fritadeira-Oven-PFR2200P-Philco-127v/dp/B08R93TVRG?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2ED0R0D5LX984&dib=eyJ2IjoiMSJ9.L8XloE6oIMGo_8vhJpsamxJZJPTdzPYLqFAp9Q7Czv3scpc4KlIMZjcQJfpMBxld1wjDd6It1hSnVGQtqSzHOwbkcLtCh48VJfzxrfPJKLbVZJ8SQ-Mgu5vs3YFrDd8-xR7Fs6s3fj8SzkxkhrjLwqpH9eU2RRnFmP53oEfIWZbEMr7xII3P8gSGm7yzyxRCCG7MrdCNkG2HAjtA-Oh9uYLWA88E9-XkdH1y_Szt_Sw_nDoikJFExos8QDFrfDG3y2Cjnz_fcpe0l2kglpaIFy8vti3qA8nuADtTsZRAEds.OBo0bk-utZF50yhvoCNy9Z7QjgxuO7Z_nf0IX38yyAA&dib_tag=se&keywords=Brit%C3%A2nia%2BOven%2BBAF16A%2B%2816L%29&qid=1780749340&sprefix=brit%C3%A2nia%2Boven%2Bbaf16a%2B16l%2B%2Caps%2C213&sr=8-1-spons&ufe=app_do%3Aamzn1.fos.25548f35-0de7-44b3-b28e-0f56f3f96147&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&linkCode=ll2&tag=blogairfryeroven-20&linkId=e3225280d1d123f94c64bb5586f5d621&ref_=as_li_ss_tl',
  'AI551': 'https://amzn.to/4uTMH6n',
  'RI9270': 'https://amzn.to/4e9gmBA',
  'RI9252': 'https://amzn.to/4fzTaPn',
  'RI9201': 'https://amzn.to/3SpQMRm',
  'NA130': 'https://amzn.to/4fq5520',
  'WAP_OVEN_12L': 'https://amzn.to/4uuiXwc',
  'WAP_BARBECUE_10L': 'https://amzn.to/4ujZK04',
  'WAP_MEGA_7L': 'https://amzn.to/4voGhfm',
  'CESTO_QUADRADO': 'https://amzn.to/43i9m0k',
  'FORMA_REDONDA': 'https://amzn.to/3Qlkl69',
  'EAF90': 'https://amzn.to/43jkg5Y',
  'EAF91': 'https://amzn.to/43jkg5Y',
  'EAF51': 'https://amzn.to/4dTG5Pv',
  'EAF30': 'https://amzn.to/4oktIzG',
  'EAF31': 'https://amzn.to/4oktIzG',
  'EAF20': 'https://amzn.to/4vwKFci',
  'EAF10': 'https://amzn.to/4vwKFci',
  'OFRT780': 'https://amzn.to/4eqCJDH',
  'DAKO_12L': 'https://amzn.to/43RmGZz',
  'MALLORY_30L': 'https://amzn.to/4v27jty',
  'AFON_VERMELHA': 'https://amzn.to/4ukUFEy',
  'OFOR250_25L': 'https://amzn.to/49IvuV4',
};

const PRODUCT_KEYWORDS = [
  { key: 'BAF16A', words: ['baf16a'] },
  { key: 'BFR50', words: ['bfr50', 'redstone'] },
  { key: 'BCFR05', words: ['bcfr05', 'bella cuccina'] },
  { key: 'BFR31', words: ['bfr31'] },
  { key: 'OFOR250_25L', words: ['ofor250 (25l)', 'ofor250 25l', 'ofor250 (25 litros)'] },
  { key: 'OFOR250', words: ['ofor250'] },
  { key: 'OFRT790', words: ['ofrt790', 'multi touch'] },
  { key: 'OFRT660', words: ['ofrt660', 'super fryer'] },
  { key: 'AFO-12L-BI', words: ['afo-12l-bi', 'afo12l', 'afo-12l'] },
  { key: 'PFE40I', words: ['pfe40i', 'pfe40'] },
  { key: 'PFR2000P', words: ['pfr2000p', 'pfr2000'] },
  { key: 'PFR2200P', words: ['pfr2200p', 'pfr2200'] },
  { key: 'AI551', words: ['ai551', 'série 5000', 'serie 5000'] },
  { key: 'RI9270', words: ['ri9270', 'essential xl'] },
  { key: 'RI9252', words: ['ri9252'] },
  { key: 'RI9201', words: ['ri9201'] },
  { key: 'NA130', words: ['na130', 'série 1000', 'serie 1000'] },
  { key: 'WAP_OVEN_12L', words: ['wap oven', 'wap airfry oven', 'wap digital 12'] },
  { key: 'WAP_BARBECUE_10L', words: ['wap barbecue', 'barbecue digital', 'wap barbecue 10l'] },
  { key: 'WAP_MEGA_7L', words: ['wap mega', 'mega family', 'wap mega family'] },
  { key: 'CESTO_QUADRADO', words: ['cesto quadrado'] },
  { key: 'FORMA_REDONDA', words: ['forma redonda'] },
  { key: 'EAF90', words: ['eaf90', 'rita lobo'] },
  { key: 'EAF91', words: ['eaf91'] },
  { key: 'EAF51', words: ['eaf51'] },
  { key: 'EAF30', words: ['eaf30'] },
  { key: 'EAF31', words: ['eaf31'] },
  { key: 'EAF20', words: ['eaf20'] },
  { key: 'EAF10', words: ['eaf10'] },
  { key: 'OFRT780', words: ['ofrt780'] },
  { key: 'DAKO_12L', words: ['dako', 'grandes apetites'] },
  { key: 'MALLORY_30L', words: ['mallory'] },
  { key: 'AFON_VERMELHA', words: ['afon', 'afn'] }
];

function splitIntoSections(content) {
  const lines = content.split('\n');
  const sections = [];
  let currentSection = { header: '', bodyLines: [] };

  for (const line of lines) {
    if (line.trim().startsWith('#')) {
      if (currentSection.header || currentSection.bodyLines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { header: line, bodyLines: [] };
    } else {
      currentSection.bodyLines.push(line);
    }
  }
  sections.push(currentSection);
  return sections;
}

function findProductInText(text) {
  let bestKey = null;
  let minIndex = Infinity;

  for (const { key, words } of PRODUCT_KEYWORDS) {
    for (const word of words) {
      const idx = text.indexOf(word);
      if (idx !== -1 && idx < minIndex) {
        minIndex = idx;
        bestKey = key;
      }
    }
  }
  return bestKey;
}

function findProductNearIndex(content, index, searchRange = 150) {
  const start = Math.max(0, index - searchRange);
  const end = Math.min(content.length, index + searchRange);
  const text = content.substring(start, end).toLowerCase();
  
  let bestKey = null;
  let minDistance = Infinity;

  for (const { key, words } of PRODUCT_KEYWORDS) {
    for (const word of words) {
      const idx = text.lastIndexOf(word);
      if (idx !== -1) {
        const linkPos = index - start;
        const distance = Math.abs(linkPos - idx);
        if (distance < minDistance) {
          minDistance = distance;
          bestKey = key;
        }
      }
    }
  }
  return bestKey;
}

const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.mdoc'));

let totalReplacements = 0;
let modifiedFilesCount = 0;

for (const file of files) {
  const filePath = path.join(POSTS_DIR, file);
  const originalContent = fs.readFileSync(filePath, 'utf-8');
  const sections = splitIntoSections(originalContent);
  let changed = false;
  let fileReplacements = 0;

  const processedSections = sections.map((section) => {
    let sectionBody = section.bodyLines.join('\n');
    let sectionProductKey = null;

    if (section.header) {
      const searchBlock = (section.header + '\n' + sectionBody.substring(0, 300)).toLowerCase();
      sectionProductKey = findProductInText(searchBlock);
    }

    // Process HTML links inside this section
    const LINK_TAG_RE = /<a\s+[^>]*href=["']([^'"]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    sectionBody = sectionBody.replace(LINK_TAG_RE, (match, href, text, index) => {
      const isPriceLink = /ver\s+preço/i.test(text) || /amazon/i.test(text) || /amazon-btn/i.test(match) || /background-color/i.test(match);
      if (!isPriceLink) return match;

      const subStart = Math.max(0, index - 150);
      const subEnd = Math.min(sectionBody.length, index + match.length + 150);
      const windowText = sectionBody.substring(subStart, subEnd);
      const isTable = windowText.includes('|');

      let productKey = null;
      if (isTable) {
        productKey = findProductNearIndex(sectionBody, index, 250);
      } else {
        productKey = sectionProductKey;
      }

      if (!productKey) {
        return match;
      }

      const correctLink = PRODUCT_LINKS[productKey];

      if (isTable) {
        const newTag = `<a href='${correctLink}' style='background-color:#228B22; color:white; padding:4px 8px; border-radius:4px; text-decoration:none; font-size:12px;'>Ver Preço</a>`;
        if (newTag !== match) {
          fileReplacements++;
          changed = true;
          return newTag;
        }
      } else {
        fileReplacements++;
        changed = true;
        return `{% AmazonButton link="${correctLink}" /%}`;
      }

      return match;
    });

    // Process AmazonButtons inside this section
    const BUTTON_TAG_RE = /\{%\s*AmazonButton[\s\S]*?link=["']([^'"]+)["'][\s\S]*?\/\s*%\}/gi;
    sectionBody = sectionBody.replace(BUTTON_TAG_RE, (match, href, index) => {
      let productKey = sectionProductKey;

      if (!productKey) {
        productKey = findProductNearIndex(sectionBody, index, 300);
      }

      if (!productKey) {
        return match;
      }

      const correctLink = PRODUCT_LINKS[productKey];
      const newTag = `{% AmazonButton link="${correctLink}" /%}`;
      if (newTag !== match) {
        fileReplacements++;
        changed = true;
        return newTag;
      }
      return match;
    });

    return {
      header: section.header,
      bodyLines: sectionBody.split('\n')
    };
  });

  if (changed) {
    const finalLines = [];
    for (const section of processedSections) {
      if (section.header) {
        finalLines.push(section.header);
      }
      finalLines.push(...section.bodyLines);
    }
    const finalContent = finalLines.join('\n');
    fs.writeFileSync(filePath, finalContent, 'utf-8');
    modifiedFilesCount++;
    totalReplacements += fileReplacements;
    console.log(`✅ ${file}: ${fileReplacements} substituição(ões)`);
  }
}

console.log('\n──────────────────────────────────────────');
console.log(`📊 Resumo de Substituição:`);
console.log(`   Arquivos modificados : ${modifiedFilesCount}`);
console.log(`   Total de substituições: ${totalReplacements}`);
console.log('──────────────────────────────────────────');
