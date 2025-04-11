import { AxiosResponse } from 'axios';
import { Readable } from 'stream';
import { ContentType, HeaderType, UserFriendlyFileType } from '../enums';
import { fileTypeMapper } from './file-types-mapper';
import { IFileUpload } from 'src/modules/file/interfaces';

export const getFileType = (file: AxiosResponse<Readable>): string => {
  const headers: Record<string, unknown> = file.headers;
  const contentType = headers[HeaderType.CONTENT_TYPE];

  if (typeof contentType === 'string') return contentType;

  throw new Error('Invalid or missing Content-Type header');
};

export const getFileExtFromMimeType = (mimeType: string): string => {
  const trimmedMimeType = trimMimeType(mimeType);

  return fileTypeMapper[trimmedMimeType] || UserFriendlyFileType.BIN;
};

export const trimMimeType = (mimeType: string): string => {
  return mimeType.split(';')[0].trim();
};

export const getFileSize = (file: AxiosResponse<Readable>): number => {
  const headers: Record<string, unknown> = file.headers;
  const contentLength = headers[HeaderType.CONTENT_LENGTH];

  if (typeof contentLength === 'string') return parseInt(contentLength);

  throw new Error('Invalid or missing Content-Length header');
};

export const getFilesTotalSize = (input: IFileUpload[]): number => {
  return input.reduce((acc, file) => acc + file.size, 0);
};

export const checkIfTextHtmlFileType = (response: AxiosResponse): boolean => {
  const headers: Record<string, unknown> = response.headers;
  const contentType = headers[HeaderType.CONTENT_TYPE];

  return (
    typeof contentType === 'string' &&
    contentType.includes(ContentType.TEXT_HTML)
  );
};
