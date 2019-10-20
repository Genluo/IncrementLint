import fs from 'fs-extra';
import path from 'path';
import readline from 'readline';

const BaseTemp = path.resolve('incrementLint'); // 临时文件目录
const lineBreak = (process.platform === 'win32') ? '\n\r' : '\n'; // 换行符
const ignoreEslint = '// eslint-disable-line';

export interface DealFun {
  (str: string, index: number): string,
}

/**
 *处理文件的每行内容
 *
 * @export
 * @param {*} dealFun 每行的处理函数
 */
export async function dealRow(fileName: string, dealFun: DealFun, callback?: Function) {
  const options = path.parse(fileName);
  const copyFilePath = `${BaseTemp}/${options.name}${options.ext}`;
  await fs.ensureFile(copyFilePath);
  const outputStream = fs.createWriteStream(copyFilePath);
  return readLine(fileName, (value: string, index: number) => {
    const needValue = dealFun(value, index);
    outputStream.write(needValue + lineBreak);
    return undefined;
  }, () => {
    outputStream.close();
    callback && callback(copyFilePath);
  });
}

export interface ReadLineDealFun {
  (str: string, index: number): undefined;
}

/**
 *读取传入文件名文件的每一行,并传入处理函数进行处理
 *
 * @export
 * @param {string} fileName
 * @param {ReadLineDealFun} dealFun
 * @param {Function} [callback]
 */
export async function readLine (fileName: string, dealFun: ReadLineDealFun, callback?: Function) {
  if (!fs.existsSync(fileName)) return;
  const inputStream = fs.createReadStream(fileName);
  let lineNum = 1;
  const read = readline.createInterface({
    input: inputStream,
    crlfDelay: Infinity
  });
  return new Promise((resolve, reject) => {
    read.on('line', (value) => {
      dealFun(value, lineNum++);
    });
    read.on('close', () => {
      resolve();
      callback && callback();
    })
  });
}

/**
 *判断一行需要处理与否
 *
 * @param {*} str
 * @param {*} index
 */
function judgeRow(str: string, index: number): boolean {
  // 跳过注释语句
  if (/^(\/\*\*)|( \*)/g.test(str)) {
    return false;
  }
  return true;
}
/**
 *将文件克隆到新文件中调用的处理函数
 *
 * @export
 */
export function copyToNewFileDealOfRows(str: string, index: number, ignoreRows: number[]) {
  if (ignoreRows.includes(index) || !judgeRow(str, index)) {
    return str;
  }
  return str + ignoreEslint;
}

/**
 *将文件克隆岛旧的文件中调用的处理的函数
 *
 * @export
 */
export function copyToOldFileDealOfRows(str: string, index: number, ignoreRows: number[]) {
  if (ignoreRows.includes(index) || !judgeRow(str, index)) {
    return str + lineBreak;
  } else {
    return str.replace(ignoreEslint, '') + lineBreak;
  }
}
