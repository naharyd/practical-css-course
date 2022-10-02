import mkdirp from 'mkdirp';
import sass from 'node-sass';
import path from 'path';
import { GlyphMetadata } from './generate-webfont.interface';
import fs from 'fs-extra';

const multicolorRgex: RegExp = /-path[1-9]([0-9]*)$/g;

export function isMulticolorGlyph(glyph: GlyphMetadata): RegExpMatchArray | null {
  return glyph.name.match(multicolorRgex);
}

export function getMulticolorGlyphBaseName(glyph: GlyphMetadata): string {
  return `${glyph.name.replace(multicolorRgex, '')}`;
}

export function getMulticolorGlyphiconsName(glyphs: Record<string, GlyphMetadata[]>): Record<string, string[]> {
  const multicolor: Record<string, string[]> = {};
  for (const key in glyphs) {
    multicolor[key] = getGlyphiconsName(glyphs[key]);
  }
  return multicolor;
}

export function getGlyphiconsName(glyphs: GlyphMetadata[]): string[] {
  return glyphs.map((glyph: GlyphMetadata) => path.basename(glyph.path, '.svg'));
}

export function kebabCaseToPascalCase(str: string): string {
  return str.split('-').map(function(word){return word.slice(0, 1).toUpperCase() + word.slice(1, word.length)}).join('');
}

export function kebabCaseToSnakeCase(name: string): string {
  return replaceAll(name, '-', '_');
}

export function replaceAll(target: string, search: string, replacement: string): string {
  return target.replace(new RegExp(search, 'g'), replacement);
}

export function sassToCss(sassData: string): string {
  let cssBuffer = sass.renderSync({
    data: sassData,
  });
  return cssBuffer.css.toString();
}

export async function makeDir(path: string): Promise<void> {
  return fs.existsSync(path) ? Promise.resolve() : mkdirp(path) as Promise<void>;
}

/*export async function makeDir(path: string): Promise<void> {
  return fs.existsSync(path) ? Promise.resolve() : new Promise<void>((resolve, reject) => {
    // @ts-ignore
    mkdirp(path, (error: string | number | undefined) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}*/

/*
** caching behavior - if data didn't changed (svg, configuration and file exist) then do not generate the fonts **
const md5: Hash = crypto.createHash('md5');
export function makeDirSync(path: string): void {
  if (!fs.existsSync(path)) {
    mkdirp.sync(path);
  }
}

function hash() {
  const hash: string = getHash(md5, webfontrcGeneralConfig);
  const previousHash: string = readHash();
  log(`New hash: ${hash} - previous hash: ${previousHash}`);
  if (hash === previousHash) {
    log('Config and source files weren’t changed since last run, checking resulting files...');
    const generatedFiles: string[] = generatedFontFiles(webfontrcGeneralConfig.dest, webfontrcGeneralConfig.fontName, webfontrcGeneralConfig.formats as Formats);
    if (!generatedFiles.length){
      log('Font ' + webfontrcGeneralConfig.fontName + ' wasn’t changed since last run.');
    } else {
      const stylePath: string = getDestinationTemplatePath({
        usedBuildInTemplate: ['css', 'scss', 'json', 'styl'].includes(webfontrcGeneralConfig.template as string),
        config: { ...webfontrcGeneralConfig }
      } as WebfontResult);
      generatedFiles.push(stylePath);
      if (template !== 'json') {
        const htmlPreviewPath: string = `${webfontrcGeneralConfig.dest}/${webfontrcGeneralConfig.fontName}-preview.html`;
        generatedFiles.push(htmlPreviewPath);
        const buildInTemplateDirectory: string = path.resolve(__dirname);
        const multicolorFileName = webfontrcGeneralConfig.template === 'css' ? `${SUFFIX.MULTICOLOR_FILE_NAME}.css` : `${SUFFIX.MULTICOLOR_FILE_NAME}.scss`;
        const multicolorPath: string =  `${buildInTemplateDirectory}/${multicolorFileName}`
        generatedFiles.push(multicolorPath);
        if (webfontrcGeneralConfig.referenceScssFile) {
          md5.update(fs.readFileSync(`${buildInTemplateDirectory}/${TEMPLATE.SCSS_REFERENCE}`, 'utf8'));
        }
        if (webfontrcGeneralConfig.referenceEnumFile) {
          md5.update(fs.readFileSync(`${buildInTemplateDirectory}/${TEMPLATE.ENUM_CLASS}`, 'utf8'));
        }
      }
      // add all styles/ref/multicolor & enum file
      // check if exist


      /!*const template = options.template as string;
      const buildInTemplateDirectory: string = path.resolve(__dirname);
      console.log(globby.sync(`${buildInTemplateDirectory}/!**!/!*`));
      if (template !== 'json') {
        md5.update(fs.readFileSync(`${buildInTemplateDirectory}/${TEMPLATE.SCSS_MULTICOLOR}`, 'utf8'));
        md5.update(fs.readFileSync(`${buildInTemplateDirectory}/${TEMPLATE.PREVIEW_HTML}`, 'utf8'));
        if (webfontrcGeneralConfig.referenceScssFile) {
          md5.update(fs.readFileSync(`${buildInTemplateDirectory}/${TEMPLATE.SCSS_REFERENCE}`, 'utf8'));
        }
        if (webfontrcGeneralConfig.referenceEnumFile) {
          md5.update(fs.readFileSync(`${buildInTemplateDirectory}/${TEMPLATE.ENUM_CLASS}`, 'utf8'));
        }
      }*!/

    }
    return;
  }
  saveHash(hash);
}


/!**
 * Calculate hash to flush browser cache.
 * Hash is based on source SVG files contents, task options and source code (like templates, html preview, js code).
 *
 * @return {String}
 *!/
function getHash(md5: Hash, options: InitialOptions) {
  const foundFiles: string[] = globby.sync(options.files);
  const svgFiles: string[] = foundFiles.filter((foundFile) => path.extname(foundFile) === '.svg');
  // Source SVG files contents
  svgFiles.forEach(function(file: string) {
    md5.update(fs.readFileSync(file, 'utf8'));
  });


  // Source Code & Templates
  const sourceCodeDirectory: string = path.resolve(__dirname);
  const pathInUnix: string = replaceToUnixPath(path.join(sourceCodeDirectory, '**!/!*.*'));
  const sourceCodeAndTemplates = globby.sync(pathInUnix);
  // Source files & templates like: generate-webfont.html.njk, generate-webfont.ts, etc.
  sourceCodeAndTemplates.forEach(function(file: string) {
    md5.update(fs.readFileSync(file, 'utf8'));
  });

  // Options
  md5.update(JSON.stringify(options));
  return md5.digest('hex');
}

function saveHash(hash: string): void {
  const filePath: string = getHashPath();
  makeDirSync(path.dirname(filePath));
  fs.writeFileSync(filePath, hash);
}

function readHash(): string {
  const filePath = getHashPath();
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

function getHashPath() {
  return path.join(__dirname, '.cache', 'hash');
}

function generatedFontFiles(dest: string, fontFilename: string, formats: Formats): string[] {
  const mask: string = `*.{${formats.join(',')}}`;
  const fontsPath: string = path.join(dest, `${fontFilename}${mask}`);
  return globby.sync(replaceToUnixPath(fontsPath));
}

function replaceToUnixPath(path: string): string {
  return path.replace(/\\/g, '/');
}
*/
