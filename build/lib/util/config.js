"use strict";
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
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var getDirList = function (list) { return list.filter(function (filePath) { return filePath.isDirectory(); }); };
interface;
function readDir(str) {
    var e_1, _a;
    var basePath = path_1.default.resolve(__dirname, '../../../lib');
    console.log(basePath);
    var paths = fs_extra_1.default.readdirSync(basePath);
    var dirPaths = [];
    try {
        for (var paths_1 = __values(paths), paths_1_1 = paths_1.next(); !paths_1_1.done; paths_1_1 = paths_1.next()) {
            var fileName = paths_1_1.value;
            var resolveFileName = path_1.default.resolve(basePath, fileName);
            var fileState = fs_extra_1.default.statSync(resolveFileName);
            if (fileState.isDirectory()) {
                dirPaths.push(resolveFileName);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (paths_1_1 && !paths_1_1.done && (_a = paths_1.return)) _a.call(paths_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    console.log(dirPaths);
}
readDir('./config');
