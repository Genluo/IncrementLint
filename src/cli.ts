import { exec } from 'child_process';
import CompareStream from './CompareFileStream';
import FileListStream from './FileListStream';
import LintListStream from './EslintRowsStream';
import FixEslintStream from './FixEslint';

const fileListStream = new FileListStream();
const compareStream  = new CompareStream();
const lintListStream = new LintListStream();
const fixEslintStream = new FixEslintStream();

exec('git status', { encoding: 'buffer' }, (err, stdout, stderr) => {

    fileListStream.write(stdout);
    fileListStream.end();
    fileListStream
    .pipe(compareStream)
    .pipe(lintListStream)
    .pipe(process.stdout)
});
