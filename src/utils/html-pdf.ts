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
    .experience-header {
      display: flex;
      justify-content: space-between;
    }
  </style>
`

const format = {
  name: "Keith Robinson",
  jobRole: "Senior Fullstack Software Engineer",
  summary: "Results-driven full-stack engineer with 6+ years of experience building scalable, high-performance web applications. Skilled in modernizing legacy systems, optimizing developer workflows, and delivering user-centric solutions. Proven track record of improving system performance, reducing bugs, and mentoring teams to deliver high-quality software.",
  location: "Phoenix, Arizona",
  contactInfo: {
    email: "kthrob@gmail.com",
    phone: "712-490-7823",
    linkedin: "https://linkedin.com/in/keith-robinson-2b6527118",
    github: "https://github.com/kthrob"
  },
}

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
  `
)

const exp = {
  role: "Senior Product Engineer",
  companyName: "Promethic Systems",
  companyLocation: "Wilmington, Delaware",
  remote: true,
  companyURL: "https://promethic.online",
  startDate: { year: "2024", month: "September" },
  description: "Leading the development of a cutting-edge SaaS platform for managing and optimizing cloud infrastructure. Collaborating closely with cross-functional teams to deliver high-impact features that enhance user experience and operational efficiency.",
  achievements: [
    "Architected and implemented a microservices-based architecture using Node.js, Express, and Docker, resulting in a 30% improvement in system scalability and maintainability.",
    "Led the migration of legacy systems to modern cloud infrastructure on AWS, reducing operational costs by 20% and improving deployment times by 50%.",
    "Mentored junior developers and conducted code reviews, fostering a culture of continuous learning and high-quality code standards within the team."
  ]
}



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