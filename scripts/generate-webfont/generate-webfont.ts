// version: "^11.2.4"
// script: "generate:webfont": "cross-env TS_NODE_PROJECT=scripts/generate-webfont/tsconfig.webfont.json ts-node scripts/generate-webfont/generate-webfont",
import {performance} from 'perf_hooks';
import fs from 'fs-extra';
import path from 'path';
import webfont from 'webfont';
import nunjucks from 'nunjucks';
import {
  EnumClassTemplateFileData,
  GlyphMetadata, HtmlPreviewTemplateFileData,
  IWebfontrcConfig, ScssData, ScssMulticolorTemplateFileData,
  ScssReferenceTemplateFileData,
  WebfontResult,
  WebfontResultKey,
  OptionsBase,
  InitialOptions,
} from './generate-webfont.interface';
import {
  getGlyphiconsName,
  getMulticolorGlyphBaseName, getMulticolorGlyphiconsName,
  isMulticolorGlyph,
  kebabCaseToPascalCase,
  kebabCaseToSnakeCase,
  makeDir,
  replaceAll,
  sassToCss,
} from './generate-webfont.utils';
import { IGNORE_RESULT_KEYS, SUFFIX, TEMPLATE } from './generate-webfont.const';
log(`Starting - process time pass ${process.uptime().toFixed(2)}s`)
const startMeasureTime: number = performance.now();

const webfontrcGeneralConfig: IWebfontrcConfig = JSON.parse(fs.readFileSync('./.webfontrc', 'utf8'));
webfontrcGeneralConfig.referenceScssFile = webfontrcGeneralConfig.referenceScssFile === undefined ? true : webfontrcGeneralConfig.referenceScssFile;
webfontrcGeneralConfig.referenceEnumFile = webfontrcGeneralConfig.referenceEnumFile === undefined ? true : webfontrcGeneralConfig.referenceEnumFile;

if (webfontrcGeneralConfig.template === 'styl') {
  console.error('\nTemplate type styl needs to be develop and not supported right now\n')
  const exitCode = 1;
  process.exit(exitCode);
}

/* const multicolorPathRgex: RegExp = /-path[1-9]([0-9]*).svg$/g; */
const monochromaticGlyphs: GlyphMetadata[] = [];
const multicolorGlyphs: Record<string, GlyphMetadata[]> = {};
const allGlyphs: GlyphMetadata[] = [];

startGenerate({
  files: webfontrcGeneralConfig.files,
  template: webfontrcGeneralConfig.template || 'css',
  embedFontList: webfontrcGeneralConfig.embedFontList || (webfontrcGeneralConfig.formats || ['svg', 'ttf', 'eot', 'woff', 'woff2']),
// @ts-ignore
  glyphTransformFn: (glyph: GlyphMetadata): GlyphMetadata => {
    if (!!isMulticolorGlyph(glyph)) {
      const baseName = getMulticolorGlyphBaseName(glyph);
      if (!multicolorGlyphs[baseName]) {
        multicolorGlyphs[baseName] = [];
      }
      multicolorGlyphs[baseName].push(glyph);
    } else {
      monochromaticGlyphs.push(glyph);
    }
    allGlyphs.push(glyph);
    return glyph;
  },
}).catch((error) => {
  log(error.stack);
  console.log('\n');
  const exitCode = typeof error.code === 'number' ? error.code : 1;
  process.exit(exitCode); // eslint-disable-line no-process-exit
});

async function startGenerate(webfontInitOptions: InitialOptions) {
  const result: WebfontResult = await webfont(webfontInitOptions) as WebfontResult;
  const externalLibPassTime: number = performance.now() - startMeasureTime;
  log(`External lib time: ${(externalLibPassTime/1000).toFixed(2)}s.`)
  nunjucks.configure(__dirname);
  await Promise.all([
    makeFontCustomDistPath(result).catch(err => { log('Task makeFontCustomDistPath failed!'); throw err; }),
    makeStylesCustomDistPath(result).catch(err => { log('Task makeStylesCustomDistPath failed!'); throw err; }),
  ]);
  const tasks = result.config.template === 'json' ? [Promise.resolve()] : [
    webfontrcGeneralConfig.referenceEnumFile ? saveEnumFile(result).catch(err => { log('Task saveEnumFile failed!'); throw err; }) : Promise.resolve(),
    ...saveMulticolorAndReferenceAndPreviewHtmlFiles(result),
  ];
  await Promise.all([
    ...saveFontsAndStyleFile(result),
    ...tasks
  ]);
  const webfontProcessTime: number = performance.now() - startMeasureTime;
  const internalPassTime: number = webfontProcessTime - externalLibPassTime;
  log(`Internal task time: ${(internalPassTime/1000).toFixed(2)}s.`)
  log(`Total time: ${(webfontProcessTime/1000).toFixed(2)}s.`)
  log('Complete');
  return result;
}

