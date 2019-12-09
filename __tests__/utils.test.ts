import { isFile, getFileFullPath, gitChangeRowNumber } from '../src/util';
import path from 'path';


jest.mock('fs');
describe('test utils isFile', () => {
  it('params: index', () => {
    expect(isFile('index')).toBeFalsy();
  });

  it('params: index.jsx', () => {
    expect(isFile('index.jsx')).toBeTruthy();
  });

  it('params: src', () => {
    expect(isFile('src')).toBeFalsy();
  })
});

describe('test utils getFileFullPath', () => {
  const cwdPath = process.cwd();

  it('params: (index)', () => {
    const targetPath = path.resolve(cwdPath, 'index');
    expect(getFileFullPath('index'))
    .toEqual(targetPath);
  });

  it('params: (process.cws())', () => {
    expect(getFileFullPath(cwdPath))
    .toEqual(cwdPath)
  });

  it('params: (../)', () => {
    const targetPath = path.resolve(cwdPath, '../');
    expect(getFileFullPath('../'))
    .toEqual(targetPath);
  });

  it('params: (index, /user/home)', () => {
    const targetPath = path.resolve('/user/home', 'index');
    expect(getFileFullPath(targetPath))
    .toEqual(targetPath);
  });

  it('params: (index, home)', () => {
    expect(() => {
      getFileFullPath('index', 'home')
    })
    .toThrow();
  });
})


describe('test function gitChangeRowNumber', () => {
  // 修改行代码的输出
  const test1 = `
@@ -68,7 +68,7 @@ export async function readLine (fileName: string, dealFun: ReadLineDealFun, call
  * @param {*} str
  * @param {*} index
  */
-function judgeRow(str: string, index: number): boolean {
+export function judgeRow(str: string, index: number): boolean {
  // 跳过注释语句
  if (/^(\/\*\*)|( \*)/g.test(str)) {
    return false;
`

  // 删减行的输出
  const test2 = `
@@ -61,14 +61,13 @@ export async function readLine (fileName: string, dealFun: ReadLineDealFun, call
})
});
}
-
/**
*判断一行需要处理与否
*
* @param {*} str
* @param {*} index
*/
-function judgeRow(str: string, index: number): boolean {
+export function judgeRow(str: string, index: number): boolean {
// 跳过注释语句
if (/^(\/\*\*)|( \*
`;

  const test3 = `
@@ -10,6 +10,8 @@ export interface DealFun {
  (str: string, index: number): string,
}

+
+
/**
 *处理文件的每行内容
  *
@@ -61,14 +63,13 @@ export async function readLine (fileName: string, dealFun: ReadLineDealFun, call
    })
  });
}
`

  test('test params test1', () => {
    const rows = gitChangeRowNumber(test1);
    expect(rows).toEqual([72]);
  });

  test('test params test2', () => {
    const rows = gitChangeRowNumber(test2);
    expect(rows).toEqual([71]);
  });

  test('test params test3', ()  => {
    const rows = gitChangeRowNumber(test3);
    expect(rows).toEqual([14, 15]);
  });
})

