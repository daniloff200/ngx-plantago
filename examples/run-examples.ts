/**
 * run-examples.ts
 *
 * Processes all AngularJS example files through the migration pipeline
 * and writes the output to examples/expected-output/.
 *
 * This script exercises the core migration logic WITHOUT requiring VS Code:
 *   - JS services/components/factories/filters -> TypeScript classes
 *   - HTML templates -> Angular 13 template syntax
 *
 * Usage: npm run examples
 */
import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import { getFileContent } from '../src/lib/services/get-file-content';
import { genCode } from '../src/lib/gen-code';
import { processStringReplacements } from '../src/lib/process-string-replacements';
import { printString } from '../src/lib/pretty-print';
import { processTemplate } from '../src/lib/templates/process-template';
import { saveCurrentFile } from '../src/lib/file-paths-storage';

const INPUT_DIR = path.join(__dirname, 'input');
const OUTPUT_DIR = path.join(__dirname, 'expected-output');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Migrate a single AngularJS JS file -> Angular 13 TypeScript.
 */
function migrateJsFile(filePath: string): string | null {
    const code = fs.readFileSync(filePath, 'utf-8');
    const ast = ts.createSourceFile(filePath, code, ts.ScriptTarget.ES2015, true);

    // Set the current file in storage (required by genCode internals)
    saveCurrentFile({ path: filePath });

    const fileContent = getFileContent(ast);
    if (!fileContent) {
        console.log(`  [SKIP] ${path.basename(filePath)} - not a migratable type (config or unknown)`);
        return null;
    }

    // Generate Angular 13 code from the parsed content
    let output = genCode(fileContent);

    // Apply string-level replacements ($q -> Promise, $http -> HttpClient, etc.)
    output = processStringReplacements(output);

    // Format with prettier
    output = printString(output);

    return output;
}

/**
 * Migrate a single AngularJS HTML template -> Angular 13 template.
 */
function migrateHtmlFile(filePath: string): string {
    const template = fs.readFileSync(filePath, 'utf-8');

    // We pass an empty component dictionary since we don't have the
    // full project context here. In a real run, this would be populated
    // from the component files.
    return processTemplate(template, {});
}

// --- Main ---

console.log('=== ngx-plantago Example Migration ===\n');
console.log(`Input:  ${INPUT_DIR}`);
console.log(`Output: ${OUTPUT_DIR}\n`);

const files = fs.readdirSync(INPUT_DIR);
let jsCount = 0;
let htmlCount = 0;
let skipCount = 0;

for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    const ext = path.extname(file);

    if (ext === '.js') {
        console.log(`Processing JS: ${file}`);
        const result = migrateJsFile(inputPath);
        if (result) {
            // Write .ts output
            const outputFile = file.replace(/\.js$/, '.ts');
            fs.writeFileSync(path.join(OUTPUT_DIR, outputFile), result, 'utf-8');
            console.log(`  -> ${outputFile}`);
            jsCount++;
        } else {
            skipCount++;
        }
    } else if (ext === '.html') {
        console.log(`Processing HTML: ${file}`);
        const result = migrateHtmlFile(inputPath);
        fs.writeFileSync(path.join(OUTPUT_DIR, file), result, 'utf-8');
        console.log(`  -> ${file}`);
        htmlCount++;
    }
}

console.log(`\n=== Done ===`);
console.log(`Migrated: ${jsCount} JS files, ${htmlCount} HTML templates`);
if (skipCount > 0) {
    console.log(`Skipped:  ${skipCount} files (config/unknown type)`);
}