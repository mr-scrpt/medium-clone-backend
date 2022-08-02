import { ProfileService } from '@app/profile/profile.service';
import { ProfileResponseInterface } from '@app/profile/types/profileResponse.interface';
import { User } from '@app/user/decorators/user.decorator';
import { UserService } from '@app/user/user.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async getProfileByUserName(
    @Param('username') profileUsername: string,
    @User('id') userId: string,
  ): Promise<ProfileResponseInterface> {
    const userProfile = await this.profileService.getProfileByUserName(
      profileUsername,
      userId,
    );
    return await this.profileService.buildProfileResponse(userProfile);
  }
}
