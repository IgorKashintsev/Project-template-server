import {readFile, writeFile} from 'fs';
import {promisify} from 'util';

export class Storage<D> {
  data: Record<string, D> = {};

  constructor(private dbFilePath: string, private readKey: string) {}

  public async read() {
    const fileData = await this.readAndParseFile();

    if (typeof fileData[this.readKey] !== 'object') {
      console.log(fileData[this.readKey]);
      throw Error(`Key "${this.readKey}" of file ${this.dbFilePath} must contain an object.`);
    }

    this.data = fileData[this.readKey];
  }

  public async write() {
    const promisifyWriteFile = promisify(writeFile);
    const fileData = await this.readAndParseFile();
    fileData[this.readKey] = this.data;

    await promisifyWriteFile(this.dbFilePath, JSON.stringify(fileData, null, 2));
  }

  private async readAndParseFile() {
    const promisifyReadFile = promisify(readFile);
    const fileText = await promisifyReadFile(this.dbFilePath, {encoding: 'utf-8'});
    
    return JSON.parse(fileText);
  }
}
