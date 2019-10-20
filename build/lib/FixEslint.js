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
var addOfRows_1 = require("./util/addOfRows");
var child_process_1 = require("child_process");
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var SEPARATOR = process.platform === 'win32' ? ';' : ':';
var FixEslint = /** @class */ (function (_super) {
    __extends(FixEslint, _super);
    function FixEslint() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.stringDecoder = new string_decoder_1.StringDecoder('utf-8');
        _this.dataList = [];
        _this.data = '';
        _this.promiseNum = 0;
        _this.addRows = function (row) {
            var buffer = Buffer.from(row + '\n');
            _this.push(buffer);
        };
        _this.lint = function (callback) {
            _this.dataList.map(function (item) {
                _this.promiseNum++;
                var _a = __read(item.split(' '), 2), filename = _a[0], rowsString = _a[1];
                var rows = rowsString.split(',').map(function (item) { return parseInt(item, 10); });
                var deal = function (str, index) {
                    return addOfRows_1.copyToNewFileDealOfRows(str, index, rows);
                };
                var dealRowCallback = function (copyFilePath) {
                    try {
                        child_process_1.execSync("eslint " + copyFilePath + " --fix", {
                            cwd: process.cwd(),
                            env: {
                                PATH: process.cwd() + "/node_modules/.bin" + SEPARATOR + process.env.PATH,
                            }
                        });
                    }
                    catch (error) {
                    }
                    var inputStream = fs_extra_1.default.createWriteStream(filename);
                    var readLineDealFun = function (str, index) {
                        var value = addOfRows_1.copyToOldFileDealOfRows(str, index, rows);
                        inputStream.write(value);
                        return undefined;
                    };
                    var readLineCallback = function () {
                        inputStream.close();
                        _this.addRows(item);
                        var dirPath = path_1.default.join(copyFilePath, '../');
                        fs_extra_1.default.removeSync(dirPath);
                        _this.promiseNum--;
                        if (_this.promiseNum === 0) {
                            callback && callback();
                        }
                    };
                    addOfRows_1.readLine(copyFilePath, readLineDealFun, readLineCallback);
                };
                addOfRows_1.dealRow(filename, deal, dealRowCallback);
            });
        };
        return _this;
    }
    FixEslint.prototype._transform = function (chunk, encoding, callback) {
        var str = this.data;
        if (encoding === 'buffer') {
            str += this.stringDecoder.write(chunk);
        }
        var dataList = str.split('\n').filter(function (item) { return item; });
        while (dataList.length >= 2) {
            var data = dataList.shift();
            if (!data)
                continue;
            this.dataList.push(data);
        }
        this.lint();
        this.data = dataList.join('\n') + '\n';
        callback(null);
    };
    FixEslint.prototype._flush = function (done) {
        var dataList = this.data.split('\n');
        this.data = '';
        while (dataList.length) {
            var data = dataList.shift();
            if (!data)
                continue;
            this.dataList.push(data);
        }
        this.lint(done);
        if (this.promiseNum === 0) {
            done();
        }
    };
    return FixEslint;
}(stream_1.Transform));
exports.default = FixEslint;
