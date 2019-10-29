import path from 'path';
import FileList, { isTheFileNeedToCheck } from '../src/FileListStream';
import { Writable } from  'stream';
import { exportDefaultDeclaration } from '@babel/types';


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
  const test1  = Buffer.from(`
    On branch master
    Your branch is up to date with 'origin/master'.
    
    Changes to be committed:
      (use "git reset HEAD <file>..." to unstage)
    
            modified:   src/cli.js
            new file:   tests/FileListStream.test.ts
            modified:   index.jsx
  `);

  it('test buffer test1', (done) => {
    const fileList = new FileList();
    const currentRootPath = process.cwd();
    const expectResult = path.resolve(currentRootPath, 'index.jsx');
    let result: Buffer = Buffer.alloc(0);
    fileList.write(test1);
    fileList.end();
    fileList.on('readable', () => {
      let chunk: Buffer;
      while (null !== (chunk = fileList.read())) {
        result = Buffer.concat([result, chunk]);
      }
    });

    fileList.on('end', () => {
      expect(result.toString()).toBe(`${expectResult}\n`);
      done();
    });

  });
});
