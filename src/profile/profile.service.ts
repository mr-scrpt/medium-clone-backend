import { ProfileResponseInterface } from '@app/profile/types/profileResponse.interface';
import { UserEntity } from '@app/user/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async getProfileByUserName(username: string): Promise<UserEntity> {
    return await this.userRepository.findOneBy({
      username,
    });
  }

  buildProfileResponse(profile: UserEntity): ProfileResponseInterface {
    return {
      profile: {
        ...profile,
        following: true,
      },
    };
  }
}
