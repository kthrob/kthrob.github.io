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
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  displayHeaderFooter?: boolean;
  footerTemplate?: string;
  printBackground?: boolean;
  preferCSSPageSize?: boolean;
}

// Configuration constants
const CONFIG = {
  FONT_PACKAGE: '@fontsource-variable/inter',
  FONT_PLACEHOLDER: '/* INTER_FONT_CSS_PLACEHOLDER */',
  PATHS: {
    FONT_CSS: 'index.css',
    SCREENSHOT_STYLES: 'src/modules/resume-generator/resume-screenshot-styles.css',
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

async function loadScreenshotStyles(projectRoot: string, fontCSS: string): Promise<string> {
  try {
    const screenshotStylesPath = path.join(projectRoot, CONFIG.PATHS.SCREENSHOT_STYLES);
    const rawStyles = await fs.readFile(screenshotStylesPath, 'utf8');
    
    // Replace the font placeholder with actual Inter font CSS
    const stylesWithFont = rawStyles.replace(CONFIG.FONT_PLACEHOLDER, fontCSS);
    
    console.log('Loading screenshot-style CSS...');
    return stylesWithFont;
  } catch (error) {
    throw new Error(`Failed to load screenshot styles: ${error}`);
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
    .map(achievement => `<li><span class="bullet">•</span>${achievement}</li>`)
    .join('');
    
  return `
    <div class="experience-entry">
      <div class="experience-header">
        <div>
          <span class="experience-title">${exp.role}</span>, 
          <span class="experience-company">${exp.companyName}</span>, 
          <span class="experience-location">${exp.companyLocation}</span>
        </div>
        <div class="experience-dates">
          ${exp.startDate.month} ${exp.startDate.year} — ${endDateDisplay}
        </div>
      </div>
      <div class="experience-description">
        ${exp.role} at ${exp.companyName}, driving software development and product innovation.
      </div>
      <div class="experience-bullets">
        <ul>${achievements}</ul>
      </div>
    </div>
  `;
}

function generateResumeHTML(data: ResumeData): string {
  const { basicInfo, experience } = data;
  
  const experienceHTML = experience
    .map(renderExperienceItem)
    .join('');
  
  const skillsHTML = `
    <div class="skills-grid">
      <div class="skills-category">Ecmascript/Typescript</div>
      <div class="skills-category">ReactJS</div>
      <div class="skills-category">NodeJS</div>
      <div class="skills-category">System Optimization</div>
      <div class="skills-category">Docker</div>
      <div class="skills-category">JAMstack</div>
      <div class="skills-category">PostgreSQL</div>
      <div class="skills-category"></div>
    </div>
  `;
  
  const educationHTML = `
    <div class="education-entry">
      <div class="education-header">
        <div>
          <div class="education-degree">Architectural Engineering in interior design</div>
          <div class="education-school">Western Iowa Tech Community College</div>
        </div>
        <div class="education-dates">January 2009 — January 2011</div>
      </div>
    </div>
    <div class="education-entry">
      <div class="education-header">
        <div>
          <div class="education-degree">Architectural Engineering</div>
          <div class="education-school">Iowa State University</div>
        </div>
        <div class="education-dates">January 2004 — January 2006</div>
      </div>
    </div>
  `;
    
  return `
    <div class="resume-container">
      <!-- Header Section -->
      <header>
        <h1 class="resume-name">${basicInfo.name.toUpperCase()}</h1>
        <h2 class="resume-title">${basicInfo.jobRole}</h2>
        <div class="resume-contact">
          <span>${basicInfo.location}</span> | 
          <span>${basicInfo.contactInfo.email}</span> | 
          <span>${basicInfo.contactInfo.phone}</span> | 
          <span>github.com/kthrob</span>
        </div>
      </header>
      
      <!-- Profile Section -->
      <h2 class="section-header">Profile</h2>
      <p>${basicInfo.summary}</p>
      
      <!-- Professional Experience Section -->
      <h2 class="section-header">Professional Experience</h2>
      ${experienceHTML}
      
      <!-- Technical Skills Section -->
      <h2 class="section-header">Technical Skills</h2>
      ${skillsHTML}
      
      <!-- Education Section -->
      <h2 class="section-header">Education</h2>
      ${educationHTML}
    </div>
  `.replace(/\s+/g, " ");
}

// PDF Generation using html-pdf-node options
// Reference: https://github.com/mrafiqk/html-pdf-node
async function generatePDF(html: string, outputPath: string): Promise<void> {
  const options = {
    format: CONFIG.PDF_FORMAT,
    path: outputPath,
    margin: {
      top: '0.75in',
      right: '0.75in', 
      bottom: '1in',
      left: '0.75in'
    },
    displayHeaderFooter: true,
    footerTemplate: `
      <div style="font-size: 9pt; color: #666; text-align: center; width: 100%;">
        <span class="pageNumber"></span>
      </div>
    `,
    printBackground: true,
    preferCSSPageSize: false
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
    
    // Step 2: Load font CSS
    const fontCSS = await loadInterFontCSS(projectRoot);
    
    // Step 3: Load screenshot-style CSS
    const screenshotStyles = await loadScreenshotStyles(projectRoot, fontCSS);
    
    // Step 4: Generate HTML content and combine with styles
    const htmlContentWithoutStyles = generateResumeHTML(pageConfig as ResumeData);
    const htmlContentWithStyles = `${htmlContentWithoutStyles}<style>${screenshotStyles}</style>`;
    const formattedHTML = await formatHTML(htmlContentWithStyles);
    
    // Step 5: Clean up existing files
    await Promise.all([
      ensureFileDeleted(htmlPath),
      ensureFileDeleted(pdfPath)
    ]);
    
    // Step 6: Write HTML file
    await fs.writeFile(htmlPath, formattedHTML, 'utf8');
    console.log(`HTML generated: ${CONFIG.PATHS.HTML_OUTPUT}`);
    
    // Step 7: Generate PDF
    await generatePDF(formattedHTML, pdfPath);
    
    console.log('✅ Resume generation completed successfully!');
    
  } catch (error) {
    console.error('❌ Resume generation failed:', error);
    process.exit(1);
  }
}

// Execute main function
main();
