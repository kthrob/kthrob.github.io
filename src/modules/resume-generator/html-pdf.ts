import { promises as fs } from "node:fs";
import path from "path";
import html_to_pdf from 'html-pdf-node';
import { pageConfig } from '~/config/page.config';
import prettier from "prettier";

// TypeScript interfaces
interface DateInfo {
  month: string;
  year: string;
}

interface Experience {
  role: string;
  companyName: string;
  companyLocation: string;
  startDate: DateInfo;
  endDate?: DateInfo;
  achievements: string[];
}

interface BasicInfo {
  name: string;
  jobRole: string;
  location: string;
  summary: string;
  contactInfo: {
    email: string;
    phone: string;
  };
}

interface ResumeData {
  basicInfo: BasicInfo;
  experience: Experience[];
}

interface PdfOptions {
  format: string;
  path: string;
}

// Configuration constants
const CONFIG = {
  FONT_PACKAGE: '@fontsource-variable/inter',
  FONT_PLACEHOLDER: '/* INTER_FONT_CSS_PLACEHOLDER */',
  PATHS: {
    FONT_CSS: 'index.css',
    RESUME_STYLES: 'src/modules/resume-generator/resume-styles.css',
    OUTPUT_DIR: 'src/assets/pdf_output',
    HTML_OUTPUT: 'output.html',
    PDF_OUTPUT: 'output.pdf'
  },
  PDF_FORMAT: 'A4' as const
};

// Utility Functions
async function findProjectRoot(): Promise<string> {
  let currentDir = process.cwd();
  
  while (true) {
    try {
      await fs.access(path.join(currentDir, 'package.json'));
      return currentDir;
    } catch {
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) {
        throw new Error('Could not find project root (package.json not found)');
      }
      currentDir = parentDir;
    }
  }
}

async function loadInterFontCSS(projectRoot: string): Promise<string> {
  try {
    const fontPath = path.resolve(projectRoot, 'node_modules', CONFIG.FONT_PACKAGE);
    const fontCssPath = path.join(fontPath, CONFIG.PATHS.FONT_CSS);
    
    const rawFontCss = await fs.readFile(fontCssPath, 'utf8');
    
    // Convert relative URLs to absolute file URLs for PDF generation
    return rawFontCss.replace(
      /url\(\.\/(files\/[^)]+)\)/g,
      `url(file://${fontPath}/$1)`
    );
  } catch (error) {
    throw new Error(`Failed to load Inter font CSS: ${error}`);
  }
}

async function loadAndProcessStyles(projectRoot: string, fontCSS: string): Promise<string> {
  try {
    const stylesPath = path.join(projectRoot, CONFIG.PATHS.RESUME_STYLES);
    const rawStyles = await fs.readFile(stylesPath, 'utf8');
    
    return rawStyles.replace(CONFIG.FONT_PLACEHOLDER, fontCSS);
  } catch (error) {
    throw new Error(`Failed to load resume styles: ${error}`);
  }
}

async function ensureFileDeleted(filePath: string): Promise<void> {
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
    console.log(`Deleted existing file: ${path.basename(filePath)}`);
  } catch (err: any) {
    if (err.code !== "ENOENT") {
      throw new Error(`Failed to delete file ${filePath}: ${err.message}`);
    }
  }
}

async function formatHTML(html: string): Promise<string> {
  try {
    return await prettier.format(html, {
      parser: "html",
      printWidth: 120,
      tabWidth: 2
    });
  } catch (error) {
    console.warn('Failed to format HTML, using original:', error);
    return html;
  }
}

// Template Functions
function renderExperienceItem(exp: Experience): string {
  const endDateDisplay = exp.endDate 
    ? `${exp.endDate.month} ${exp.endDate.year}`
    : 'Present';
  
  const achievements = exp.achievements
    .map(achievement => `<li>${achievement}</li>`)
    .join('');
    
  return `
    <div class="experience-header">
      <div>
        <span>${exp.role}</span>,
        <span>${exp.companyName}</span>,
        <span>${exp.companyLocation}</span>
      </div>
      <div>
        <span>${exp.startDate.month} ${exp.startDate.year}</span> -
        <span>${endDateDisplay}</span>
      </div>
    </div>
    <div class="experience-bullets">
      <ul>${achievements}</ul>
    </div>
  `;
}

function generateResumeHTML(data: ResumeData, styles: string): string {
  const { basicInfo, experience } = data;
  
  const experienceHTML = experience
    .map(renderExperienceItem)
    .join('');
    
  return `
    <main>
      <header>
        <div id='name'>
          <h1>${basicInfo.name.toUpperCase()}</h1>
        </div>
        <div>
          <p id='title'>${basicInfo.jobRole}</p>
        </div>
        <div>
          <span>${basicInfo.location}</span> | 
          <span>${basicInfo.contactInfo.email}</span> |
          <span>${basicInfo.contactInfo.phone}</span>
        </div>
      </header>
      <div class="divider"></div>
      <h2>Profile</h2>
      <div class="divider"></div>
      <div>
        <p>${basicInfo.summary}</p>
      </div>
      <hr>
      <h2>Professional Experience</h2>
      <hr>
      ${experienceHTML}
      <hr>
      <h2>Technical Skills</h2>
      <hr>
    </main>
    <style>${styles}</style>
  `.replace(/\s+/g, " ");
}

// PDF Generation
async function generatePDF(html: string, outputPath: string): Promise<void> {
  const options: PdfOptions = {
    format: CONFIG.PDF_FORMAT,
    path: outputPath
  };
  
  try {
    await html_to_pdf.generatePdf({ content: html }, options);
    console.log(`PDF generated: ${path.basename(outputPath)}`);
  } catch (error) {
    throw new Error(`Failed to generate PDF: ${error}`);
  }
}

// Main execution function
async function main(): Promise<void> {
  try {
    console.log('Starting resume generation...');
    
    // Step 1: Find project root and setup paths
    const projectRoot = await findProjectRoot();
    const outputDir = path.join(projectRoot, CONFIG.PATHS.OUTPUT_DIR);
    const htmlPath = path.join(outputDir, CONFIG.PATHS.HTML_OUTPUT);
    const pdfPath = path.join(outputDir, CONFIG.PATHS.PDF_OUTPUT);
    
    // Step 2: Load and process styles (concurrent operations)
    const [fontCSS] = await Promise.all([
      loadInterFontCSS(projectRoot)
    ]);
    
    const processedStyles = await loadAndProcessStyles(projectRoot, fontCSS);
    
    // Step 3: Generate HTML content
    const htmlContent = generateResumeHTML(pageConfig as ResumeData, processedStyles);
    const formattedHTML = await formatHTML(htmlContent);
    
    // Step 4: Clean up existing files and generate new ones (concurrent)
    await Promise.all([
      ensureFileDeleted(htmlPath),
      ensureFileDeleted(pdfPath)
    ]);
    
    // Step 5: Write HTML file
    await fs.writeFile(htmlPath, formattedHTML, 'utf8');
    console.log(`HTML generated: ${CONFIG.PATHS.HTML_OUTPUT}`);
    
    // Step 6: Generate PDF
    await generatePDF(formattedHTML, pdfPath);
    
    console.log('✅ Resume generation completed successfully!');
    
  } catch (error) {
    console.error('❌ Resume generation failed:', error);
    process.exit(1);
  }
}

// Execute main function
main();
