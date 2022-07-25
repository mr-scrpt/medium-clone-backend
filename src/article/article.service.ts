import { ArticleEntity } from '@app/article/article.entity';
import { CreateArticleDto } from '@app/article/dto/createArticle.dto';
import { UpdateArticleDto } from '@app/article/dto/updateArticle.dto';
import { ArticleResponseInterface } from '@app/article/types/articleResponse.interface';
import { ArticlesResponseInterface } from '@app/article/types/ArticlesResponse.interface';
import { QueryStringInterface } from '@app/article/types/queryString.interface';
import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createArticle(
    currentUser: UserEntity,
    createArcticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    console.log('article dto here', createArcticleDto);

    Object.assign(article, createArcticleDto);

    if (!article.tagList) {
      article.tagList = [];
    }
    article.slug = this.createSlug(createArcticleDto.title);
    article.author = currentUser;
    return await this.articleRepository.save(article);
  }

  async getArticleAll(
    userId: string,
    query: QueryStringInterface,
  ): Promise<ArticlesResponseInterface> {
    const queryBuilder = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    queryBuilder.orderBy('articles.createAt', 'DESC');
    const articlesCount = await queryBuilder.getCount();
    const { author, tag, limit, offset } = query;

    if (tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${tag}%`,
      });
    }
    if (author) {
      const { id: authorId } = await this.userRepository.findOneBy({
        username: author,
      });

      queryBuilder.andWhere('articles.author.id = :id', { id: authorId });
    }

    if (limit) {
      queryBuilder.limit(limit);
    }

    if (offset) {
      queryBuilder.offset(offset);
    }

    const articles = await queryBuilder.getMany();

    return {
      articles,
      articlesCount,
    };
  }

  async getArticleBySlug(slug: string): Promise<ArticleEntity> {
    return await this.articleRepository.findOneBy({ slug });
  }

  async deleteArticleBySlug(
    slug: string,
    userId: string,
  ): Promise<DeleteResult> {
    const article = await this.getArticleBySlug(slug);

    if (!article) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }
    if (article.author.id !== userId) {
      throw new HttpException('You are not an author ', HttpStatus.FORBIDDEN);
    }

    return await this.articleRepository.delete({ slug });
  }

  async updateArticleBySlug(
    slug: string,
    userId: string,
    updateArcticleDto: UpdateArticleDto,
  ): Promise<ArticleEntity> {
    console.log('article dto here', updateArcticleDto);

    const article = await this.getArticleBySlug(slug);

    if (!article) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }
    if (article.author.id !== userId) {
      throw new HttpException('You are not an author ', HttpStatus.FORBIDDEN);
    }

    Object.assign(article, updateArcticleDto);

    return await this.articleRepository.save(article);
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
