import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FileService } from './file.service';
import { FileEntity } from './entities';
import { CreateFilesDto } from './dto';
import { UserIdParamDto } from '../user/dto';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get(':userId')
  async getAllByUserId(@Param() params: UserIdParamDto): Promise<FileEntity[]> {
    return await this.fileService.getAllByUserId(params.userId);
  }

  @Post(':userId')
  async createFiles(
    @Param() params: UserIdParamDto,
    @Body() dto: CreateFilesDto,
  ): Promise<string> {
    return await this.fileService.createFiles(params.userId, dto);
  }
}
