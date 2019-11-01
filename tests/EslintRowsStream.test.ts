import EslintRowsStreams from '../src/EslintRowsStream';

const mockExecSync = jest.fn();
jest.mock('child_process', () => ({
  execSync: () => mockExecSync()
}));

const eslintError = `
/Users/ligen/code/test/ulife/ulifeb-fe/client/util/tree.js
   1:1   error    Expected exception block, space or tab after '/*' in comment     spaced-comment
   8:1   error    Expected indentation of 2 spaces but found 4                     indent
   9:1   error    Expected indentation of 4 spaces but found 8                     indent
  10:1   error    Expected indentation of 4 spaces but found 8                     indent
  11:1   error    Expected indentation of 4 spaces but found 8                     indent
  12:1   error    Expected indentation of 4 spaces but found 8                     indent
  13:1   error    Expected indentation of 4 spaces but found 8                     indent
  14:1   error    Expected indentation of 4 spaces but found 8                     indent
  15:1   error    Expected indentation of 4 spaces but found 8                     indent
  16:1   error    Expected indentation of 4 spaces but found 8                     indent
  16:22  error    Missing trailing comma                                           comma-dangle
  16:23  error    Expected exception block, space or tab after '//' in comment     spaced-comment
  17:1   error    Expected indentation of 2 spaces but found 4                     indent
  20:1   error    Prefer default export                                            import/prefer-default-export
  20:37  error    'index' is defined but never used                                no-unused-vars
  21:1   error    Expected indentation of 2 spaces but found 4                     indent
  22:1   error    Expected indentation of 2 spaces but found 4                     indent
  22:9   warning  'res' is never reassigned. Use 'const' instead                   prefer-const
  23:1   error    Expected indentation of 2 spaces but found 4                     indent
  23:10  error    Unexpected var, use let or const instead                         no-var
  23:10  warning  All 'var' declarations must be at the top of the function scope  vars-on-top
  24:1   error    Expected indentation of 4 spaces but found 8                     indent
  24:13  warning  'obj' is never reassigned. Use 'const' instead                   prefer-const
  25:1   error    Expected indentation of 4 spaces but found 8                     indent
  25:30  warning  Expected '===' and instead saw '=='                              eqeqeq
  26:1   error    Expected indentation of 6 spaces but found 12                    indent
  26:17  warning  'oobj' is never reassigned. Use 'const' instead                  prefer-const
  27:1   error    Expected indentation of 6 spaces but found 12                    indent
  28:1   error    Expected indentation of 6 spaces but found 12                    indent
  29:1   error    Expected indentation of 6 spaces but found 12                    indent
  30:1   error    Expected indentation of 6 spaces but found 12                    indent
  31:1   error    Expected indentation of 4 spaces but found 8                     indent
  32:1   error    Expected indentation of 2 spaces but found 4                     indent
  33:1   error    Expected indentation of 2 spaces but found 4                     indent
  34:1   error    Expected indentation of 2 spaces but found 4                     indent
  38:1   error    Expected indentation of 2 spaces but found 4                     indent
  38:10  error    Unexpected var, use let or const instead                         no-var
  38:10  warning  All 'var' declarations must be at the top of the function scope  vars-on-top
  39:1   error    Expected indentation of 4 spaces but found 8                     indent
  40:1   error    Expected indentation of 6 spaces but found 12                    indent
  41:1   error    Expected indentation of 4 spaces but found 8                     indent
  42:1   error    Expected indentation of 4 spaces but found 8      
  43:1   error    Expected indentation of 4 spaces but found 8                     indent
  43:29  warning  Expected '===' and instead saw '=='                              eqeqeq
  44:17  warning  'oobj' is never reassigned. Use 'const' instead                  prefer-const
`

const testSuccessData = [
  {
    name: '报错不在eslint范围内',
    data: `
/user/home/index.jsx 100,200
    `,
    expectResult: ``
  },
  {
    name: '多行报错不在eslint范围内',
    data: `
/user/home/index.jsx 100,200
/user/home/index.jsx 100,200
    `,
    expectResult: ``
  }
]


const testErrorData = [
  {
    name: '出现报错',
    data: `
/user/home/index.jsx 1
    `,
    expectResult: `
/Users/ligen/code/test/ulife/ulifeb-fe/client/util/tree.js
   1:1   error    Expected exception block, space or tab after '/*' in comment     spaced-comment
eslint 检测总问题数量 43  ❌  错误总数：37  ⚠️  警告总数：8 ❌  本次修改错误：+1  ⚠️  本次修改警告+0
        `
  }
]

function testResult(testStr: string, callback: Function) {
  const fileList: EslintRowsStreams = new EslintRowsStreams();
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

describe('test compareFile', () => {
  beforeEach(() => {
    mockExecSync.mockReturnValue(eslintError);
  });

  for (const { data, name, expectResult } of testSuccessData) {
    test(`test ${name}`,  (done) => {
      testResult(data, (result: Buffer) => {
        // expect(result.toString()).toEqual(expectResult);
        done();
      })
    });
  }
});



const mockExit = jest.fn();
jest.mock('process', () => ({
  exit: () => mockExit(),
  cwd: process.cwd,
  env: process.env,
}));

describe('test error', () => {
  beforeEach(() => {
    mockExit.mockClear();
    mockExecSync.mockReturnValue(eslintError);
  });
  for (const { data, name, expectResult } of testErrorData) {
    test(`test ${name}`,  (done) => {
      testResult(data, (result: Buffer) => {
        expect(mockExit.mock.calls.length).toBe(1);
        done();
      })
    });
  }

})

