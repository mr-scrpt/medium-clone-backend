import { UserType } from '@app/user/types/user.type';

//export type ProfileType = Pick<UserEntity, 'username' | 'bio' | 'image'>;
export type ProfileType = UserType & {
  following: boolean;
};
