const fs = require('fs');
const path = require('path');
const dir = 'resources/sass';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.scss') && file !== 'app.scss' && file !== '_variables.scss' && file !== 'variables.scss') {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (!content.includes('@use "variables"') && !content.includes("@use 'variables'")) {
      content = '@use "variables" as *;\n' + content;
      fs.writeFileSync(filePath, content);
    }
  }
});
