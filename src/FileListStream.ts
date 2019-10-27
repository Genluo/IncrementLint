import { Transform } from 'stream';
import { StringDecoder, NodeStringDecoder } from 'string_decoder';
import fs from 'fs';
import path from 'path';
import anymatch from 'anymatch';
import config from '../config/index';

const splitReg = /修改：|新文件：|modified: |new file: |\n/g

export const isFile = (name: string) => {
    try {
        if (fs.statSync(name).isFile()) {
            const extname = path.extname(name).replace('.', '');
            if (anymatch(config.checkFileExtname, extname)) {
                return true;
            }
        }
    } catch(error) {
        return false;
    }
    return false;
}


const getFullPath = (name: string) => {
    if (path.isAbsolute(name)) return name;
    return path.resolve(name);
}

// 实现git status 输出文件列表， 输出流
export default class FileList extends Transform {
    private _decoder: NodeStringDecoder = new StringDecoder('utf8');
    private data = '';
    private fileList: string[] = [];

    private addRow = (str: string) => {
        const strBuffer = Buffer.from(str + '\n');
        this.push(strBuffer);
    }

    // 根据传入可以存在的文件列表数据，找出具体的文件名称，返回剩余有可能包含文件名称的文件列表数据
    private saveFileName = (fileOriginList: string[]) => {
        let flag = 0;
        for (let [index, fileName] of fileOriginList.entries()) {
            const name = getFullPath(fileName.trim());
            if (name && isFile(name)) {
                flag = index + 1;
                if (this.fileList.includes(name)) continue;
                this.fileList.push(name);
                this.addRow(name);
            }
        }
        return fileOriginList.splice(flag);
    }

    _transform(chunk: Buffer | string, encoding: string, done: Function) {
        if (encoding === 'buffer') {
            chunk = this._decoder.write(chunk as Buffer);
        }
        this.data += chunk;
        const mBfileList = this.data.split(splitReg);
        const surplueFileList = this.saveFileName(mBfileList);
        this.data = surplueFileList.join('修改：');
        done(null);
    }

    _flush = (done: Function) => {
        this.push(null); // 终止结束
        done();
    }
}
