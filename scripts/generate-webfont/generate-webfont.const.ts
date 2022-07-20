import { WebfontResultKey } from './generate-webfont.interface';

export const SUFFIX: Record<string, string> = {
  MULTICOLOR_FILE_NAME: '-multicolor',
  REFERENCE_FILE_NAME: '-reference',
  ENUM_CLASS: '.enum.ts',
}

export const TEMPLATE: Record<string, string> = {
  SCSS_REFERENCE: 'generate-webfont-reference.scss.njk',
  SCSS_MULTICOLOR: 'generate-webfont-multicolor.scss.njk',
  PREVIEW_HTML: 'generate-webfont.html.njk',
  ENUM_CLASS: 'generate-webfont-css-classes.enum.ts.njk',
}

export const IGNORE_RESULT_KEYS: WebfontResultKey[] = ['config', 'usedBuildInTemplate', 'glyphsData', 'hash'];

