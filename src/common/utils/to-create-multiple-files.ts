import { FILE_PATH, GOOGLE_DRIVE_BASE_URL, VIEW_PATH } from '../constants';
import { IFile, IFileInDrive } from 'src/modules/file/interfaces';

export const toCreateMultipleFiles = (filesData: IFileInDrive[]): IFile[] => {
  return filesData.map((data) => ({
    name: data.name,
    mimeType: data.mimeType,
    driveUrl: `${GOOGLE_DRIVE_BASE_URL}${FILE_PATH}${data.id}${VIEW_PATH}`,
    driveId: data.id,
  }));
};
