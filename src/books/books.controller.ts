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
} from "@nestjs/common";
import { BooksService } from "./books.service";
import { UpdateBookDto } from "./dto/update-books.dto";
import { AccessTokenGuard } from "src/auth/common/guards/accessToken.guards";

@Controller("books")
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

  @Get("info")
  getMoreBookInfo(@Query() query) {
    return this.booksService.getMoreInfo({ search: query });
  }

  @UseGuards(AccessTokenGuard)
  @Get(":id")
  findOne(@Param("id") bookId: string) {
    return this.booksService.findById(bookId);
  }

  @UseGuards(AccessTokenGuard)
  @Put(":id")
  update(@Param("id") bookId: string, @Body() bookDto: UpdateBookDto) {
    return this.booksService.update(bookId, bookDto);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(":id")
  remove(@Param("id") bookId: string) {
    return this.booksService.remove(bookId);
  }
}
