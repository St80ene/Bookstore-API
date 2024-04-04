import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Req,
  UseGuards,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-books.dto';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/auth/common/guards/accessToken.guards';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  create(@Body() createBookDto: any) {
    return this.booksService.create(createBookDto);
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  findAll(@Query() query) {
    return this.booksService.findAll(query);
  }

  @UseGuards(AccessTokenGuard)
  @Get(':id')
  findOne(@Param('id') bookId: string) {
    return this.booksService.findById(bookId);
  }

  @UseGuards(AccessTokenGuard)
  @Put(':id')
  update(@Param('id') bookId: string, @Body() bookDto: UpdateBookDto) {
    return this.booksService.update(bookId, bookDto);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') bookId: string) {
    return this.booksService.remove(bookId);
  }
}