function makeFontCustomDistPath(result: WebfontResult): Promise<void> {
  const fontCustomDirectory: string = path.resolve(result.config.dest);
  return makeDir(fontCustomDirectory);
}

function makeStylesCustomDistPath(result: WebfontResult): Promise<void> {
  const {template, destTemplate} = result.config;
  if (!template) {
    return Promise.resolve();
  }

  const templateDirectory: string = path.resolve(destTemplate);
  return makeDir(templateDirectory);
}

function saveFontsAndStyleFile(result: WebfontResult): Promise<void>[] {
  const destinationTemplatePath: string = getDestinationTemplatePath(result);
  const config: OptionsBase & IWebfontrcConfig = result.config;
  const resultKeys: WebfontResultKey[] = Object.keys(result) as WebfontResultKey[];
  return resultKeys.reduce((filesToSave: Promise<void>[], type: WebfontResultKey): Promise<void>[] => {
    if (!IGNORE_RESULT_KEYS.includes(type)) {
      const content: string | Buffer | Uint8Array = result[type] as string | Buffer | Uint8Array;
      const destinationPath: string = type === 'template' ? destinationTemplatePath : path.join(config.dest, `${config.fontName}.${type}`);
      let file = path.resolve(destinationPath);
      const fileToSave: Promise<void> = fs.writeFile(file, content).catch(err => { console.log(`Saving file ${file} failed!`); throw err; });
      filesToSave.push(fileToSave);
    }
    return filesToSave;
  }, []);
}

function getDestinationTemplatePath(result: WebfontResult): string {
  const config: OptionsBase & IWebfontrcConfig = result.config;
  let destinationTemplatePath: string = (config.destTemplate || config.dest);
  if (result.usedBuildInTemplate) {
    destinationTemplatePath = path.join(
      destinationTemplatePath,
      `${config.fontName}.${config.template}`,
    );
  } else {
    const fileName: string = path.basename(config.template as string).replace('.njk', '');
    const ext: string = fileName.substr(fileName.lastIndexOf('.') + 1);
    const generatedFileName: string = `${config.customTemplateName}.${ext}`;
    destinationTemplatePath = path.join(
      destinationTemplatePath,
      generatedFileName,
    );
  }

  return destinationTemplatePath;
}

function saveEnumFile(result: WebfontResult): Promise<void> {
  const buildInTemplateDirectory: string = path.resolve(__dirname);
  const classMap: string = generateEnumClassMap(result, buildInTemplateDirectory);
  return saveEnum(SUFFIX.ENUM_CLASS, result, classMap);
}

function generateEnumClassMap(result: WebfontResult, buildInTemplateDirectory: string): string {
  log('Generating Enum Class Map File');
  const projectName: string = kebabCaseToPascalCase(result.config.fontName);
  const multicolorGlyphsNames: {name: string}[] = (Object.keys(webfontrcGeneralConfig.multicolorMap || {}).map(name => ({name: name})));
  const multicolorPascalCase: {name: string, variableName: string, snakeName: string}[] = multicolorGlyphsNames.map((glyph) => ({...glyph, variableName: kebabCaseToSnakeCase(glyph.name).toUpperCase(), snakeName: kebabCaseToSnakeCase(glyph.name)}));
  const monochromaticPascalCase: (GlyphMetadata & {variableName: string, snakeName: string})[] = monochromaticGlyphs.map((glyph: GlyphMetadata) => ({...glyph, variableName: kebabCaseToSnakeCase(glyph.name).toUpperCase(), snakeName: kebabCaseToSnakeCase(glyph.name)}));
  const data: EnumClassTemplateFileData = Object.assign({}, getScssData(result.config), {projectName, monochromaticPascalCase, multicolorPascalCase});
  return nunjucks.render(`${buildInTemplateDirectory}/${TEMPLATE.ENUM_CLASS}`, data);
}

async function saveEnum(fileName: string, result: WebfontResult, enumText: string ): Promise<void> {
  const path: string = result.config.referenceEnumFileDestination ? await getReferenceEnumFileFullPath(fileName, result) : getDestTemplateFullPath(fileName, result);
  return saveFile(path, enumText);
}

async function getReferenceEnumFileFullPath(fileName: string, result: WebfontResult ): Promise<string> {
  await makeDir(result.config.referenceEnumFileDestination as string);
  const fullFileName: string = getFullFileName(fileName, result);
  return `${result.config.referenceEnumFileDestination}/${fullFileName}`;
}

function saveMulticolorAndReferenceAndPreviewHtmlFiles(result: WebfontResult): Promise<void>[] {
  const buildInTemplateDirectory: string = path.resolve(__dirname);
  const scssMulticolor: string = generateScssMulticolor(result, buildInTemplateDirectory);
  return [
    saveMulticolor(result, scssMulticolor).catch(err => { log('Task saveMulticolor failed!'); throw err; }),
    saveReference(result, buildInTemplateDirectory).catch(err => { log('Task saveReference failed!'); throw err; }),
    generateHtml(result, buildInTemplateDirectory, scssMulticolor).catch(err => { log('Task generateHtml failed!'); throw err; }),
  ];
}

