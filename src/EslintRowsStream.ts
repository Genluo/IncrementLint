import chalk from "chalk";
import { execSync } from "child_process";
import process from "process";
import { Transform } from "stream";
import { StringDecoder } from "string_decoder";

const rowReg = /(?<=\s*)\d*(?=:)/g;
const SEPARATOR = process.platform === "win32" ? ";" : ":";

export default class CompareFile extends Transform {
  private stringDecoder = new StringDecoder("utf8");
  private dataList: string[] = [];
  private data = "";
  private incrementErrorNum = 0; // 本次总体增量错误总数

  private addRows = (row: string) => {
    const buffer = Buffer.from(row + "\n");
    this.push(buffer);
  };

  _transform = (chunk: Buffer, encoding: string, done: Function) => {
    let str: string = this.data;
    if (encoding === "buffer") {
      str += this.stringDecoder.write(chunk);
    }
    const dataList = str.split("\n").filter((item) => item);
    while (dataList.length >= 2) {
      const data = dataList.shift();
      if (!data) continue;
      this.dataList.push(data);
    }
    this.data = dataList.join("\n") + "\n";
    this.lint();
    done(null);
  };

  _flush(done: Function) {
    const dataList = this.data.split("\n");
    this.data = "";
    while (dataList.length) {
      const data = dataList.shift();
      if (!data) continue;
      this.dataList.push(data);
    }
    this.lint();
    if (this.incrementErrorNum !== 0) {
      process.exit(1);
      done(null);
    } else {
      done(null);
    }
  }

  private lint = () => {
    while (this.dataList.length) {
      const data = this.dataList.shift();
      if (!data) continue;
      const [fileName, lintRowsStr] = data.split(" ");
      const lintRows = lintRowsStr.split(",").map((item) => parseInt(item));
      if (!lintRows.length) return;
      let eslintOutputStr;
      try {
        eslintOutputStr = execSync(`eslint ${fileName}`, {
          cwd: process.cwd(),
          env: {
            PATH: `${process.cwd()}/node_modules/.bin${SEPARATOR}${
              process.env.PATH
            }`,
          },
        }).toString();
      } catch (error) {
        eslintOutputStr = this.dealError(error);
      }
      const contentList = eslintOutputStr
        .split("\n")
        .filter((item) => item.trim());
      this.dealContent(contentList, lintRows);
    }
  };

  private dealError = (error: {
    output: { filter: (arg0: (item: any) => any) => Buffer[] };
  }) => {
    const bufferList: Buffer[] = error.output.filter((item) => item);
    return Buffer.concat(bufferList).toString();
  };

  private dealContent = (contentList: string[], lintRows: number[]) => {
    // TODO: 警告不应该直接报错
    const title = chalk.green(contentList[0]);
    let errorNum = 0; // 错误总数
    let incrementErrorNum = 0; // 增量错误总数
    let warningNum = 0; // 警告总数
    let incrementWarningNum = 0; // 增量警告总数
    let lintErrorNum = contentList.length; // eslint总问题数量
    const rows = [];
    for (let content of contentList) {
      const matchNumber = content.match(rowReg);
      if (matchNumber) {
        const rowNumber = parseInt(matchNumber[0]);
        // 判断 error还是waring
        const bol = lintRows.includes(rowNumber);
        if (/error/g.test(content)) {
          if (bol) {
            incrementErrorNum++;
            rows.push(chalk.red(content));
          }
          errorNum++;
        }
        if (/warning/g.test(content)) {
          if (bol) {
            incrementWarningNum++;
            rows.push(chalk.yellow(content));
          }
          warningNum++;
        }
      }
    }
    this.incrementErrorNum += incrementErrorNum;
    const sumStr = chalk.red(
      `eslint 检测总问题数量 ${
        lintErrorNum - 3
      }  ❌  错误总数：${errorNum}  ⚠️  警告总数：${warningNum} ❌  本次修改错误：+${incrementErrorNum}  ⚠️  本次修改警告+${incrementWarningNum}
        `
    );
    if (incrementErrorNum > 0) {
      this.addRows(title);
      this.addRows(rows.join("\n"));
      this.addRows(sumStr);
    }
  };
}
