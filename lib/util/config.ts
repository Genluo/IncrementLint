import fs from 'fs-extra';
import path from 'path';
import readline from 'readline';

const getDirList = (list: fs.Dirent[]) => list.filter(filePath => filePath.isDirectory())

/**
 *执行时动态注入
 *
 * @interface registeredConfig
 */
interface registeredConfig {
  (name: string, data: any): boolean;
}

interface 


function readDir(str: string) {
  const basePath = path.resolve(__dirname, '../../../lib');
  console.log(basePath);
  const paths = fs.readdirSync(basePath);
  const dirPaths = [];
  for (const fileName of paths) {
    const resolveFileName = path.resolve(basePath, fileName);
    const fileState = fs.statSync(resolveFileName);
    if (fileState.isDirectory()) {
      dirPaths.push(resolveFileName);
    }
  }
  console.log(dirPaths);
}

readDir('./config')
