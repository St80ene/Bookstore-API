import { Module } from "@nestjs/common";
import { BooksService } from "./books.service";
import { BooksController } from "./books.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Book, BookSchema } from "./schemas/books.schema";
import { CacheModule } from "@nestjs/cache-manager";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
    CacheModule.register(),
  ],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