function generateScssMulticolor(result: WebfontResult, buildInTemplateDirectory: string): string {
  log('Generating Scss Multicolor File');
  const glyphsColors: Record<string, string[]> = webfontrcGeneralConfig.multicolorMap || {};
  const data: ScssMulticolorTemplateFileData = Object.assign({}, getScssData(result.config), {multicolorGlyphs, glyphsColors});
  return nunjucks.render(`${buildInTemplateDirectory}/${TEMPLATE.SCSS_MULTICOLOR}`, data);
}

function saveMulticolor(result: WebfontResult, scssMulticolor: string): Promise<void> {
  if (result.config.template === 'css') {
    return saveCssFile(`${SUFFIX.MULTICOLOR_FILE_NAME}.css`, result, scssMulticolor);
  } else {
    return saveScssFile(`${SUFFIX.MULTICOLOR_FILE_NAME}.scss`, result, scssMulticolor);
  }
}

function saveReference(result: WebfontResult, buildInTemplateDirectory: string): Promise<void> {
  if (result.config.template === 'css' || !webfontrcGeneralConfig.referenceScssFile) {
    return Promise.resolve();
  } else {
    log('Generating Scss Reference File');
    const sccsReferance: string = generateScssReference(result, buildInTemplateDirectory);
    return saveScssFile(`${SUFFIX.REFERENCE_FILE_NAME}.scss`, result, sccsReferance);
  }
}

function generateScssReference(result: WebfontResult, buildInTemplateDirectory: string): string  {
  const data: ScssReferenceTemplateFileData = Object.assign({}, getScssData(result.config), {glyphs: allGlyphs});
  return nunjucks.render(`${buildInTemplateDirectory}/${TEMPLATE.SCSS_REFERENCE}`, data);
}

function saveScssFile(fileName: string, result: WebfontResult, scssText: string ): Promise<void> {
  const path: string = getDestTemplateFullPath(fileName, result);
  return saveFile(path, scssText);
}

function saveCssFile(fileName: string, result: WebfontResult, scssText: string ): Promise<void> {
  const path: string = getDestTemplateFullPath(fileName, result);
  const cssText: string = sassToCss(scssText);
  return saveFile(path, cssText);
}

function getDestTemplateFullPath(fileName: string, result: WebfontResult ): string {
  const fullFileName: string = getFullFileName(fileName, result);
  return `${result.config.destTemplate}/${fullFileName}`;
}

function getFullFileName(fileName: string, result: WebfontResult ): string {
  const filePrefixName: string = result.usedBuildInTemplate ? result.config.fontName : result.config.customTemplateName;
  return `${filePrefixName}${fileName}`;
}

function saveFile(path: string, text: string ): Promise<void> {
  return fs.writeFile(path, text);
}

function getScssData(options: OptionsBase): ScssData {
  return {
    className: (options.templateClassName ? options.templateClassName : options.fontName) as string,
    fontName: (options.templateFontName ? options.templateFontName : options.fontName) as string,
  };
}

function generateHtml(result: WebfontResult, buildInTemplateDirectory: string, scssMulticolor: string): Promise<void> {
  log('Generating Preview Html');
  const htmlPreviewPath: string = `${result.config.dest}/${result.config.fontName}-preview.html`;
  const htmlPreviewText: string = nunjucks.render(`${buildInTemplateDirectory}/${TEMPLATE.PREVIEW_HTML}`, getHtmlData(result, scssMulticolor));
  return saveFile(htmlPreviewPath, htmlPreviewText);
}

function getHtmlData(result: WebfontResult, scssMulticolor: string): HtmlPreviewTemplateFileData {
  return {
    title: result.config.title,
    baseClass: result.config.templateClassName,
    classPrefix: result.config.templateClassName + '-',
    stylesFileName: result.config.customTemplateName,
    monochromaticStyles: getHtmlIconStyles(result),
    multicolorStyles: getHtmlMulticolorIconStyles(scssMulticolor),
    monochromaticGlyphsName: getGlyphiconsName(monochromaticGlyphs),
    multicolorGlyphsName: getMulticolorGlyphiconsName(multicolorGlyphs),
  };
}

function getHtmlIconStyles(result: WebfontResult): string {
  const templateInCssOrScssType: string = result.template!;
  const css: string = result.config.template === 'css' ? templateInCssOrScssType : sassToCss(templateInCssOrScssType);
  return fixFontPathInHtmlPreview(css, result.config.templateFontPath);
}

function fixFontPathInHtmlPreview(css: string, templateFontPath: string): string {
  return replaceAll(css, templateFontPath, './');
}

function getHtmlMulticolorIconStyles(scssMulticolor: string): string {
  return sassToCss(scssMulticolor);
}

function log(text: string) {
  console.log(`[WebFont] ${text}`);
}
