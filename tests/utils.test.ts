import { isFile, getFileFullPath } from '../src/util';
import path from 'path';


describe('test utils isFile', () => {
  it('params: index', () => {
    expect(isFile('index')).toBeFalsy();
  });

  it('params: index.jsx', () => {
    expect(isFile('index.jsx')).toBeFalsy();
  });

  it('params: src', () => {
    expect(isFile('src')).toBe(false);
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

