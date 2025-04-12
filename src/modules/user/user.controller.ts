import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserEntity } from './entities';
import { CreateUserDto } from './dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserEntity> {
    const existingUser = await this.userService.findOneByEmail(dto.email);

    if (existingUser) {
      throw new BadRequestException(`Email ${dto.email} is already in use`);
    }

    return await this.userService.create(dto);
  }
}
