import { Transform } from 'stream'; 
import { execSync } from 'child_process';
import { StringDecoder } from 'string_decoder';

const contentReg = /(@@[ -\\d]*@@)([\w\W]*?)(?=@|$)/g
const gitTemp = `git diff --staged `;
const gitChangeRowNumber = (str: string) => {
    const strRows = str.split(/\n/g);
    const okReg = /^\+/g
    const subReg = /^\-/g
    let chunkRow = parseInt(str.split('+')[1].split(',')[0]);
    const rows = [];
    for (let [index, row] of strRows.entries()) {
        if (row.match(okReg)) {
            rows.push(chunkRow + index - 1);
        }
        if (row.match(subReg)) {
            chunkRow = chunkRow - 1;
        }
    };
    return rows;
}
// 找到此文件中改动的行数
export default class CompareFile extends Transform {
    private stringDecoder = new StringDecoder('utf8');
    private fileList: string[] = [];
    private data = '';

    private addRow = (str: string) => {
        // 文件名称 行号,行号,行号
        const strBuffer = Buffer.from(str + '\n');
        this.push(strBuffer);
    }

    _transform(chunk: Buffer | string, encoding: string, done: Function) {
        let str: string = this.data;
        if (encoding === 'buffer') {
            str += this.stringDecoder.write(chunk as Buffer);
        }
        const fileList = str.split('\n').filter(item => item);
        while (fileList.length >= 2) {
            const filename = fileList.shift();
            if (filename) {
                this.fileList.push(filename);
            }
        }
        this.data = fileList.join('\n') + '\n';
        this.compare();
        done();
    }

    _flush = (done: Function) => {
        const str = this.data;
        const fileList: string[] = str.split('\n').filter(item => item);
        this.fileList = [...this.fileList, ...fileList];
        this.data = '';
        this.compare();
        done(null);
    }

    private compare = () => {
        // todo优化可以做成异步队列
        while(this.fileList.length) {
            const filename = this.fileList.pop();
            const str = execSync(`${gitTemp}${filename}`);
            if (!str) continue;
            const strMatch = str.toString().match(contentReg);
            let rows: number[] = [];
            if (strMatch) {
                for (let str of strMatch) {
                    rows.concat(gitChangeRowNumber(str));
                    rows = [...rows, ...gitChangeRowNumber(str)];
                };
            }
            if (rows.length) {
                this.addRow(`${filename} ${rows.toString()}`);
            }
        }
    }

}