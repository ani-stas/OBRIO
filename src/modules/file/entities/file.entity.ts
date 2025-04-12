import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../user';

@Entity('file')
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  mimeType: string;

  @Column()
  driveUrl: string;

  @Column()
  driveId: string;

  @ManyToOne(() => UserEntity, (user) => user.files)
  user: UserEntity;
}
