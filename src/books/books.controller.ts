import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Param,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { UpdateBookDto } from './dto/update-books.dto';
import { AccessTokenGuard } from 'src/auth/common/guards/accessToken.guards';
import { CacheGuard } from 'src/auth/common/guards/cacheGetGuard';
import { FormatResponseFilter } from 'src/filters/ResponseFilter.filter';

@UseGuards(CacheGuard)
@UseInterceptors(FormatResponseFilter)
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  create(@Body() createBookDto: any) {
    return this.booksService.create(createBookDto);
  }

  // @UseGuards(AccessTokenGuard, CacheGuard)
  // @UseGuards(AccessTokenGuard, CacheGuard)
  // @UseGuards(CacheGuard)
  @UseGuards(AccessTokenGuard)
  @Get()
  findAll(@Query() query) {
    return this.booksService.findAll(query);
  }

  @UseGuards(AccessTokenGuard)
  @UseGuards(CacheGuard)
  @Get('info')
  getMoreBookInfo(@Query() query) {
    return this.booksService.getMoreInfo({ search: query });
  }

  @UseGuards(AccessTokenGuard)
  @Get(':id')
  findOne(@Param('id') bookId: string) {
    return this.booksService.findById(bookId);
  }

  @UseGuards(AccessTokenGuard)
  // @UseGuards(CacheGuard)
  @Put(':id')
  update(@Param('id') bookId: string, @Body() bookDto: UpdateBookDto) {
    return this.booksService.update(bookId, bookDto);
  }

  // @UseGuards(AccessTokenGuard)
  // @UseGuards(CacheGuard)
  @Delete(':id')
  remove(@Param('id') bookId: string) {
    return this.booksService.remove(bookId);
  }
}
