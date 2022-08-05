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
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { User } from '@app/user/decorators/user.decorator';
import { CreateArticleDto } from '@app/article/dto/createArticle.dto';
import { ArticleResponseInterface } from '@app/article/types/articleResponse.interface';
import { DeleteResult } from 'typeorm';
import { UpdateArticleDto } from '@app/article/dto/updateArticle.dto';
import { ArticlesResponseInterface } from '@app/article/types/ArticlesResponse.interface';
import { QueryStringInterface } from '@app/article/types/queryString.interface';
import { BackendValidationPipe } from '@app/shared/pipes/backendValidation.pipe';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
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

  @Get()
  async getArticleAll(
    @User('id') userId: string,
    @Query() query: QueryStringInterface,
  ): Promise<ArticlesResponseInterface> {
    console.log('all');

    return await this.articleService.getArticleAll(userId, query);
  }
  @Get('feed')
  @UseGuards(AuthGuard)
  async getUserFeed(
    @User('id') userId: string,
    @Param() query: any,
  ): Promise<ArticlesResponseInterface> {
    console.log('in ctrl');

    return await this.articleService.getUserFeed(userId, query);
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
    console.log('in contrl');

    return await this.articleService.deleteArticleBySlug(slug, userId);
  }

  @Put(':slug')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
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

  @Post(':slug/favorite')
  @UseGuards(AuthGuard)
  async addArticleToFavorites(
    @User('id') userId: string,
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.addArticleToFavorites(
      userId,
      slug,
    );
    return this.articleService.buildArcticleResponse(article);
  }

  @Delete(':slug/favorite')
  @UseGuards(AuthGuard)
  async deleteArticleFromFavorites(
    @User('id') userId: string,
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.deleteArticleFromFavorites(
      userId,
      slug,
    );
    return this.articleService.buildArcticleResponse(article);
  }
}
