import { UserEntity } from './user.entity';

export interface RegisterResultEntity {
  message: string;
  user: UserEntity;
}