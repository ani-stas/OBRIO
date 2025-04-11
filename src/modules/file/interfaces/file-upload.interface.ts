import { Readable } from 'stream';

export interface IFileUpload {
  file: Readable;
  type: string;
  url: string;
  size: number;
}
