import { Module } from '@nestjs/common';
import { AppController } from '@app/app.controller';

import { TagModule } from '@app/tag/tag.module';
import { AppService } from '@app/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormconfig from '@app/configorm';

@Module({
  imports: [TypeOrmModule.forRoot(ormconfig), TagModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
