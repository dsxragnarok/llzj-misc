#!/usr/bin/env node

const fs = require('fs');

/*
  Han Ideographs
  --------------
  Block                                   Range       Comment
  CJK Unified Ideographs                  4E00-9FFF   Common
  CJK Unified Ideographs Extension A      3400-4DBF   Rare
  CJK Unified Ideographs Extension B      20000-2A6DF Rare, historic
  CJK Unified Ideographs Extension C      2A700–2B73F Rare, historic
  CJK Unified Ideographs Extension D      2B740–2B81F Uncommon, some in current use
  CJK Unified Ideographs Extension E      2B820–2CEAF Rare, historic
  CJK Unified Ideographs Extension F      2CEB0–2EBEF  Rare, historic
  CJK Unified Ideographs Extension G      30000–3134F  Rare, historic
  CJK Unified Ideographs Extension H      31350–323AF Rare, historic
  CJK Compatibility Ideographs            F900-FAFF   Duplicates, unifiable variants, corporate characters
  CJK Compatibility Ideographs Supplement 2F800-2FA1F Unifiable variants

  CJK Radicals / Kangxi Radicals          2F00–2FDF
  CJK Radicals Supplement                 2E80–2EFF

  CJK Symbols and Punctuation             3000–303F
*/
const CJK_COMMON_LB = '\u4E00';
const CJK_COMMON_UB = '\u9FFF';
const CJK_RARE_LB = '\u3400';
const CJK_RARE_UB = '\u4DBF';
const CJK_UNCOMMON_LB = '\u2B740';
const CJK_UNCOMMON_UB = '\u2B81F';
const CJK_RADICALS_LB = '\u2F00';
const CJK_RADICALS_UB = '\u2FDF';
const CJK_RAD_SUPPLEMENTS_LB = '\u2E80';
const CJK_RAD_SUPPLEMENTS_UB = '\u2EFF';
const CJK_SYMBOLS_LB = '\u3000';
const CJK_SYMBOLS_UB = '\u303F';

// db_lang.bytes data structure
// mainCategory (string) | subCategory (string) | key (4bytes integer) | text (string)
// string: Bytes of UTF8 (2Bytes UShort)
const MAIN_STAGE = 0;
const SUB_STAGE = 1;
const KEY_STAGE = 2;
const TEXT_STAGE = 3;

const sentinels = [
  '\t',
  '\b',
  '\r',
  '\n',
  '\f',

  '\u0000',
  '\u0001',
  '\u0002',
  '\u0003',

  '\u0004',
  '\u0005',
  '\u0006',
  '\u0007',
  '\u000b',
  '\u000e',
  '\u000f',
  '\u0010',
  '\u0011',
  '\u0012',
  '\u0013',
  '\u0014',
  '\u0015',
  '\u0016',
  '\u0017',
  '\u0018',
  '\u0019',
  '\u001a',
  '\u001b',
  '\u001c',
  '\u001e',
];
const sentries = ['\u0000','\u0004'];
const alphabet = /[a-zA-Z]/;
const name = /[a-zA-Z_]/;
const integer = /\d+/;

const inRange = (incLower, value, incUpper) => value >= incLower && value <= incUpper;
const isHanzi = (charCode) => {
  return inRange(CJK_COMMON_LB, charCode, CJK_COMMON_UB) &&
    inRange(CJK_RARE_LB, charCode, CJK_RARE_UB) &&
    inRange(CJK_UNCOMMON_LB, charCode, CJK_UNCOMMON_UB) &&
    inRange(CJK_RADICALS_LB, charCode, CJK_RADICALS_UB) &&
    inRange(CJK_RAD_SUPPLEMENTS_LB, charCode, CJK_RAD_SUPPLEMENTS_UB) &&
    inRange(CJK_SYMBOLS_LB, charCode, CJK_SYMBOLS_UB);
};
const isValidText = (character) => alphabet.test(character) || isHanzi(character);

const stringToHex = (str) => {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    const hexValue = charCode.toString(16);

    // Pad with zeros to ensure two-digit representation
    hex += hexValue.padStart(2, '0');
  }
  return hex;
};

const parseData = (data) => {
  let idx = 0;
  const entries = [];
  const element = [];
  const categories = [];
  const subcategories = [];

  while (idx < data.length) {
    const stage = element.length;

    switch (stage) {
      case MAIN_STAGE: {
        const prefix2Bytes = data[idx] + data[++idx];

        idx += 1;
        let category = '';

        while (name.test(data[idx])) {
          category += data[idx];
          idx += 1;
        }
        element.push(prefix2Bytes + category);
        if (!categories.includes(category)) categories.push(category);
        break;
      }
      case SUB_STAGE: {
        const prefix2Bytes = data[idx] + data[++idx];

        idx += 1;
        let subCategory = '';

        while (name.test(data[idx])) {
          subCategory += data[idx];
          idx += 1;
        }
        element.push(prefix2Bytes + subCategory);
        if (!subcategories.includes(subCategory)) subcategories.push(subCategory);
        break;
      }
      case KEY_STAGE: {
        const prefix4Bytes = data[idx] + data[++idx] + data[++idx] + data[++idx];

        idx += 1;
        let int = '';

        while (integer.test(data[idx])) {
          int += data[idx];
          idx += 1;
        }
        element.push(prefix4Bytes + int);
        break;
      }
      case TEXT_STAGE:{
        const prefix2Bytes = data[idx] + data[++idx];

        idx += 1;
        let text = '';

        while (idx < data.length) {
          if (idx + 2 < data.length &&
            (sentinels.includes(data[idx]) &&
              sentries.includes(data[idx + 1]) &&
              alphabet.test(data[idx + 2]))) {
            break;
          }

          text += data[idx];
          idx += 1;
        }

        element.push(prefix2Bytes + text);
        entries.push([...element]);

        element.length = 0;
        break;
      }
    }
  }

  return { entries, categories, subcategories };
}

console.log(process.argv);
const [_node, _app, inputFile, outputFile, ...rest] = process.argv;
if (!inputFile) {
  console.log('No Input File');
  process.exit(1);
}

fs.readFile(inputFile, 'utf-8', (err, data) => {
  if (err)  {
    console.error(err);
    return;
  }

  const { categories, entries, subcategories } = parseData(data);

  if (outputFile) {
    fs.writeFile(outputFile, )
  } else {
    console.log(JSON.stringify(entries, null, 2));
  }

  // const d = { categories, subcategories };
  // console.log(JSON.stringify(d, null, 2));
});
