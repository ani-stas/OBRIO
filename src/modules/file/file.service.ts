import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios, { AxiosResponse } from 'axios';
import { Readable } from 'stream';
import { GoogleDriveService } from '../google-drive';
import { FileEntity } from './entities';
import { CreateFilesDto } from './dto';
import { IFile, IFileUpload } from './interfaces';
import { AxiosResponseType } from 'src/common/enums';
import {
  checkIfTextHtmlFileType,
  errorTypeCheck,
  getFileSize,
  getFileType,
  toCreateMultipleFiles,
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
    // prepare files for upload
    const preparedFiles = await this.prepareFilesForUpload(dto.urls);

    // upload files to drive
    const driveData = await this.googleDriveService.createFiles(preparedFiles);

    // save files data to DB
    return await this.createMultiple(userId, toCreateMultipleFiles(driveData));
  }

  private async getFileFromUrl(url: string): Promise<AxiosResponse<Readable>> {
    try {
      const axiosResponse = await axios.get(url, {
        responseType: AxiosResponseType.STREAM,
      });

      if (checkIfTextHtmlFileType(axiosResponse)) {
        throw new BadRequestException('URL is not a direct link to a file');
      }

      return axiosResponse;
    } catch (error: unknown) {
      if (errorTypeCheck(error, HttpStatus.NOT_FOUND)) {
        throw new NotFoundException('File does not exist');
      }

      throw error;
    }
  }

  private async create(userId: string, fileData: IFile): Promise<FileEntity> {
    const file = this.fileRepository.create({
      user: { id: userId },
      ...fileData,
    });

    return await this.fileRepository.save(file);
  }

  private async createMultiple(
    userId: string,
    filesData: IFile[],
  ): Promise<FileEntity[]> {
    return await Promise.all(
      filesData.map(async (data) => {
        return await this.create(userId, data);
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
