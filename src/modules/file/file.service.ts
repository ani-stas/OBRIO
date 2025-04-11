import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios, { AxiosResponse } from 'axios';
import { Readable } from 'stream';
import { GoogleDriveService } from '../google-drive';
import { FileEntity } from './entities';
import { CreateFilesDto } from './dto';
import { IFileUpload } from './interfaces';

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

  async createFiles(userId: string, dto: CreateFilesDto): Promise<string> {
    await this.createMultiple(userId, dto.urls);

    const files = await this.prepareFilesForUpload(dto.urls);

    return await this.googleDriveService.createFiles(files);
  }

  private async getFileFromUrl(url: string): Promise<AxiosResponse<Readable>> {
    const response = await axios.get(url, {
      responseType: 'stream',
    });

    const contentType = response.headers['content-type'] as string;

    if (contentType.includes('text/html')) {
      throw new Error(
        'URL is not a direct link to a file. It returned an HTML page.',
      );
    }

    return response;
  }

  private getFileType(file: AxiosResponse<Readable>): string {
    if (file.headers) {
      return file.headers['content-type'] as string;
    }
    //Todo: add throw error
    return '';
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
        const file = await this.getFileFromUrl(url);

        return {
          file: file.data,
          type: this.getFileType(file),
        };
      }),
    );
  }
}
