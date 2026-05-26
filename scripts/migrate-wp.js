import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import TurndownService from 'turndown';

// Configuration
const SMALL_XML_PATH = 'data/migracao/melhorfornooven.WordPress.2026-05-24 (1).xml';
const LARGE_XML_PATH = 'data/migracao/melhorfornooven.WordPress.2026-05-24.xml';
const TARGET_DIR = 'src/content/posts';
const CATEGORIES_DIR = 'src/content/categories';

// Turndown service for converting HTML to Markdown
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  hr: '---'
});

// Configure Turndown rules
turndownService.keep(['table', 'thead', 'tbody', 'tr', 'th', 'td']);

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/\s+/g, '-') // replace spaces with -
    .replace(/[^\w\-]+/g, '') // remove all non-word chars
    .replace(/\-\-+/g, '-') // replace multiple - with single -
    .replace(/^-+/, '') // trim - from start
    .replace(/-+$/, ''); // trim - from end
}

function getCategoryName(slug) {
  const mapping = {
    'guias-de-compra': 'Guias de Compra',
    'institucional': 'Institucional',
    'receitas': 'Receitas',
    'dicas': 'Dicas',
    'reviews': 'Avaliações',
    'comparativos': 'Comparativos',
    'geral': 'Geral'
  };
  if (mapping[slug]) return mapping[slug];
  
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Clean HTML content before turning it into markdown
function cleanHtml(html) {
  if (!html) return '';

  // 1. Remove script tags completely
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');

  // 2. Remove Gutenberg comments and other HTML comments
  html = html.replace(/<!--[\s\S]*?-->/g, '');

  // 3. Keep ONLY allowed links: Amazon, Mercado Livre, internal/relative, and social media.
  // Unwrap all other links (pointing to Benoit, or other external stores/sites).
  const aTagRegex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let previousHtml;
  
  do {
    previousHtml = html;
    html = html.replace(aTagRegex, (match, attrs, content) => {
      // Check if it's a benoit link or contains benoit
      if (/benoit/i.test(attrs) || /benoit/i.test(match)) {
        return content; // Strip link, keep inner text
      }

      // Extract href attribute
      const hrefMatch = attrs.match(/href=["']([^"']*)["']/i);
      if (!hrefMatch) {
        return content; // Strip link, keep inner text
      }
      
      const href = hrefMatch[1];

      // If the link is internal or relative, keep it
      if (href.startsWith('/') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return match;
      }

      // Allowed domains: amazon, mercadolivre, mercadolibre, amzn.to, melhorfornooven.com.br, facebook.com, linkedin.com, tumblr.com, youtube.com, instagram.com, twitter.com, x.com
      const allowedDomains = [
        /amazon\.com/i,
        /amzn\.to/i,
        /mercadolivre\.com/i,
        /mercadolibre\.com/i,
        /melhorfornooven\.com/i,
        /facebook\.com/i,
        /linkedin\.com/i,
        /tumblr\.com/i,
        /youtube\.com/i,
        /instagram\.com/i,
        /twitter\.com/i,
        /x\.com/i
      ];

      const isAllowed = allowedDomains.some(domainRegex => domainRegex.test(href));
      if (isAllowed) {
        return match; // Keep the link
      }

      // Otherwise, unwrap the link (keep its text content)
      return content;
    });
  } while (html !== previousHtml);

  return html;
}

// Ensure the category exists as a YAML file
function ensureCategoryExists(categorySlug) {
  if (!categorySlug) return;
  const catFilePath = path.join(CATEGORIES_DIR, `${categorySlug}.yaml`);
  if (!fs.existsSync(catFilePath)) {
    const catName = getCategoryName(categorySlug);
    const catContent = `name: "${catName}"\nslug: "${categorySlug}"\n`;
    fs.writeFileSync(catFilePath, catContent, 'utf-8');
    console.log(`📁 Criada categoria ausente: ${categorySlug} (${catName})`);
  }
}

// Process a single item
function processItem(item) {
  // Extract essential fields
  let title = item.title;
  let slug = item['wp:post_name'];
  let status = item['wp:status'];
  let postType = item['wp:post_type'];
  let rawDate = item['wp:post_date'];
  let content = item['content:encoded'] || '';

  // Extract from CDATA / complex structures if parsed as objects
  if (typeof title === 'object') title = title['#text'] || '';
  if (typeof slug === 'object') slug = slug['#text'] || '';
  if (typeof status === 'object') status = status['#text'] || '';
  if (typeof postType === 'object') postType = postType['#text'] || '';
  if (typeof rawDate === 'object') rawDate = rawDate['#text'] || '';
  if (typeof content === 'object') content = content['#text'] || '';

  // Filter
  if (postType !== 'post' && postType !== 'page') return false;
  if (status !== 'publish') return false;
  if (!slug) return false;

  slug = slug.trim();
  console.log(`\n📦 Processando [${postType}]: ${title} (slug: ${slug})...`);

  // Clean up existing .md file if it exists to avoid double/obsolete files
  const obsoleteMdFile = path.join(TARGET_DIR, `${slug}.md`);
  if (fs.existsSync(obsoleteMdFile)) {
    fs.unlinkSync(obsoleteMdFile);
    console.log(`🗑️ Removido arquivo obsoleto: ${obsoleteMdFile}`);
  }

  // Format date: YYYY-MM-DD
  let publishedDate = '';
  if (rawDate) {
    publishedDate = rawDate.split(' ')[0];
  }

  // Extract category
  let category = 'geral';
  if (postType === 'page') {
    category = 'institucional';
  } else if (item.category) {
    const categories = Array.isArray(item.category) ? item.category : [item.category];
    const catObj = categories.find((c) => typeof c === 'object' && c['@_domain'] === 'category');
    if (catObj && catObj['@_nicename']) {
      category = catObj['@_nicename'];
    } else if (typeof catObj === 'object' && catObj['#text']) {
      category = slugify(catObj['#text']);
    } else {
      const simpleCat = categories.find((c) => typeof c === 'string');
      if (simpleCat) category = slugify(simpleCat);
    }
  }

  // Ensure category directory and file exists
  ensureCategoryExists(category);

  // Extract thumbnail (first image in content)
  let thumbnail = '';
  const imgMatch = content.match(/<img\b[^>]*src=["']([^"']*)["']/i);
  if (imgMatch) {
    thumbnail = imgMatch[1];
  }

  // Extract meta description from Yoast SEO, or fallback to first paragraph
  let metaDescription = '';
  if (item.postmeta) {
    const postmetas = Array.isArray(item.postmeta) ? item.postmeta : [item.postmeta];
    const metaDescObj = postmetas.find((m) => {
      let key = m.meta_key;
      if (typeof key === 'object') key = key['#text'];
      return key === '_yoast_wpseo_metadesc';
    });
    if (metaDescObj) {
      let val = metaDescObj.meta_value;
      if (typeof val === 'object') val = val['#text'];
      metaDescription = val || '';
    }
  }

  if (!metaDescription) {
    const pMatch = content.match(/<p>([\s\S]*?)<\/p>/i);
    if (pMatch) {
      metaDescription = pMatch[1].replace(/<[^>]*>/g, '').trim();
    }
  }

  // Clean metaDescription length
  if (metaDescription) {
    metaDescription = metaDescription.replace(/\s+/g, ' ').trim();
    if (metaDescription.length > 160) {
      metaDescription = metaDescription.substring(0, 157) + '...';
    }
  }

  // Clean HTML
  const cleanedHtml = cleanHtml(content);

  // Convert HTML to Markdown
  let markdownBody = turndownService.turndown(cleanedHtml);

  // Quick safety clean on markdown body to ensure no stray benoit strings in links
  markdownBody = markdownBody.replace(/\[([^\]]*)\]\([^)]*benoit[^)]*\)/gi, '$1');

  // Build Frontmatter (author slug "isabela-dantas" matches the YAML config name)
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `slug: ${JSON.stringify(slug)}`,
    `author: "isabela-dantas"`,
    publishedDate ? `publishedDate: "${publishedDate}"` : null,
    category ? `category: "${category}"` : null,
    thumbnail ? `thumbnail: "${thumbnail}"` : null,
    metaDescription ? `metaDescription: ${JSON.stringify(metaDescription)}` : null,
    '---',
    '',
    markdownBody
  ]
    .filter(line => line !== null)
    .join('\n');

  // Write file as .mdoc (the standard required for Keystatic and dynamic Astro posts utility)
  const outputFilePath = path.join(TARGET_DIR, `${slug}.mdoc`);
  fs.writeFileSync(outputFilePath, frontmatter, 'utf-8');
  console.log(`✅ Salvo: ${outputFilePath}`);
  return true;
}

