import { promises as fs } from "node:fs";
import path from "path";
import html_to_pdf from 'html-pdf-node';
import Handlebars from "handlebars";
import { pageConfig } from '~/config/page.config';
import prettier from "prettier";

import '@fontsource-variable/inter';

// Read the Inter Variable font CSS content and fix relative paths
// Find the project root by looking for package.json
let currentDir = process.cwd();
while (!await fs.access(path.join(currentDir, 'package.json')).then(() => true).catch(() => false)) {
  const parentDir = path.dirname(currentDir);
  if (parentDir === currentDir) {
    throw new Error('Could not find project root (package.json not found)');
  }
  currentDir = parentDir;
}

const interFontPath = path.resolve(currentDir, 'node_modules/@fontsource-variable/inter');
const rawInterFontCss = await fs.readFile(
  path.join(interFontPath, 'index.css'),
  'utf8'
);

// Convert relative URLs to absolute file URLs for PDF generation
const interFontCss = rawInterFontCss.replace(
  /url\(\.\/files\//g,
  `url(file://${interFontPath}/files/`
);

// Read the resume styles CSS file
const resumeStylesPath = path.join(currentDir, 'src/modules/resume-generator/resume-styles.css');
const rawResumeStyles = await fs.readFile(resumeStylesPath, 'utf8');

// Replace the font placeholder with actual Inter font CSS
const resumeStyles = rawResumeStyles.replace(
  '/* INTER_FONT_CSS_PLACEHOLDER */',
  interFontCss
);

const pdfPath = path.join(currentDir, 'src/assets/pdf_output/output.pdf');
const htmlPath = path.join(currentDir, 'src/assets/pdf_output/output.html');

Handlebars.registerHelper('loud', function (aString) {
  return aString.toUpperCase()
})

const styles = `
  <style>
    ${resumeStyles}
  </style>
`

const resumeTemplate = Handlebars.compile(
  `
    <main>
      {{#with basicInfo}}
      <header>
        <div id='name'>
          <h1>{{loud name}}</h1>
        </div>
        <div id='title'>
          <p>{{jobRole}}</p>
        </div>
        <div>
          <span>{{location}}</span> | 
          <span>{{contactInfo.email}}</span> |
          <span>{{contactInfo.phone}}</span>
        </div>
      </header>
      <div class="divider"></div>
      <h2>Profile</h2>
      <div class="divider"></div>
      <div>
        <p>{{summary}}</p>
      </div>
      {{/with}}
      <hr>
      <h2>Professional Experience</h2>
      <hr>
      {{#each experience}}
      {{! Extract to partial }}
        <div class="experience-header">
          <div>
            <span>{{role}}</span>,
            <span>{{companyName}}</span>,
            <span>{{companyLocation}}</span>
          </div>
          <div>
            <span>{{startDate.month}} {{startDate.year}}</span> -
            {{#if endDate}}
            <span>{{endDate.month}} {{endDate.year}}</span>
            {{else}}
            <span>Present</span>
            {{/if}}
          </div>
        </div>
        <div class="experience-bullets">
          <ul>
          {{#each achievements}}
            <li>{{this}}</li>
          {{/each}}
          </ul>
        </div>
      {{! END of partial }}
      {{/each}}
      <hr>
      <h2>Technical Skills</h2>
      <hr>

    </main>
    ${styles}
  `.replace(/\s+/g, " ")
)

async function formatHTML(html: string): Promise<string> {
  const result = await prettier.format(html, {
    parser: "html", // tell Prettier we’re formatting HTML
  });
  return result;
}

async function deleteFileIfExists(path: string): Promise<void> {
  try {
    await fs.access(path); // Check if the file can be accessed (exists)
    await fs.unlink(path); // Delete the file
    console.log(`Deleted file at: ${path}`);
  } catch (err: any) {
    if (err.code === "ENOENT") {
      console.log(`File does not exist at: ${path}`);
    } else {
      throw err; // Some other error (e.g., permissions)
    }
  }
}

const html = { content: resumeTemplate({ ...pageConfig }) };
const formatted = await formatHTML(html.content);

deleteFileIfExists(htmlPath).then(() => fs.writeFile(htmlPath, formatted, 'utf8'))

console.log('HTML file generated successfully: output.html');


let options = { format: 'A4', path: pdfPath };

deleteFileIfExists(pdfPath);
html_to_pdf.generatePdf(html, options).then(pdfBuffer => {
  console.log("PDF generated");
});