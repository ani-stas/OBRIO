import { IsArray, ArrayNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateFilesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  urls: string[];
}
