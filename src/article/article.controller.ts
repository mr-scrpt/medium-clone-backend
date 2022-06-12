import { ArticleService } from '@app/article/article.service';
import { Controller, Post } from '@nestjs/common';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}
  @Post()
  async createArcticle() {
    return await this.articleService.createArticle();
  }
}
