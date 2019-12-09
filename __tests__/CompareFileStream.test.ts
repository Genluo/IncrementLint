import CompareFile from '../src/CompareFileStream';

const mockExecSync = jest.fn();
jest.mock('child_process', () => ({
  execSync: () => mockExecSync(),
}));

describe('test class CompareFile', () => {
  function testResult(testStr: Buffer, callback: Function) {
    const fileList: CompareFile = new CompareFile();
    let result: Buffer = Buffer.alloc(0);

    fileList.write(testStr);
    fileList.end();
    fileList.on('readable', () => {
      let chunk: Buffer;
      while (null !== (chunk = fileList.read())) {
        result = Buffer.concat([result, chunk]);
      }
    });
    fileList.on('end', () => {
      callback(result);
    });
  }

  beforeEach(() => {
    mockExecSync.mockClear();
  });

  test('test', (done) => {
    mockExecSync.mockReturnValue(`
diff --git a/src/CompareFileStream.ts b/src/CompareFileStream.ts
index 6242181..43585f0 100644
--- a/src/CompareFileStream.ts
+++ b/src/CompareFileStream.ts
@@ -3,7 +3,6 @@ import { execSync } from 'child_process';
  import { StringDecoder } from 'string_decoder';
  import { gitChangeRowNumber } from './util';

-
  const contentReg = /(@@[ -\\d]*@@)([\w\W]*?)(?=@@|$)/g
  const gitTemp = 

@@ -42,6 +41,7 @@ export default class CompareFile extends Transform {
          this.fileList = [...this.fileList, ...fileList];
          this.data = '';
          this.compare();
+        console.log('结果', this.data);
          done(null);
      }

@@ -51,6 +51,7 @@ export default class CompareFile extends Transform {
              const filename = this.fileList.pop();
              const str = 
              if (!str) continue;
+            console.log('str', str);
              const strMatch = str.toString().match(contentReg);
              let rows: number[] = [];
              if (strMatch) {
@@ -66,3 +67,5 @@ export default class CompareFile extends Transform {
      }

  }
    `);
    const testStr = Buffer.from(`/user/bin/index.jsx\n`);

    testResult(testStr, (result: Buffer) => {
      const expectResult = '/user/bin/index.jsx 44,54\n';
      expect(result.toString()).toEqual(expectResult);
      done();
    });
  });
});