import { Readable } from 'stream';

export interface ICreateFileInput {
  name: string;
  mimeType: string;
  file: Readable;
}
