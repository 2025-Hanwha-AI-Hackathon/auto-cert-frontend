#!/usr/bin/env python3
import os
import re
from pathlib import Path

def convert_tsx_to_jsx(file_path):
    """Convert TypeScript React file to JavaScript React file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove type annotations
    content = re.sub(r':\s*React\.ComponentProps<[^>]+>', '', content)
    content = re.sub(r':\s*React\.ComponentProps<typeof\s+([^>]+)>', '', content)
    content = re.sub(r':\s*([A-Z][a-zA-Z0-9_]*)\s*&\s*VariantProps<[^>]+>', '', content)
    content = re.sub(r':\s*VariantProps<[^>]+>', '', content)
    content = re.sub(r':\s*React\.ReactNode', '', content)
    content = re.sub(r':\s*React\.CSSProperties', '', content)
    content = re.sub(r':\s*boolean', '', content)
    content = re.sub(r':\s*string', '', content)
    content = re.sub(r':\s*number', '', content)
    content = re.sub(r':\s*undefined', '', content)
    
    # Remove type imports
    content = re.sub(r'import\s+type\s+([^;]+);', '', content)
    content = re.sub(r'import\s+\{[^}]*\btype\s+([^,}]+)[^}]*\}', lambda m: m.group(0).replace(f', type {m.group(1)}', '').replace(f'type {m.group(1)}, ', '').replace(f'type {m.group(1)}', ''), content)
    
    # Remove generic types
    content = re.sub(r'<[^>]+>', '', content)
    
    # Remove type definitions
    content = re.sub(r'type\s+[A-Z][a-zA-Z0-9_<>:\s,=]+\{[^}]*\};', '', content, flags=re.MULTILINE)
    content = re.sub(r'type\s+[A-Z][a-zA-Z0-9_<>:\s,=]+;', '', content)
    
    # Remove 'as' type assertions
    content = re.sub(r'\s+as\s+[A-Z][a-zA-Z0-9_<>]+', '', content)
    
    # Remove React.KeyboardEvent type
    content = re.sub(r'\(event:\s*React\.KeyboardEvent<[^>]+>\)', '(event)', content)
    
    # Remove useState type parameters
    content = re.sub(r'useState<[^>]+>', 'useState', content)
    
    # Remove createContext type parameters
    content = re.sub(r'createContext<[^>]+>', 'createContext', content)
    
    # Remove ReturnType type
    content = re.sub(r'ReturnType<[^>]+>', '', content)
    content = re.sub(r'Parameters<[^>]+>', '', content)
    
    # Clean up empty type annotations
    content = re.sub(r'\(\s*\)\s*:\s*void', '()', content)
    
    # Remove export type
    content = re.sub(r'export\s+type\s+[A-Z][a-zA-Z0-9_]+;', '', content)
    
    # Write to .jsx file
    jsx_path = file_path.replace('.tsx', '.jsx')
    with open(jsx_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Converted {file_path} -> {jsx_path}")

def main():
    src_dir = Path('src')
    for tsx_file in src_dir.rglob('*.tsx'):
        if not tsx_file.name.endswith('.tsx'):
            continue
        try:
            convert_tsx_to_jsx(str(tsx_file))
        except Exception as e:
            print(f"Error converting {tsx_file}: {e}")

if __name__ == '__main__':
    main()


