const fs = require('fs');
const path = require('path');

function convertTsxToJsx(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove type annotations
  content = content.replace(/:\s*React\.ComponentProps<[^>]+>/g, '');
  content = content.replace(/:\s*React\.ComponentProps<typeof\s+([^>]+)>/g, '');
  content = content.replace(/:\s*React\.ImgHTMLAttributes<[^>]+>/g, '');
  content = content.replace(/:\s*React\.ReactNode/g, '');
  content = content.replace(/:\s*React\.CSSProperties/g, '');
  content = content.replace(/:\s*React\.KeyboardEvent<[^>]+>/g, '');
  content = content.replace(/:\s*boolean/g, '');
  content = content.replace(/:\s*string/g, '');
  content = content.replace(/:\s*number/g, '');
  content = content.replace(/:\s*undefined/g, '');
  content = content.replace(/:\s*null/g, '');
  
  // Remove type imports
  content = content.replace(/import\s+type\s+[^;]+;/g, '');
  content = content.replace(/,\s*type\s+[A-Z][a-zA-Z0-9_<>:,\s]+\}/g, '}');
  content = content.replace(/\{\s*type\s+[A-Z][a-zA-Z0-9_<>:,\s]+,\s*/g, '{ ');
  content = content.replace(/\btype\s+VariantProps\b/g, '');
  content = content.replace(/\btype\s+ControllerProps\b/g, '');
  content = content.replace(/\btype\s+FieldPath\b/g, '');
  content = content.replace(/\btype\s+FieldValues\b/g, '');
  content = content.replace(/\btype\s+ClassValue\b/g, '');
  content = content.replace(/\btype\s+UseEmblaCarouselType\b/g, '');
  
  // Remove generic types from function parameters
  content = content.replace(/<[^>]+>/g, (match) => {
    // Keep JSX syntax like <div> but remove type generics
    if (match.includes('=') || match.includes('extends') || match.includes('|')) {
      return '';
    }
    return match;
  });
  
  // Remove type definitions
  content = content.replace(/type\s+[A-Z][a-zA-Z0-9_<>:\s,=]+\{[^}]*\};/g, '');
  content = content.replace(/type\s+[A-Z][a-zA-Z0-9_<>:\s,=]+;/g, '');
  content = content.replace(/export\s+type\s+[A-Z][a-zA-Z0-9_]+;/g, '');
  
  // Remove 'as' type assertions
  content = content.replace(/\s+as\s+[A-Z][a-zA-Z0-9_<>]+/g, '');
  content = content.replace(/\{\}\s+as\s+[A-Z][a-zA-Z0-9_<>]+/g, '{}');
  
  // Remove useState type parameters
  content = content.replace(/useState<[^>]+>/g, 'useState');
  content = content.replace(/React\.useState<[^>]+>/g, 'React.useState');
  
  // Remove createContext type parameters
  content = content.replace(/createContext<[^>]+>/g, 'createContext');
  content = content.replace(/React\.createContext<[^>]+>/g, 'React.createContext');
  
  // Remove ReturnType, Parameters
  content = content.replace(/ReturnType<[^>]+>/g, '');
  content = content.replace(/Parameters<[^>]+>/g, '');
  
  // Remove non-null assertion
  content = content.replace(/!\s*\)/g, ')');
  content = content.replace(/document\.getElementById\([^)]+\)!/g, 'document.getElementById($1)');
  
  // Fix import paths - remove .tsx extensions, add .jsx if needed
  content = content.replace(/from\s+['"]([^'"]+)\.tsx['"]/g, "from '$1.jsx'");
  
  // Remove VariantProps usage
  content = content.replace(/&\s*VariantProps<[^>]+>/g, '');
  content = content.replace(/VariantProps<[^>]+>/g, '');
  
  // Remove & intersections with types
  content = content.replace(/&\s*\{[^}]+\}/g, '');
  
  return content;
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (file.endsWith('.tsx')) {
      callback(filePath);
    }
  });
}

const srcDir = path.join(__dirname, 'src');
walkDir(srcDir, (tsxPath) => {
  const jsxPath = tsxPath.replace(/\.tsx$/, '.jsx');
  console.log(`Converting ${tsxPath} -> ${jsxPath}`);
  const jsxContent = convertTsxToJsx(tsxPath);
  fs.writeFileSync(jsxPath, jsxContent, 'utf8');
  console.log(`Deleting ${tsxPath}`);
  fs.unlinkSync(tsxPath);
});

console.log('Conversion complete!');
