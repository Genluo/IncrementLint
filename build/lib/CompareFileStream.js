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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var stream_1 = require("stream");
var child_process_1 = require("child_process");
var string_decoder_1 = require("string_decoder");
var contentReg = /(@@[ -\\d]*@@)([\w\W]*?)(?=@|$)/g;
var gitTemp = "git diff --staged ";
var gitChangeRowNumber = function (str) {
    var e_1, _a;
    var strRows = str.split(/\n/g);
    var okReg = /^\+/g;
    var subReg = /^\-/g;
    var chunkRow = parseInt(str.split('+')[1].split(',')[0]);
    var rows = [];
    try {
        for (var _b = __values(strRows.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 2), index = _d[0], row = _d[1];
            if (row.match(okReg)) {
                rows.push(chunkRow + index - 1);
            }
            if (row.match(subReg)) {
                chunkRow = chunkRow - 1;
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
    ;
    return rows;
};
// 找到此文件中改动的行数
var CompareFile = /** @class */ (function (_super) {
    __extends(CompareFile, _super);
    function CompareFile() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.stringDecoder = new string_decoder_1.StringDecoder('utf8');
        _this.fileList = [];
        _this.data = '';
        _this.addRow = function (str) {
            // 文件名称 行号,行号,行号
            var strBuffer = Buffer.from(str + '\n');
            _this.push(strBuffer);
        };
        _this._flush = function (done) {
            var str = _this.data;
            var fileList = str.split('\n').filter(function (item) { return item; });
            _this.fileList = __spread(_this.fileList, fileList);
            _this.data = '';
            _this.compare();
            done(null);
        };
        _this.compare = function () {
            var e_2, _a;
            // 优化可以做成异步队列
            while (_this.fileList.length) {
                var filename = _this.fileList.pop();
                var str = child_process_1.execSync("" + gitTemp + filename);
                if (!str)
                    continue;
                var strMatch = str.toString().match(contentReg);
                var rows = [];
                if (strMatch) {
                    try {
                        for (var strMatch_1 = __values(strMatch), strMatch_1_1 = strMatch_1.next(); !strMatch_1_1.done; strMatch_1_1 = strMatch_1.next()) {
                            var str_1 = strMatch_1_1.value;
                            rows.concat(gitChangeRowNumber(str_1));
                            rows = __spread(rows, gitChangeRowNumber(str_1));
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (strMatch_1_1 && !strMatch_1_1.done && (_a = strMatch_1.return)) _a.call(strMatch_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    ;
                }
                if (rows.length) {
                    _this.addRow(filename + " " + rows.toString());
                }
            }
        };
        return _this;
    }
    CompareFile.prototype._transform = function (chunk, encoding, done) {
        var str = this.data;
        if (encoding === 'buffer') {
            str += this.stringDecoder.write(chunk);
        }
        var fileList = str.split('\n').filter(function (item) { return item; });
        while (fileList.length >= 2) {
            var filename = fileList.shift();
            if (filename) {
                this.fileList.push(filename);
            }
        }
        this.data = fileList.join('\n') + '\n';
        this.compare();
        done();
    };
    return CompareFile;
}(stream_1.Transform));
exports.default = CompareFile;
