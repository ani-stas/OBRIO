import { Module } from '@nestjs/common';
import { GoogleDriveSetupService } from './google-drive-setup.service';

@Module({
  providers: [GoogleDriveSetupService],
  exports: [GoogleDriveSetupService],
})
export class GoogleDriveSetupModule {}
