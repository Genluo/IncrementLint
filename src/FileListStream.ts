
import anymatch from 'anymatch';
import path from 'path';
import { Transform } from 'stream';
import { NodeStringDecoder, StringDecoder } from 'string_decoder';
import config from '../config/index';
import { getFileFullPath, isFile } from './util';

const splitReg = /修改：|新文件：|modified: |new file: |\n/g

export const isTheFileNeedToCheck = (fileName: string) => {
    if (isFile(fileName)) {
        const extname = path.extname(fileName).replace('.', '');
        if (anymatch(config.checkFileExtname, extname)) {
            return true;
        }
    }
    return false;
}

// 实现git status 输出文件列表， 输出流
export default class FileList extends Transform {
    private _decoder: NodeStringDecoder = new StringDecoder('utf8');
    private temporaryData = '';
    private fileList: string[] = [];

    private addRow = (str: string) => {
        const strBuffer = Buffer.from(str + '\n');
        this.push(strBuffer);
    }

    // 根据传入可以存在的文件列表数据，找出具体的文件名称，返回剩余有可能包含文件名称的文件列表数据
    private saveFileName = (fileOriginList: string[]) => {
        let flag = 0;
        for (let [index, fileName] of fileOriginList.entries()) {
            const name = getFileFullPath(fileName.trim());
            if (name && isTheFileNeedToCheck(name)) {
                flag = index + 1;
                if (this.fileList.includes(name)) continue;
                this.fileList.push(name);
                this.addRow(name);
            }
        }
        return fileOriginList.splice(flag);
    }

    _transform(gitStatusChunk: Buffer | string, encoding: string, done: Function) {
        if (encoding === 'buffer') {
            gitStatusChunk = this._decoder.write(gitStatusChunk as Buffer);
        }
        this.temporaryData += gitStatusChunk;
        const maybeFileList = this.temporaryData.split(splitReg); // 得到可能是文件的字符串列表
        const surplusFileList = this.saveFileName(maybeFileList);
        this.temporaryData = surplusFileList.join('修改：');
        done(null);
    }

    _flush = (done: Function) => {
        this.push(null); // 终止结束
        done();
    }
}