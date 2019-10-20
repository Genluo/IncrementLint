"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var readline_1 = __importDefault(require("readline"));
var BaseTemp = path_1.default.resolve('incrementLint'); // 临时文件目录
var lineBreak = (process.platform === 'win32') ? '\n\r' : '\n'; // 换行符
var ignoreEslint = '// eslint-disable-line';
/**
 *处理文件的每行内容
 *
 * @export
 * @param {*} dealFun 每行的处理函数
 */
function dealRow(fileName, dealFun, callback) {
    return __awaiter(this, void 0, void 0, function () {
        var options, copyFilePath, outputStream;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    options = path_1.default.parse(fileName);
                    copyFilePath = BaseTemp + "/" + options.name + options.ext;
                    return [4 /*yield*/, fs_extra_1.default.ensureFile(copyFilePath)];
                case 1:
                    _a.sent();
                    outputStream = fs_extra_1.default.createWriteStream(copyFilePath);
                    return [2 /*return*/, readLine(fileName, function (value, index) {
                            var needValue = dealFun(value, index);
                            outputStream.write(needValue + lineBreak);
                            return undefined;
                        }, function () {
                            outputStream.close();
                            callback && callback(copyFilePath);
                        })];
            }
        });
    });
}
exports.dealRow = dealRow;
/**
 *读取传入文件名文件的每一行,并传入处理函数进行处理
 *
 * @export
 * @param {string} fileName
 * @param {ReadLineDealFun} dealFun
 * @param {Function} [callback]
 */
function readLine(fileName, dealFun, callback) {
    return __awaiter(this, void 0, void 0, function () {
        var inputStream, lineNum, read;
        return __generator(this, function (_a) {
            if (!fs_extra_1.default.existsSync(fileName))
                return [2 /*return*/];
            inputStream = fs_extra_1.default.createReadStream(fileName);
            lineNum = 1;
            read = readline_1.default.createInterface({
                input: inputStream,
                crlfDelay: Infinity
            });
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    read.on('line', function (value) {
                        dealFun(value, lineNum++);
                    });
                    read.on('close', function () {
                        resolve();
                        callback && callback();
                    });
                })];
        });
    });
}
exports.readLine = readLine;
/**
 *判断一行需要处理与否
 *
 * @param {*} str
 * @param {*} index
 */
function judgeRow(str, index) {
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
function copyToNewFileDealOfRows(str, index, ignoreRows) {
    if (ignoreRows.includes(index) || !judgeRow(str, index)) {
        return str;
    }
    return str + ignoreEslint;
}
exports.copyToNewFileDealOfRows = copyToNewFileDealOfRows;
/**
 *将文件克隆岛旧的文件中调用的处理的函数
 *
 * @export
 */
function copyToOldFileDealOfRows(str, index, ignoreRows) {
    if (ignoreRows.includes(index) || !judgeRow(str, index)) {
        return str + lineBreak;
    }
    else {
        return str.replace(ignoreEslint, '') + lineBreak;
    }
}
exports.copyToOldFileDealOfRows = copyToOldFileDealOfRows;
