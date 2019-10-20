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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var stream_1 = require("stream");
var string_decoder_1 = require("string_decoder");
var child_process_1 = require("child_process");
var chalk_1 = __importDefault(require("chalk"));
var rowReg = /(?<=\s*)\d*(?=:)/g;
var SEPARATOR = process.platform === 'win32' ? ';' : ':';
var CompareFile = /** @class */ (function (_super) {
    __extends(CompareFile, _super);
    function CompareFile() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.stringDecoder = new string_decoder_1.StringDecoder('utf8');
        _this.dataList = [];
        _this.data = '';
        _this.incrementErrorNum = 0; // 本次总体增量错误总数
        _this.addRows = function (row) {
            var buffer = Buffer.from(row + '\n');
            _this.push(buffer);
        };
        _this.dealError = function (error) {
            var bufferList = error.output.filter(function (item) { return item; });
            return Buffer.concat(bufferList).toString();
        };
        _this._transform = function (chunk, encoding, done) {
            var str = _this.data;
            if (encoding === 'buffer') {
                str += _this.stringDecoder.write(chunk);
            }
            var dataList = str.split('\n').filter(function (item) { return item; });
            while (dataList.length >= 2) {
                var data = dataList.shift();
                if (!data)
                    continue;
                _this.dataList.push(data);
            }
            _this.data = dataList.join('\n') + '\n';
            _this.lint();
            done(null);
        };
        _this.lint = function () {
            while (_this.dataList.length) {
                var data = _this.dataList.shift();
                if (!data)
                    continue;
                var _a = __read(data.split(' '), 2), fileName = _a[0], lintRowsStr = _a[1];
                var lintRows = lintRowsStr.split(',').map(function (item) { return parseInt(item); });
                if (!lintRows.length)
                    return;
                var eslintOutputStr = void 0;
                try {
                    eslintOutputStr = child_process_1.execSync("eslint " + fileName, {
                        cwd: process.cwd(),
                        env: {
                            PATH: process.cwd() + "/node_modules/.bin" + SEPARATOR + process.env.PATH,
                        }
                    }).toString();
                }
                catch (error) {
                    eslintOutputStr = _this.dealError(error);
                }
                var contentList = eslintOutputStr.split('\n').filter(function (item) { return item.trim(); });
                _this.dealContent(contentList, lintRows);
            }
        };
        _this.dealContent = function (contentList, lintRows) {
            var e_1, _a;
            var title = chalk_1.default.green(contentList[0]);
            var errorNum = 0; // 错误总数
            var incrementErrorNum = 0; // 增量错误总数
            var warningNum = 0; // 警告总数
            var incrementWarningNum = 0; // 增量警告总数
            var lintErrorNum = contentList.length; // eslint总问题数量
            var rows = [];
            try {
                for (var contentList_1 = __values(contentList), contentList_1_1 = contentList_1.next(); !contentList_1_1.done; contentList_1_1 = contentList_1.next()) {
                    var content = contentList_1_1.value;
                    var matchNumber = content.match(rowReg);
                    if (matchNumber) {
                        var rowNumber = parseInt(matchNumber[0]);
                        // 判断 error还是waring
                        var bol = lintRows.includes(rowNumber);
                        if (/error/g.test(content)) {
                            if (bol) {
                                incrementErrorNum++;
                                rows.push(chalk_1.default.red(content));
                            }
                            errorNum++;
                        }
                        if (/warning/g.test(content)) {
                            if (bol) {
                                incrementWarningNum++;
                                rows.push(chalk_1.default.yellow(content));
                            }
                            warningNum++;
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (contentList_1_1 && !contentList_1_1.done && (_a = contentList_1.return)) _a.call(contentList_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            _this.incrementErrorNum += incrementErrorNum;
            var sumStr = chalk_1.default.red("eslint \u68C0\u6D4B\u603B\u95EE\u9898\u6570\u91CF " + (lintErrorNum - 3) + "  \u274C  \u9519\u8BEF\u603B\u6570\uFF1A" + errorNum + "  \u26A0\uFE0F  \u8B66\u544A\u603B\u6570\uFF1A" + warningNum + " \u274C  \u672C\u6B21\u4FEE\u6539\u9519\u8BEF\uFF1A+" + incrementErrorNum + "  \u26A0\uFE0F  \u672C\u6B21\u4FEE\u6539\u8B66\u544A+" + incrementWarningNum + "\n        ");
            if (incrementErrorNum > 0) {
                _this.addRows(title);
                _this.addRows(rows.join('\n'));
                _this.addRows(sumStr);
            }
        };
        return _this;
    }
    CompareFile.prototype._flush = function (done) {
        var dataList = this.data.split('\n');
        this.data = '';
        while (dataList.length) {
            var data = dataList.shift();
            if (!data)
                continue;
            this.dataList.push(data);
        }
        this.lint();
        if (this.incrementErrorNum !== 0) {
            process.exit(1);
        }
        else {
            done(null);
        }
    };
    return CompareFile;
}(stream_1.Transform));
exports.default = CompareFile;
