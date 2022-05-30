import { Module } from '@nestjs/common';
import { AppController } from '@app/app.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { TagModule } from '@app/tag/tag.module';
import { UserModule } from '@app/user/user.module';

import { AppService } from '@app/app.service';
import ormconfig from '@app/configorm';

@Module({
  imports: [TypeOrmModule.forRoot(ormconfig), TagModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
