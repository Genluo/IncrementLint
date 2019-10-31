import CompareFile from '../src/CompareFileStream';

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
  
  it('test', () => {
    expect(true).toBeTruthy();
  })
});