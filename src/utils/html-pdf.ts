import html_to_pdf from 'html-pdf-node';
import Handlebars from "handlebars";



const template = Handlebars.compile("<p>{{name}}</p><p>{{age}}</p><style>p { color: red; }</style>");
console.log(template({ name: "Nils", age: 30 }));

const styles = `
  <style>
    h1 { color: red; }
    p { color: blue; }
  </style>
`

const resumeTemplate = Handlebars.compile(
  `
    <main>
      <header>
        <div id='name'>
          <h1>{{name}}</h1>
        </div>
        <div id='title'>
          <p>{{title}}</p>
        </div>
      </header>
    </main>
    ${styles}
  `
)





let options = { format: 'A4', path: './src/assets/pdf_output/output.pdf' };
// Example of options with args //
// let options = { format: 'A4', args: ['--no-sandbox', '--disable-setuid-sandbox'] };

let file = { content: resumeTemplate({ name: "Nils", title: "Software Engineer" }) };

html_to_pdf.generatePdf(file, options).then(pdfBuffer => {
  console.log("PDF Buffer:-", pdfBuffer);
});