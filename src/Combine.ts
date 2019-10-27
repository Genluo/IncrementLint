import { Duplex, Stream, PassThrough } from 'stream';

export default class Combine extends Duplex {
  constructor(streamList: Stream[]) {
    super();
    
  }

  _write(chunk: Buffer, encoding: string, done: Function) {

  }

  _read(n: number) {

  }
}