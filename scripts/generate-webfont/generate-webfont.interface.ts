import { Result } from 'webfont/dist/src/types/Result';
import { OptionsBase } from 'webfont/dist/src/types/OptionsBase';
import { InitialOptions } from 'webfont/dist/src/types/InitialOptions';
import { Formats } from 'webfont/dist/src/types/Format';

// export * from 'webfont/dist/src/types/GlyphMetadata'; we are overriding it here
export * from 'webfont/dist/src/types/Result';
export * from 'webfont/dist/src/types/InitialOptions';
export * from 'webfont/dist/src/types/OptionsBase';
export *  from 'webfont/dist/src/types/WebfontOptions';
export *  from 'webfont/dist/src/types/Format';
export *  from 'webfont/dist/src/types/GlyphData';
export *  from 'webfont/dist/src/types/GlyphTransformFn';

export interface IWebfontrcConfig extends InitialOptions {
  /**
   * @description
   * Svg files path
   * @example
   * "svg-icons/**\/*.svg"
   */
  files: string;
  /**
   * @description
   * Generated Font name & Custom preview html name
   * @example
   * "eda-icon-name" will generate fonts with name "eda-icon-name-preview.html "eda-icon-name.eot" "eda-icon-name.svg", "eda-icon-name.ttf", "eda-icon-name.woff", "eda-icon-name.woff2"
   */
  fontName: string;
  /**
   * @description
   * CSS base class name
   * @default
   * webfont
   * @example
   * "eda-icon"
   */
  templateClassName: string;
  /**
   * @description
   * Path where generated fonts are going to be (location of the fonts) - path relative to destTemplate (style path).
   * It will set the font location in styles files and html preview file
   * @example
   * destTemplate path is "src/styles" and fonts located at "src/assets/fonts/mp-fonts" so path will be "./../assets/fonts/mp-fonts/"
   */
  templateFontPath: string;
  /**
   * @description
   * File name for SCSS/CSS/TS files
   * @example
   * "eda-icons" and type scss - result will be "eda-icons.enum.ts", "eda-icons.scss", "eda-icons-multicolor.scss", "eda-icons-reference.scss"
   */
  customTemplateName: string;
  /**
   * @description
   * Fonts destination folder
   * @example
   * "src/assets/fonts/mp-fonts" will generate there all fonts "eda-icon.eot" "eda-icon.svg", "eda-icon.ttf", "eda-icon.woff", "eda-icon.woff2"
   */
  dest: string;
  /**
   * @description
   * SCSS/CSS Destination folder
   * @example
   * "src/styles" will generate there all SCSS/CSS files "eda-icons.enum.ts", "eda-icons.scss", "eda-icons-multicolor.scss", "eda-icons-reference.scss"
   */
  destTemplate: string;
  /**
   * @description
   * Generated Style file type.
   * Possible values: css, scss, styl (stylus), json or custom template path
   * @example
   * custom template - template: "./scripts/generate-webfont/generate-webfont.scss.njk"
   * css - template: "css"
   * scss - template: "scss"
   * json - template: "json" (** for json type we will not render html preview, enum files). more details in JsonTemplateStructure
   */
  template?: "css" | string;
  /**
   * @description
   * Render a scss reference file for all numeric value (icon position in font)
   * @default
   * true
   * @example
   * $eda-icon-att-globe: "\ea02";
   */
  referenceScssFile?: boolean;
  /**
   * @description
   * Render a enum file for CSS class name & Ligature text value for fonts.
   * Using this file to put the icons in HTML instead of writing it implicitly inline will help AOT build process to indicate if icon name was changed (build will fail)
   * @default
   * true
   * @example
   * Class name:
   * ATT_GLOBE = 'eda-icon-att-globe',
   * Ligature
   * ATT_GLOBE = 'att_globe',
   */
  referenceEnumFile?: boolean;
  /**
   * @description
   * location where enum file will be rendered
   * @default
   * destTemplate
   * @example
   * "referenceEnumFileDestination": "src/styles/enum-path-folder",
   */
  referenceEnumFileDestination?: string;
  /**
   * @description
   * Title for Custom Preview HTML
   * @example
   * "Eda Icons"
   */
  title: string;
  /**
   * @description
   * Font file types to generate.
   * @default
   * ['svg', 'ttf', 'eot', 'woff', 'woff2']
   * @example
   * ["woff2", "woff", "ttf", "eot"]
   */
  formats?: Formats;
  /**
   * @description
   * Set map of multicolor icons, key is the name of the icon, value is array of colors
   * Map Type - {[key: string]: string[]}
   * Note: multicolor files suffix end with *-path1.svg, -path2.svg, -path3.svg etc.
   * @example
   * {
   *  "empty-list": ["#D0E8FA", "#0568AE", "#1A1919", "#0768AE", "#1A1919"],
   *  "on-boarding-shape": ["rgba(249, 249, 249, 0.7)", "rgba(249, 249, 249, 0.7)", "rgba(249, 249, 249, 0.7)", "rgba(249, 249, 249, 0.7)", "rgba(73, 238, 220, 0.7)", "rgba(0, 87, 184, 0.5)", "rgba(0, 87, 184, 0.2)", "rgba(0, 159, 219, 0.5)"],
   *  "on-boarding-wizard-shape": ["rgba(0, 87, 184, 0.25)", "rgba(73, 238, 220, 0.35)", "rgba(0, 159, 219, 0.25)"]
   * }
   */
  multicolorMap: Record<string, string[]>;
  /**
   * @description
   * A custom cache string which will be added as a query param to the font url in the templates (css/scss etc.)
   * This will prevent the browser to load an old font from browser cache
   * Generated font url will be : [webfont].[ext]?[cacheString]
   * @default
   * Default value will be `Date.now()`
   * @example
   * templateCacheString: "12345",
   * in the browser it will add it as query param: icons/icon.woff2?12345
   */
  templateCacheString?: string | unknown;
  /**
   * @description
   * Allow adding a hash in generated font file name
   * The hash is result of md5 on all svg names (crypto.createHash("md5").update(result.svg).digest("hex"))
   * Generated font url will be : [webfont].[ext]?v=[hash]
   * @example
   * addHashInFontUrl: true,
   * in the browser it will add it as query param: icons/icon.woff2?v=59aaeba2eb0d4c2fe9177b472433b706
   */
  addHashInFontUrl?:  boolean | unknown;
  /**
   * @description
   * Generate an SCSS template with embedded font URLs rather than a URL pointing to an external file. This is to speedup the font loading (at the cost of increasing the file size) without having to open an additional http request to the web server.
   * @example
   * Result will be from:
   * url("{{ fontPath }}{{ fontName }}.woff2?{{ cacheString }}{% if hash %}&v={{ hash }}{% endif %}") format("woff2")
   * to
   * url("data:font/woff2;base64,{{ fonts.woff2 }}") format("woff2")
   */
  isFontEmbed?: boolean;
  /**
   * @description
   * Specify the specific fonts you want to embed so you can mix embedded with external fonts
   * @default
   * Same formats list as in current configuration
   * @example
   * formats:  ["svg", "ttf", "eot", "woff", "woff2"],
   * isFontEmbed: true,
   * embedFontList: *NOT DECLARED*
   * embedFontList will be ["svg", "ttf", "eot", "woff", "woff2"] and all fonts will be embedded
   * @example
   * formats:  ["svg", "ttf", "eot", "woff", "woff2"],
   * isFontEmbed: true,
   * embedFontList: ["woff2"]
   * only woff2 font will be embedded
   */
  embedFontList?: Formats;
  /**
   * @description
   * The outputted font height (defaults to the height of the highest input icon). (svgicons2svgfont configuration)
   * Default:
   * @default
   * MAX(icons.height):
   * @example
   * "svg-icons/**\/*.svg"
   */
  fontHeight: number;
  /**
   * @description
   * Normalize icons by scaling them to the height of the highest icon. (svgicons2svgfont configuration)
   * @default
   * false
   * @example
   * "svg-icons/**\/*.svg"
   */
  normalize: boolean;
}

