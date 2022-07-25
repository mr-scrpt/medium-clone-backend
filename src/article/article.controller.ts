import { ArticleService } from '@app/article/article.service';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { UserEntity } from '@app/user/user.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { User } from '@app/user/decorators/user.decorator';
import { CreateArticleDto } from '@app/article/dto/createArticle.dto';
import { ArticleResponseInterface } from '@app/article/types/articleResponse.interface';
import { DeleteResult } from 'typeorm';
import { UpdateArticleDto } from '@app/article/dto/updateArticle.dto';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async createArcticle(
    @User() currentUser: UserEntity,
    @Body('article') createArcticleDto: CreateArticleDto,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.createArticle(
      currentUser,
      createArcticleDto,
    );

    return this.articleService.buildArcticleResponse(article);
  }

  @Get(':slug')
  async getArticleBySlug(
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.getArticleBySlug(slug);
    return this.articleService.buildArcticleResponse(article);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteArticleBySlug(
    @Param('slug') slug: string,
    @User('id') userId: string,
  ): Promise<DeleteResult> {
    return await this.articleService.deleteArticleBySlug(slug, userId);
  }

  @Put(':slug')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async updateArticleBySlag(
    @Param('slug') slug: string,
    @User('id') userId: string,
    @Body('article') updateArcticleDto: UpdateArticleDto,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.updateArticleBySlug(
      slug,
      userId,
      updateArcticleDto,
    );

    return this.articleService.buildArcticleResponse(article);
  }
}
