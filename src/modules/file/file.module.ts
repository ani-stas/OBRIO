import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { FileEntity } from './entities';
import { GoogleDriveService } from '../google-drive';
import { GoogleDriveSetupService } from '../google-drive-setup';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity])],
  controllers: [FileController],
  providers: [FileService, GoogleDriveService, GoogleDriveSetupService],
})
export class FileModule {}
