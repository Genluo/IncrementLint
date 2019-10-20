"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var stream_1 = require("stream");
var string_decoder_1 = require("string_decoder");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var anymatch_1 = __importDefault(require("anymatch"));
var index_1 = __importDefault(require("../config/index"));
var splitReg = /修改：|新文件：|modified: |new file: |\n/g;
var isFile = function (name) {
    try {
        if (fs_1.default.statSync(name).isFile()) {
            var extname = path_1.default.extname(name).replace('.', '');
            if (anymatch_1.default(index_1.default.checkFileExtname, extname)) {
                return true;
            }
        }
    }
    catch (error) {
        return false;
    }
    return false;
};
var getFullPath = function (name) {
    if (path_1.default.isAbsolute(name))
        return name;
    return path_1.default.resolve(name);
};
// 实现git status 输出文件列表， 输出流
var FileList = /** @class */ (function (_super) {
    __extends(FileList, _super);
    function FileList() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._decoder = new string_decoder_1.StringDecoder('utf8');
        _this.data = '';
        _this.fileList = [];
        _this.addRow = function (str) {
            var strBuffer = Buffer.from(str + '\n');
            _this.push(strBuffer);
        };
        // 根据传入可以存在的文件列表数据，找出具体的文件名称，返回剩余有可能包含文件名称的文件列表数据
        _this.saveFileName = function (fileOriginList) {
            var e_1, _a;
            var flag = 0;
            try {
                for (var _b = __values(fileOriginList.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), index = _d[0], fileName = _d[1];
                    var name_1 = getFullPath(fileName.trim());
                    if (name_1 && isFile(name_1)) {
                        flag = index + 1;
                        if (_this.fileList.includes(name_1))
                            continue;
                        _this.fileList.push(name_1);
                        _this.addRow(name_1);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return fileOriginList.splice(flag);
        };
        _this._flush = function (done) {
            _this.push(null); // 终止结束
            done();
        };
        return _this;
    }
    FileList.prototype._transform = function (chunk, encoding, done) {
        if (encoding === 'buffer') {
            chunk = this._decoder.write(chunk);
        }
        this.data += chunk;
        var mBfileList = this.data.split(splitReg);
        var surplueFileList = this.saveFileName(mBfileList);
        this.data = surplueFileList.join('修改：');
        done(null);
    };
    return FileList;
}(stream_1.Transform));
exports.default = FileList;
