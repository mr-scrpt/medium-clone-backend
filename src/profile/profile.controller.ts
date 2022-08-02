import { ProfileService } from '@app/profile/profile.service';
import { ProfileResponseInterface } from '@app/profile/types/profileResponse.interface';
import { User } from '@app/user/decorators/user.decorator';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { UserService } from '@app/user/user.service';
import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

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

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async followProfile(
    @Param('username') profileUsername: string,
    @User('id') userId: string,
  ): Promise<ProfileResponseInterface> {
    const userProfile = await this.profileService.followProfile(
      profileUsername,
      userId,
    );
    return await this.profileService.buildProfileResponse(userProfile);
  }

  @Delete(':username/follow')
  @UseGuards(AuthGuard)
  async unFollowProfile(
    @Param('username') profileUsername: string,
    @User('id') userId: string,
  ): Promise<ProfileResponseInterface> {
    const userProfile = await this.profileService.unFollowProfile(
      profileUsername,
      userId,
    );
    return await this.profileService.buildProfileResponse(userProfile);
  }
}
