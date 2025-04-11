import { Module } from '@nestjs/common';
import { GoogleDriveService } from './google-drive.service';
import { GoogleDriveSetupService } from '../google-drive-setup';

@Module({
  providers: [GoogleDriveService, GoogleDriveSetupService],
  exports: [GoogleDriveService],
})
export class GoogleDriveModule {}
