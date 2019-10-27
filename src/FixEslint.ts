import { Transform } from 'stream';
import { StringDecoder } from 'string_decoder';
import { dealRow, DealFun, readLine, ReadLineDealFun, copyToNewFileDealOfRows, copyToOldFileDealOfRows } from './util/addOfRows';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

type TransformCallback = (error?: Error | null, data?: any) => void;
const SEPARATOR = process.platform === 'win32' ? ';' : ':';

export default class FixEslint extends Transform {
  private stringDecoder = new StringDecoder('utf-8');
  private dataList: string[] = [];
  private data = '';
  private promiseNum = 0;

  private addRows = (row: string) => {
    const buffer = Buffer.from(row+'\n');
    this.push(buffer);
  }

  _transform(chunk: Buffer, encoding: string, callback: TransformCallback) {
    let str: string = this.data;
    if (encoding === 'buffer') {
        str += this.stringDecoder.write(chunk);
    }
    const dataList = str.split('\n').filter(item => item);
    while (dataList.length >= 2) {
        const data = dataList.shift();
        if (!data) continue;
        this.dataList.push(data);
    }
    this.lint();
    this.data = dataList.join('\n') + '\n';
    callback(null);
  }

  _flush(done: Function) {
    const dataList = this.data.split('\n');
    this.data = '';
    while(dataList.length) {
        const data = dataList.shift();
        if (!data) continue;
        this.dataList.push(data);
    }
    this.lint(done);
    if (this.promiseNum === 0) {
      done();
    }
  }

  lint = (callback?: Function) => {
    this.dataList.map(item => {
      this.promiseNum++;
      const [filename, rowsString] = item.split(' ');
      const rows = rowsString.split(',').map(item => parseInt(item, 10));
      const deal: DealFun = (str, index) => {
        return copyToNewFileDealOfRows(str, index, rows);
      };

      const dealRowCallback = (copyFilePath: string) => {
        try {
          execSync(`eslint ${copyFilePath} --fix`, {
            cwd: process.cwd(),
              env: {
                  PATH: `${process.cwd()}/node_modules/.bin${SEPARATOR}${process.env.PATH}`,
              }
          });
        } catch (error) {

        }
        const inputStream = fs.createWriteStream(filename);
        const readLineDealFun: ReadLineDealFun = (str, index) => {
          const value = copyToOldFileDealOfRows(str, index, rows);
          inputStream.write(value);
          return undefined;
        }
        const readLineCallback = () => {
          inputStream.close();
          this.addRows(item);
          const dirPath = path.join(copyFilePath , '../');
          fs.removeSync(dirPath);
          this.promiseNum--;
          if (this.promiseNum === 0) {
            callback && callback();
          }
        };
        readLine(copyFilePath, readLineDealFun, readLineCallback);
      }
      dealRow(filename, deal, dealRowCallback)
    })
  }
} 