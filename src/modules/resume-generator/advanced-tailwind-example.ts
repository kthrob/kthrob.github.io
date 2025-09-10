import { promises as fs } from "node:fs";
import path from "path";
import { execAsync } from "child_process";
import { promisify } from "util";

const exec = promisify(execAsync);

/**
 * ADVANCED EXAMPLE: Full TailwindCSS compilation with CLI
 * 
 * This demonstrates how you could use TailwindCSS CLI for full compilation
 * if you needed more advanced features like:
 * - Custom TailwindCSS configuration
 * - Complex utility combinations
 * - Custom plugins
 * - Automatic purging based on actual HTML content
 */

interface TailwindConfig {
  content: string[];
  theme?: {
    extend?: Record<string, any>;
  };
  plugins?: string[];
}

class AdvancedTailwindCompiler {
  private projectRoot: string;
  private tempDir: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.tempDir = path.join(projectRoot, 'temp-tailwind');
  }

  /**
   * Method 1: Using TailwindCSS CLI with temporary files
   */
  async compileWithCLI(htmlContent: string, customCSS: string): Promise<string> {
    try {
      // Create temporary directory
      await fs.mkdir(this.tempDir, { recursive: true });

      // Create temporary input CSS file
      const inputCSSPath = path.join(this.tempDir, 'input.css');
      const inputCSS = `
        @import 'tailwindcss';
        
        ${customCSS}
        
        /* Custom resume utilities */
        @layer utilities {
          .resume-accent {
            color: #0022ff;
          }
          .resume-border {
            border-color: #0022ff;
          }
        }
      `;
      
      await fs.writeFile(inputCSSPath, inputCSS);

      // Create temporary HTML file for content scanning
      const htmlPath = path.join(this.tempDir, 'content.html');
      await fs.writeFile(htmlPath, htmlContent);

      // Create temporary Tailwind config
      const configPath = path.join(this.tempDir, 'tailwind.config.js');
      const config: TailwindConfig = {
        content: [htmlPath],
        theme: {
          extend: {
            colors: {
              'resume-accent': '#0022ff',
            },
          },
        },
      };

      await fs.writeFile(configPath, `module.exports = ${JSON.stringify(config, null, 2)}`);

      // Run TailwindCSS CLI
      const outputPath = path.join(this.tempDir, 'output.css');
      const tailwindCommand = `npx tailwindcss -c ${configPath} -i ${inputCSSPath} -o ${outputPath} --minify`;
      
      await exec(tailwindCommand);

      // Read the compiled CSS
      const compiledCSS = await fs.readFile(outputPath, 'utf8');

      // Cleanup
      await this.cleanup();

      return compiledCSS;
    } catch (error) {
      await this.cleanup();
      throw new Error(`TailwindCSS CLI compilation failed: ${error}`);
    }
  }

  /**
   * Method 2: Using TailwindCSS programmatically with PostCSS
   * (This would work with proper TailwindCSS v3 setup)
   */
  async compileWithPostCSS(htmlContent: string, customCSS: string): Promise<string> {
    // This is a placeholder for the PostCSS method
    // In a real implementation, you would:
    
    // 1. Import postcss and tailwindcss
    // const postcss = require('postcss');
    // const tailwindcss = require('tailwindcss');
    
    // 2. Create a PostCSS processor
    // const processor = postcss([
    //   tailwindcss({
    //     content: [{ raw: htmlContent, extension: 'html' }],
    //     theme: {
    //       extend: {
    //         colors: {
    //           'resume-accent': '#0022ff',
    //         },
    //       },
    //     },
    //   }),
    // ]);
    
    // 3. Process the CSS
    // const result = await processor.process(inputCSS, { from: undefined });
    // return result.css;

    // For now, return a placeholder
    throw new Error('PostCSS method not implemented in this example');
  }

  /**
   * Method 3: Using TailwindCSS Standalone CLI (recommended for simple cases)
   */
  async compileWithStandalone(htmlContent: string): Promise<string> {
    try {
      // Create temp directory
      await fs.mkdir(this.tempDir, { recursive: true });

      // Write HTML content to temp file
      const htmlPath = path.join(this.tempDir, 'content.html');
      await fs.writeFile(htmlPath, htmlContent);

      // Create input CSS with Tailwind directives
      const inputCSSPath = path.join(this.tempDir, 'input.css');
      const inputCSS = `
        @import 'tailwindcss/base';
        @import 'tailwindcss/components';
        @import 'tailwindcss/utilities';
        
        @layer utilities {
          .resume-accent {
            color: #0022ff;
          }
        }
      `;
      
      await fs.writeFile(inputCSSPath, inputCSS);

      // Use TailwindCSS standalone binary (if available)
      const outputPath = path.join(this.tempDir, 'output.css');
      const command = `npx @tailwindcss/cli -i ${inputCSSPath} -o ${outputPath} --content "${htmlPath}" --minify`;
      
      await exec(command);

      const compiledCSS = await fs.readFile(outputPath, 'utf8');
      
      await this.cleanup();
      return compiledCSS;
    } catch (error) {
      await this.cleanup();
      throw new Error(`Standalone compilation failed: ${error}`);
    }
  }

  private async cleanup(): Promise<void> {
    try {
      await fs.rm(this.tempDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to cleanup temp directory:', error);
    }
  }
}

