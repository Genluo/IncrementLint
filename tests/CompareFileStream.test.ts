import CompareFile, { gitChangeRowNumber } from '../src/CompareFileStream';

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

  test('test params test1', () => {
    const rows = gitChangeRowNumber(test1);
    expect(rows).toEqual([72]);
  })

  test('test params test2', () => {
    const rows = gitChangeRowNumber(test2);
    expect(rows).toEqual([71]);
  })
})

describe('test class CompareFile', () => {
});