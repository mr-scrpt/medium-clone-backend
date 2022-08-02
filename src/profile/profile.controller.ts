import { ProfileService } from '@app/profile/profile.service';
import { ProfileResponseInterface } from '@app/profile/types/profileResponse.interface';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async getProfileByUserName(
    @Param('username') username: string,
  ): Promise<ProfileResponseInterface> {
    const user = await this.profileService.getProfileByUserName(username);
    return await this.profileService.buildProfileResponse(user);
  }
}
