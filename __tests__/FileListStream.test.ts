import path from 'path';
import FileList, { isTheFileNeedToCheck } from '../src/FileListStream';

jest.mock('fs');

describe('test isTheFileNeedToCheck', () => {
  it('test params (src)', ()  => {
    expect(isTheFileNeedToCheck('src')).toBeFalsy();
    expect(isTheFileNeedToCheck('index.jsx')).toBeTruthy();
    expect(isTheFileNeedToCheck('index')).toBeFalsy();
  })

  it('test params index.jsx', ()  => {
    expect(isTheFileNeedToCheck('index.jsx')).toBeTruthy();
  })

  it('test params index', ()  => {
    expect(isTheFileNeedToCheck('index')).toBeFalsy();
  })
});

describe('test FileList', () => {
  const englishStr  = Buffer.from(`
    On branch master
    Your branch is up to date with 'origin/master'.
    
    Changes to be committed:
      (use "git reset HEAD <file>..." to unstage)
    
            modified:   src/cli.js
            new file:   tests/FileListStream.test.ts
            modified:   index.jsx
            modified:   index.ts
  `);

  const chineseStr  = Buffer.from(`
  On branch master
  Your branch is up to date with 'origin/master'.
  
  Changes to be committed:
    (use "git reset HEAD <file>..." to unstage)
  
          新文件：   src/cli.js
          新文件：   tests/FileListStream.test.ts
          修改：   index.jsx
          修改：   index.ts
  `)

  function testResult(testStr: Buffer, callback: Function) {
    const fileList = new FileList();
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

  const currentRootPath = process.cwd();
    const expectResult = `${path.resolve(currentRootPath, 'index.jsx')}\n${path.resolve(currentRootPath, 'index.ts')}\n`;

  it('test buffer English', (done) => {
    testResult(englishStr, (result: Buffer) => {
      expect(result.toString()).toBe(expectResult)
      done();
    })
  });

  it('test buffer Chinese', (done) => {
    testResult(chineseStr, (result: Buffer) => {
      expect(result.toString()).toBe(expectResult)
      done();
    })
  });
});
