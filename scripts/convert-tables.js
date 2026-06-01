import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsDir = path.join(__dirname, '../src/content/posts');

if (fs.existsSync(postsDir)) {
  const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.mdoc') || file.endsWith('.md'));

  files.forEach(file => {
    const filePath = path.join(postsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Regexp to find tables with class="has-fixed-layout"
    const tableRegex = /<table class="has-fixed-layout">([\s\S]*?)<\/table>/g;

    const newContent = content.replace(tableRegex, (match, tableBody) => {
      // Find all rows
      const rowRegex = /<tr>([\s\S]*?)<\/tr>/g;
      const rows = [];
      let rowMatch;

      while ((rowMatch = rowRegex.exec(tableBody)) !== null) {
        const rowContent = rowMatch[1];
        // Find all cells (td or th)
        const cellRegex = /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/g;
        const cells = [];
        let cellMatch;

        while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
          let cellText = cellMatch[1].trim();
          
          // Clean up HTML tags inside cells
          cellText = cellText
            .replace(/<\/?strong>/g, '**')
            .replace(/<\/?em>/g, '*')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/[\r\n\t]+/g, ' ')
            .trim();
            
          cells.push(cellText);
        }
        
        if (cells.length > 0) {
          rows.push(cells);
        }
      }

      if (rows.length > 0) {
        // Construct markdown table
        let markdownTable = '';
        
        // Header
        const headerRow = rows[0];
        markdownTable += '| ' + headerRow.join(' | ') + ' |\n';
        
        // Separator
        const separator = headerRow.map(() => ':---');
        markdownTable += '| ' + separator.join(' | ') + ' |\n';
        
        // Data rows
        for (let i = 1; i < rows.length; i++) {
          markdownTable += '| ' + rows[i].join(' | ') + ' |\n';
        }
        
        hasChanges = true;
        return markdownTable;
      }
      
      return match;
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✓ [${file}]: Tabelas HTML convertidas para Markdown.`);
    }
  });
}
