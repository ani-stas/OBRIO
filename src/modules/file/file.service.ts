import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios, { AxiosResponse } from 'axios';
import { Readable } from 'stream';
import { GoogleDriveService } from '../google-drive';
import { FileEntity } from './entities';
import { CreateFilesDto } from './dto';
import { IFileUpload } from './interfaces';
import { AxiosResponseType } from 'src/common/enums';
import {
  checkIfTextHtmlFileType,
  getFileSize,
  getFileType,
} from 'src/common/utils';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  async getAllByUserId(userId: string): Promise<FileEntity[]> {
    return await this.fileRepository
      .createQueryBuilder('file')
      .leftJoin('file.user', 'user')
      .where('user.id = :userId', { userId })
      .getMany();
  }

  async createFiles(
    userId: string,
    dto: CreateFilesDto,
  ): Promise<FileEntity[]> {
    // save files links in DB
    const files = await this.createMultiple(userId, dto.urls);

    // prepare and upload files to drive
    const preparedFiles = await this.prepareFilesForUpload(dto.urls);
    await this.googleDriveService.createFiles(preparedFiles);

    return files;
  }

  private async getFileFromUrl(url: string): Promise<AxiosResponse<Readable>> {
    const axiosResponse = await axios.get(url, {
      responseType: AxiosResponseType.STREAM,
    });

    if (checkIfTextHtmlFileType(axiosResponse)) {
      throw new Error('URL is not a direct link to a file');
    }

    return axiosResponse;
  }

  private async create(userId: string, url: string): Promise<FileEntity> {
    const file = this.fileRepository.create({ user: { id: userId }, url });

    return await this.fileRepository.save(file);
  }

  private async createMultiple(
    userId: string,
    urls: string[],
  ): Promise<FileEntity[]> {
    return await Promise.all(
      urls.map(async (url) => {
        return await this.create(userId, url);
      }),
    );
  }

  private async prepareFilesForUpload(urls: string[]): Promise<IFileUpload[]> {
    return await Promise.all(
      urls.map(async (url) => {
        // extracting file from url
        const file = await this.getFileFromUrl(url);

        return {
          url,
          file: file.data,
          type: getFileType(file),
          size: getFileSize(file),
        };
      }),
    );
  }
}
