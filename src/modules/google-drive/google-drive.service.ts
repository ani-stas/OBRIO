import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { GoogleDriveSetupService } from '../google-drive-setup';
import { ICreateFileInput } from './interfaces';
import { IFileUpload } from '../file/interfaces';
import {
  forbiddenErrorCheck,
  getFileExtFromMimeType,
  getFilesTotalSize,
} from 'src/common/utils';
import { DEFAULT_FILE_NAME, MAX_FILE_SIZE } from 'src/common/constants';

@Injectable()
export class GoogleDriveService {
  constructor(private readonly driveSetupService: GoogleDriveSetupService) {}

  async createFiles(input: IFileUpload[]): Promise<string> {
    const totalFilesSize = getFilesTotalSize(input);

    if (totalFilesSize > MAX_FILE_SIZE) {
      throw new BadRequestException(
        'Total file size exceeds the Google Drive size limit',
      );
    }

    await Promise.all(
      input.map(async (file, index) => {
        const fileExt = getFileExtFromMimeType(file.type);

        await this.createFileInDrive({
          name: `${DEFAULT_FILE_NAME}_${index + 1}.${fileExt}`,
          mimeType: file.type,
          file: file.file,
        });
      }),
    );

    return 'Files were successfully created';
  }

  private async createFileInDrive(input: ICreateFileInput): Promise<string> {
    try {
      const drive = this.driveSetupService.getGoogleDrive();

      await drive.files.create({
        requestBody: {
          name: input.name,
          mimeType: input.mimeType,
        },
        media: {
          mimeType: input.mimeType,
          body: input.file,
        },
      });

      return 'File was successfully created in drive';
    } catch (error: unknown) {
      if (forbiddenErrorCheck(error)) {
        throw new ForbiddenException('Google Drive size exceeded');
      }

      throw error;
    }
  }
}
