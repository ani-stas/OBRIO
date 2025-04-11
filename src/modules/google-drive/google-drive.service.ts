import { Injectable } from '@nestjs/common';
import { drive_v3 } from 'googleapis';
import { GoogleDriveSetupService } from '../google-drive-setup';
import { ICreateFileInput } from './interfaces';
import { IFileUpload } from '../file/interfaces';

@Injectable()
export class GoogleDriveService {
  private drive: drive_v3.Drive;

  constructor(private readonly driveSetupService: GoogleDriveSetupService) {
    this.drive = this.driveSetupService.getGoogleDrive();
  }

  async createFiles(input: IFileUpload[]): Promise<string> {
    await Promise.all(
      input.map(async (file, index) => {
        await this.createFileInDrive({
          name: `new_file_${index + 1}`,
          mimeType: file.type,
          file: file.file,
        });
      }),
    );

    return 'Files were successfully created';
  }

  private async createFileInDrive(input: ICreateFileInput): Promise<string> {
    await this.drive.files.create({
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
  }
}