export interface GlyphMetadata {
  path: string;
  name: string;
  unicode: string[];
  renamed: boolean;
  width: number;
  height: number;
  color: string;
}

export type WebfontResultKey = keyof WebfontResult;

export interface WebfontResult extends Result {
  config: OptionsBase & IWebfontrcConfig;
}

export interface ScssData {
  className: string;
  fontName: string;
}

export interface ScssReferenceTemplateFileData extends ScssData {
  glyphs: GlyphMetadata[];
}

export interface ScssMulticolorTemplateFileData extends ScssData {
  multicolorGlyphs: Record<string, GlyphMetadata[]>;
  glyphsColors: Record<string, string[]>;
}

export interface EnumClassTemplateFileData extends ScssData {
  projectName: string;
  multicolorPascalCase: {name: string, variableName: string, snakeName: string}[];
  monochromaticPascalCase: (GlyphMetadata & {variableName: string, snakeName: string})[];
}

export interface HtmlPreviewTemplateFileData {
  title: string;
  baseClass: string;
  classPrefix: string;
  stylesFileName: string;
  monochromaticStyles: string;
  multicolorStyles: string;
  monochromaticGlyphsName: string[];
  multicolorGlyphsName: Record<string, string[]>;
}

export interface JsonTemplateStructure {
  /**
   * @description
   * File name without suffix like class name
   * @example
   * att-globe.svg will be "att-globe",
   */
  id: string;
  /**
   * @description
   * File name in Camel case and spaces
   * @example
   * att-globe.svg will be "Att Globe",
   */
  name: string;
  /**
   * @description
   * Position in font in numeric and ligature.
   * first value is numeric and second is ligature.
   * @example
   * att-globe.svg will be ["ea02", "att_globe"],
   */
  unicode: [string, string];
}
