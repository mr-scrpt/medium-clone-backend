import { ProfileType } from '@app/profile/types/profile.type';
import { ProfileResponseInterface } from '@app/profile/types/profileResponse.interface';
import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async getProfileByUserName(
    profileUsername: string,
    userId,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOneBy({
      username: profileUsername,
    });
    if (!user) {
      throw new HttpException(
        'User profile dose not exist',
        HttpStatus.NOT_FOUND,
      );
    }
    return { ...user, following: false };
  }

  buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
    delete profile.email;
    return {
      profile,
    };
  }
}
