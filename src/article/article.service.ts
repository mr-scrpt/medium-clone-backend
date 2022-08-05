import { ArticleEntity } from '@app/article/article.entity';
import { CreateArticleDto } from '@app/article/dto/createArticle.dto';
import { UpdateArticleDto } from '@app/article/dto/updateArticle.dto';
import { ArticleResponseInterface } from '@app/article/types/articleResponse.interface';
import { ArticlesResponseInterface } from '@app/article/types/ArticlesResponse.interface';
import { QueryStringInterface } from '@app/article/types/queryString.interface';
import { FollowEntity } from '@app/profile/follow.entity';
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

    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
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

  async getArticleAll(
    userId: string,
    query: QueryStringInterface,
  ): Promise<ArticlesResponseInterface> {
    const queryBuilder = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    queryBuilder.orderBy('articles.createAt', 'DESC');
    const { author, tag, limit, offset, favorited } = query;

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

    if (favorited) {
      const author = await this.userRepository.findOne({
        relations: ['favorites'],
        where: {
          username: favorited,
        },
      });
      const ids = author.favorites.map((el) => el.id);

      if (ids.length > 0) {
        console.log('in if');

        queryBuilder.andWhere('articles.id IN (:...ids)', {
          ids,
        });
      } else {
        queryBuilder.andWhere('1=0');
      }
    }

    if (limit) {
      queryBuilder.limit(limit);
    }

    if (offset) {
      queryBuilder.offset(offset);
    }

    let favoriteIds: number[] = [];

    if (userId) {
      const user = await this.userRepository.findOne({
        relations: ['favorites'],
        where: {
          id: userId,
        },
      });
      favoriteIds = user.favorites.map((fav) => fav.id);
    }
    const articlesCount = await queryBuilder.getCount();
    const articles = await queryBuilder.getMany();
    const articlesWithFavorites = articles.map((article) => {
      const favorited = favoriteIds.includes(article.id);
      return { ...article, favorited };
    });

    return {
      articles: articlesWithFavorites,
      articlesCount,
    };
  }

  async getUserFeed(
    userId: string,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    console.log('is in');
    console.log('userId', userId);

    const follows = await this.followRepository.find({
      where: {
        followerId: userId,
      },
    });

    console.log('follows', follows);

    if (follows.length === 0) {
      console.log('here');

      return { articles: [], articlesCount: 0 };
    }

    const followingUserIds = follows.map((follow) => follow.followingId);

    console.log('followUserIds', followingUserIds);

    const queryBuilder = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .where('articles.authorId IN (:...ids)', {
        ids: followingUserIds,
      });

    queryBuilder.orderBy('articles.createAt', 'DESC');

    const { limit, offset } = query;

    if (limit) {
      queryBuilder.limit(limit);
    }
    if (offset) {
      queryBuilder.offset(offset);
    }
    const articlesCount = await queryBuilder.getCount();
    const articles = await queryBuilder.getMany();

    return { articles, articlesCount };
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

  async addArticleToFavorites(
    userId: string,
    slug: string,
  ): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);
    const user = await this.userRepository.findOne({
      relations: ['favorites'],
      where: {
        id: userId,
      },
    });

    const isNotFavorited =
      user.favorites.findIndex(
        (articleInFavorit) => articleInFavorit.id === article.id,
      ) === -1;

    if (isNotFavorited) {
      user.favorites.push(article);
      article.favoritesCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  async deleteArticleFromFavorites(
    userId: string,
    slug: string,
  ): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);
    const user = await this.userRepository.findOne({
      relations: ['favorites'],
      where: {
        id: userId,
      },
    });

    const articleIndex = user.favorites.findIndex(
      (articleInFavorit) => articleInFavorit.id === article.id,
    );

    if (articleIndex >= 0) {
      user.favorites.splice(articleIndex, 1);
      article.favoritesCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  private createSlug(title: string): string {
    return `${slugify(title, {
      lower: true,
    })}_${((Math.random() * Math.pow(36, 6)) | 0).toString(36)}`;
  }
}
