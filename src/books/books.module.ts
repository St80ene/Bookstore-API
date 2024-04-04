import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from './schemas/books.schema';
import { CacheGuard } from 'src/auth/common/cacheGetGuard';
import { CacheService } from 'src/cache/cache.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
  ],
  controllers: [BooksController],
  providers: [BooksService, CacheService, CacheGuard],
  exports: [BooksService],
})
export class BooksModule {}
