import { promises as fs } from "node:fs";
import path from "path";
import html_to_pdf from 'html-pdf-node';
import Handlebars from "handlebars";
import { pageConfig } from '~/config/page.config';

const pdfPath = './src/assets/pdf_output/output.pdf'
const htmlPath = './src/assets/pdf_output/output.html'

console.log('FS: ', fs)

console.log("Config: ", pageConfig.basicInfo)
const template = Handlebars.compile("<p>{{name}}</p><p>{{age}}</p><style>p { color: red; }</style>");
console.log(template({ name: "Nils", age: 30 }));

const styles = `
  <style>
    main { margin: 30px; }
    h1 { color: red; }
    p { color: blue; }
    .experience-header {
      display: flex;
      justify-content: space-between;
    }
  </style>
`

const resumeTemplate = Handlebars.compile(
  `
    <main>
      {{#with basicInfo}}
      <header>
        <div id='name'>
          <h1>{{name}}</h1>
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
      <hr>
      <h2>Profile</h2>
      <hr>
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

let html = { content: resumeTemplate({...pageConfig}) };

deleteFileIfExists(htmlPath);
await fs.writeFile(htmlPath, JSON.stringify(html.content).trim(), 'utf8');

console.log('HTML file generated successfully: output.html');


let options = { format: 'A4', path: pdfPath };

deleteFileIfExists(pdfPath);
html_to_pdf.generatePdf(html, options).then(pdfBuffer => {
  console.log("PDF generated");
});