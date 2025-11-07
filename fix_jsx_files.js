const fs = require('fs');
const path = require('path');

function fixJsxFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Fix import statements
  content = content.replace(/import \* from "react"/g, 'import * as React from "react"');
  content = content.replace(/import \* from "@radix-ui/g, 'import * as AlertDialogPrimitive from "@radix-ui');
  
  // Fix empty JSX return statements - need to restore JSX
  // This is complex, so we'll need to check specific patterns
  
  // Fix empty return statements in functions
  content = content.replace(/return\s*\(\s*\);?/g, (match, offset) => {
    // Try to find the function context
    const before = content.substring(Math.max(0, offset - 200), offset);
    const funcMatch = before.match(/function\s+(\w+)\s*\([^)]*\)\s*\{/);
    if (funcMatch) {
      const funcName = funcMatch[1];
      // For primitive components, return the primitive with props
      if (funcName.includes('Dialog') || funcName.includes('Alert')) {
        const primitiveMatch = content.substring(0, offset).match(/from\s+["']([^"']+react-[^"']+)["']/);
        if (primitiveMatch) {
          const primitiveName = primitiveMatch[1].split('/').pop().replace('@', '').split('@')[0];
          const componentName = funcName.replace(/^(Alert)?Dialog/, '');
          return `return <${primitiveName}.${componentName} {...props} />;`;
        }
      }
    }
    return match;
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
    return true;
  }
  return false;
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (file.endsWith('.jsx')) {
      callback(filePath);
    }
  });
}

const srcDir = path.join(__dirname, 'src');
let fixedCount = 0;
walkDir(srcDir, (jsxPath) => {
  if (fixJsxFile(jsxPath)) {
    fixedCount++;
  }
});

console.log(`Fixed ${fixedCount} files`);
