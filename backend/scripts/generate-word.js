// backend/scripts/generate-word.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Document, Packer, Paragraph, HeadingLevel, TextRun, PageBreak } from 'docx';
import { isBinaryFileSync } from 'isbinaryfile';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(projectRoot, '..');

const targets = [
  path.join(repoRoot, 'backend'),
  path.join(repoRoot, 'frontend'),
];

const OUTPUT_DIR = path.join(projectRoot, 'scripts');
const OUTPUT_FILE = path.join(projectRoot, 'scripts', 'output.docx');

const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.vite', '.next', '.cache'
]);

const TEXT_FILE_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.txt', '.css', '.scss', '.sass', '.html', '.env', '.xml', '.yml', '.yaml', '.gitignore', '.eslint', '.config', '.lock'
]);

function isProbablyTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (TEXT_FILE_EXTENSIONS.has(ext)) return true;
  try {
    return !isBinaryFileSync(filePath);
  } catch {
    return true;
  }
}

function getAllFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function toRepoRelative(p) {
  let rel = path.relative(repoRoot, p).replace(/\\/g, '/');
  // Prefix with //TalentTrack to match requested prefix style
  return `//TalentTrack/${rel}`;
}

async function main() {
  const documentSections = [];

  for (const target of targets) {
    if (!fs.existsSync(target)) continue;
    const files = getAllFiles(target)
      .filter((p) => isProbablyTextFile(p))
      .sort();

    for (const filePath of files) {
      const relPathLabel = toRepoRelative(filePath);
      const content = fs.readFileSync(filePath, 'utf8');

      const paragraphs = [];
      paragraphs.push(new Paragraph({
        text: relPathLabel,
        heading: HeadingLevel.HEADING_2,
      }));

      paragraphs.push(new Paragraph({
        children: [
          new TextRun({ text: ' ', break: 1 }),
        ],
      }));

      // Add file contents as monospaced text
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: line, font: 'Consolas' })],
        }));
      }

      paragraphs.push(new Paragraph({ children: [new PageBreak()] }));
      documentSections.push({ properties: {}, children: paragraphs });
    }
  }

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const doc = new Document({
    sections: documentSections.length > 0 ? documentSections : [
      { children: [ new Paragraph('No files found.') ] }
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT_FILE, buffer);
  // eslint-disable-next-line no-console
  console.log(`Wrote Word document: ${OUTPUT_FILE}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});




