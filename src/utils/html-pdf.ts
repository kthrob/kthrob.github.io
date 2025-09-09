import { promises as fs } from "node:fs";
import path from "path";
import html_to_pdf from 'html-pdf-node';
import Handlebars from "handlebars";
import { pageConfig } from '~/config/page.config';

console.log('FS: ', fs)

console.log("Config: ", pageConfig.basicInfo)
const template = Handlebars.compile("<p>{{name}}</p><p>{{age}}</p><style>p { color: red; }</style>");
console.log(template({ name: "Nils", age: 30 }));

const styles = `
  <style>
    main { margin: 30px; }
    h1 { color: red; }
    p { color: blue; }
  </style>
`

const resumeTemplate = Handlebars.compile(
  `
    <main>
      <header>
      {{#with basicInfo}}
        <div id='name'>
          <h1>{{name}}</h1>
        </div>
        <div id='title'>
          <p>{{jobRole}}</p>
        </div>
        <div>
          <span>{{location}}</span>
        </div>
      {{/with}}
      </header>
    </main>
    ${styles}
  `
)




let outputPath = './src/assets/pdf_output/output.pdf'
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

deleteFileIfExists(outputPath)

let options = { format: 'A4', path: outputPath };
// Example of options with args //
// let options = { format: 'A4', args: ['--no-sandbox', '--disable-setuid-sandbox'] };



let file = { content: resumeTemplate({...pageConfig}) };

console.log("File: ", file)

html_to_pdf.generatePdf(file, options).then(pdfBuffer => {
  console.log("PDF generated");
});