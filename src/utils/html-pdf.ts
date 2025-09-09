import { promises as fs } from "node:fs";
import path from "path";
import html_to_pdf from 'html-pdf-node';
import Handlebars from "handlebars";
import { pageConfig } from '~/config/page.config';
import prettier from "prettier";

const pdfPath = './src/assets/pdf_output/output.pdf'
const htmlPath = './src/assets/pdf_output/output.html'


Handlebars.registerHelper('loud', function (aString) {
  return aString.toUpperCase()
})

const styles = `
  <style>
    main { margin: 30px; }
    h1 { color: red; }
    h2 {
      text-transform: uppercase;
      margin: 2px auto;
    }
    hr {
      margin: 0;
      color: blue;
    }
    p { color: blue; }
    .experience-header {
      display: flex;
      justify-content: space-between;
    }
    .divider {
      border: none;
      height: 1px;
      background-color: #0000FF;
      margin: 0;
    }
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
console.log("FORMATTED: ", formatted)

deleteFileIfExists(htmlPath).then(() => fs.writeFile(htmlPath, formatted, 'utf8'))
// fs.writeFile(htmlPath, formatted, 'utf8');

console.log('HTML file generated successfully: output.html');


let options = { format: 'A4', path: pdfPath };

deleteFileIfExists(pdfPath);
html_to_pdf.generatePdf(html, options).then(pdfBuffer => {
  console.log("PDF generated");
});