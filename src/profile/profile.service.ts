import { FollowEntity } from '@app/profile/follow.entity';
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

    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}
  async getProfileByUserName(
    profileUsername: string,
    userId: string,
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

    if (!userId) {
      return { ...user, following: false };
    }
    const follow = await this.followRepository.findOneBy({
      followerId: userId,
      followingId: user.id,
    });

    return { ...user, following: Boolean(follow) };
  }
  async followProfile(
    profileUsername: string,
    userId: string,
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
    if (user.id === userId) {
      throw new HttpException(
        'Follower and following cant be equal',
        HttpStatus.BAD_REQUEST,
      );
    }

    const follow = await this.followRepository.findOneBy({
      followerId: userId,
      followingId: user.id,
    });

    if (follow) {
      throw new HttpException('Already followed', HttpStatus.BAD_REQUEST);
    }

    const doFollow = new FollowEntity();
    doFollow.followerId = userId;
    doFollow.followingId = user.id;
    await this.followRepository.save(doFollow);

    return { ...user, following: true };
  }

  async unFollowProfile(
    profileUsername: string,
    userId: string,
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
    if (user.id === userId) {
      throw new HttpException(
        'Follower and following cant be equal',
        HttpStatus.BAD_REQUEST,
      );
    }

    const follow = await this.followRepository.findOneBy({
      followerId: userId,
      followingId: user.id,
    });

    if (!follow) {
      throw new HttpException('Not followed yet', HttpStatus.BAD_REQUEST);
    }
    await this.followRepository.delete({
      followerId: userId,
      followingId: user.id,
    });
    return { ...user, following: false };
  }

  buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
    delete profile.email;
    return {
      profile,
    };
  }
}
