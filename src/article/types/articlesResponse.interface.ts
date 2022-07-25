import { ArticleEntity } from '@app/article/article.entity';

export interface ArticlesResponseInterface {
  articles: Array<ArticleEntity>;
  articlesCount: number;
}