/**
 * Example usage function
 */
export async function generateResumeWithFullTailwind(
  projectRoot: string,
  htmlContent: string,
  customCSS: string = ''
): Promise<string> {
  const compiler = new AdvancedTailwindCompiler(projectRoot);
  
  try {
    // Try different compilation methods in order of preference
    
    // Method 1: CLI with full config (most features)
    try {
      console.log('Attempting CLI compilation...');
      return await compiler.compileWithCLI(htmlContent, customCSS);
    } catch (error) {
      console.warn('CLI compilation failed:', error.message);
    }

    // Method 2: Standalone CLI (simpler, fewer dependencies)
    try {
      console.log('Attempting standalone compilation...');
      return await compiler.compileWithStandalone(htmlContent);
    } catch (error) {
      console.warn('Standalone compilation failed:', error.message);
    }

    // Method 3: Fallback to manual utility CSS (what we're currently using)
    console.log('Using fallback manual utility CSS...');
    return generateManualTailwindCSS(customCSS);

  } catch (error) {
    throw new Error(`All TailwindCSS compilation methods failed: ${error}`);
  }
}

function generateManualTailwindCSS(customCSS: string = ''): string {
  return `
    ${customCSS}
    
    /* Manual TailwindCSS-style utilities */
    .max-w-4xl { max-width: 56rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .p-8 { padding: 2rem; }
    .bg-white { background-color: white; }
    .text-3xl { font-size: 1.875rem; }
    .font-bold { font-weight: 700; }
    .uppercase { text-transform: uppercase; }
    .tracking-wide { letter-spacing: 0.1em; }
    .text-center { text-align: center; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .text-lg { font-size: 1.125rem; }
    .font-medium { font-weight: 500; }
    .text-sm { font-size: 0.875rem; }
    .leading-relaxed { line-height: 1.625; }
    .flex { display: flex; }
    .justify-between { justify-content: space-between; }
    .items-start { align-items: flex-start; }
    .list-disc { list-style-type: disc; }
    .list-inside { list-style-position: inside; }
    .ml-4 { margin-left: 1rem; }
    .border-t { border-top-width: 1px; }
    
    /* Color utilities */
    .text-gray-600 { color: #4B5563; }
    .text-gray-700 { color: #374151; }
    .text-gray-900 { color: #111827; }
    .text-blue-600 { color: #2563EB; }
    .border-blue-600 { border-color: #2563EB; }
    
    /* Custom resume utilities */
    .resume-accent { color: #0022ff; }
    .resume-border { border-color: #0022ff; }
  `;
}

export { AdvancedTailwindCompiler };
