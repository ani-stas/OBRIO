import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { GoogleDriveSetupService } from '../google-drive-setup';
import { ICreateFileInput } from './interfaces';
import { IFileInDrive, IFileUpload } from '../file/interfaces';
import {
  errorTypeCheck,
  getFileExtFromMimeType,
  getFilesTotalSize,
} from 'src/common/utils';
import {
  DEFAULT_FILE_NAME,
  MAX_FILE_SIZE,
  UNNAMED_FILE,
} from 'src/common/constants';
import { ContentType } from 'src/common/enums';

@Injectable()
export class GoogleDriveService {
  constructor(private readonly driveSetupService: GoogleDriveSetupService) {}

  async createFiles(input: IFileUpload[]): Promise<IFileInDrive[]> {
    const totalFilesSize = getFilesTotalSize(input);

    if (totalFilesSize > MAX_FILE_SIZE) {
      throw new BadRequestException(
        'Total file size exceeds the Google Drive size limit',
      );
    }

    return await Promise.all(
      input.map(async (file, index) => {
        const fileExt = getFileExtFromMimeType(file.type);

        const createdFile = await this.createFileInDrive({
          name: `${DEFAULT_FILE_NAME}_${index + 1}.${fileExt}`,
          mimeType: file.type,
          file: file.file,
        });

        return {
          id: createdFile.data.id ?? '',
          name: createdFile.data.name ?? UNNAMED_FILE,
          mimeType: createdFile.data.mimeType ?? ContentType.DEFAULT,
        };
      }),
    );
  }

  private async createFileInDrive(input: ICreateFileInput) {
    try {
      const drive = this.driveSetupService.getGoogleDrive();

      return await drive.files.create({
        requestBody: {
          name: input.name,
          mimeType: input.mimeType,
        },
        media: {
          mimeType: input.mimeType,
          body: input.file,
        },
      });
    } catch (error: unknown) {
      if (errorTypeCheck(error, HttpStatus.FORBIDDEN)) {
        throw new ForbiddenException('Google Drive size exceeded');
      }

      throw error;
    }
  }
}
