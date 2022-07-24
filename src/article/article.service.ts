import { ArticleEntity } from '@app/article/article.entity';
import { CreateArticleDto } from '@app/article/dto/createArticle.dto';
import { ArticleResponseInterface } from '@app/article/types/articleResponse.interface';
import { UserEntity } from '@app/user/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { Repository } from 'typeorm';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
  ) {}

  async createArticle(
    currentUser: UserEntity,
    createArcticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArcticleDto);

    if (!article.tagList) {
      article.tagList = [];
    }
    article.slug = this.createSlug(createArcticleDto.title);
    article.author = currentUser;
    return await this.articleRepository.save(article);
  }

  async getArticleBySlug(slug: string): Promise<ArticleEntity> {
    return await this.articleRepository.findOneBy({ slug });
  }

  buildArcticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return {
      article,
    };
  }

  private createSlug(title: string): string {
    return `${slugify(title, {
      lower: true,
    })}_${((Math.random() * Math.pow(36, 6)) | 0).toString(36)}`;
  }
}
