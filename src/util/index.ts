import anymatch from "anymatch";
import fs from "fs-extra";
import path from "path";
import config from "../../config/index";
export * from "./addOfRows";
export * from "./config";

export const gitChangeRowNumber = (str: string) => {
  const strRows = str.split(/\n/g);
  const okReg = /^\+/g;
  const subReg = /^\-/g;
  let chunkRow = parseInt(str.split("+")[1].split(",")[0]);
  const rows = [];
  for (let [index, row] of strRows.entries()) {
    if (row.match(okReg)) {
      rows.push(chunkRow + index - 1);
    }
    if (row.match(subReg)) {
      chunkRow = chunkRow - 1;
    }
  }
  return rows;
};

export const isFile = (name: string) => {
  try {
    if (fs.statSync(name).isFile()) {
      const extname = path.extname(name).replace(".", "");
      if (anymatch(config.checkFileExtname, extname)) {
        return true;
      }
    }
  } catch (error) {
    return false;
  }
  return false;
};

export const getFileFullPath = (name: string) => {
  if (path.isAbsolute(name)) return name;
  return path.resolve(name);
};