function runMigration() {
  console.log('🚀 Iniciando migração do WordPress para Markdown (.mdoc)...');

  // Initialize parser
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    allowBooleanAttributes: true
  });

  const xmlFiles = [SMALL_XML_PATH, LARGE_XML_PATH];
  let totalMigrated = 0;

  for (const xmlPath of xmlFiles) {
    if (!fs.existsSync(xmlPath)) {
      console.warn(`⚠️ Arquivo XML não encontrado: ${xmlPath}`);
      continue;
    }

    console.log(`\n📖 Lendo arquivo: ${xmlPath}...`);
    let rawXml = fs.readFileSync(xmlPath, 'utf-8');
    rawXml = rawXml.replace(/^\uFEFF/, '');

    console.log(`🧩 Analisando XML...`);
    const parsedData = parser.parse(rawXml);

    const channel = parsedData?.rss?.channel;
    if (!channel || !channel.item) {
      console.warn(`⚠️ Estrutura do RSS inválida ou nenhum item encontrado em ${xmlPath}`);
      continue;
    }

    const items = Array.isArray(channel.item) ? channel.item : [channel.item];
    console.log(`✨ Encontrados ${items.length} itens no XML. Processando...`);

    let fileCount = 0;
    for (const item of items) {
      const success = processItem(item);
      if (success) {
        fileCount++;
      }
    }
    totalMigrated += fileCount;
    console.log(`🎉 Concluído processamento de ${xmlPath}. Migrados nesta etapa: ${fileCount} itens.`);
  }

  console.log(`\n🏆 MIGRACÃO COMPLETA! Total de arquivos migrados com sucesso: ${totalMigrated}`);
}

runMigration();
