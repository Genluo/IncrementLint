"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var CompareFileStream_1 = __importDefault(require("./CompareFileStream"));
var FileListStream_1 = __importDefault(require("./FileListStream"));
var EslintRowsStream_1 = __importDefault(require("./EslintRowsStream"));
var FixEslint_1 = __importDefault(require("./FixEslint"));
var fileListStream = new FileListStream_1.default();
var compareStream = new CompareFileStream_1.default();
var lintListStream = new EslintRowsStream_1.default();
var fixEslintStream = new FixEslint_1.default();
child_process_1.exec('git status', { encoding: 'buffer' }, function (err, stdout, stderr) {
    fileListStream.write(stdout);
    fileListStream.end();
    fileListStream
        .pipe(compareStream)
        .pipe(lintListStream)
        .pipe(process.stdout);
    // 同步fix过程
    // fileListStream.write(stdout);
    // fileListStream.end();
    // fileListStream
    // .pipe(compareStream)
    // .pipe(fixEslintStream)
    // .pipe(lintListStream)
    // .pipe(process.stdout)
});
