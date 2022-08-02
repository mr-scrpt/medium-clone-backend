import { UserEntity } from '@app/user/user.entity';

export type ProfileType = Pick<UserEntity, 'username' | 'bio' | 'image'>;
