import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  Inject,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateBookDto } from "./dto/create-book.dto";
import { UpdateBookDto } from "./dto/update-books.dto";
import { Book, BookDocument } from "./schemas/books.schema";
import { googleAdditionalBookInfo } from "src/utils/file";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class BooksService {
  @Inject(CACHE_MANAGER) private cache: Cache;
  private readonly logger = new Logger(BooksService.name);
  constructor(
    @InjectModel(Book.name)
    private bookModel: Model<BookDocument>,
  ) {}

  async create(bookDto: CreateBookDto): Promise<{
    message: string;
    statusCode: number;
    result: BookDocument | string | undefined;
  }> {
    try {
      // Split the date string into its components
      // @ts-expect-error
      const parts = bookDto.publishedDate?.split(/[- :.]/);

      // Create a Date object from the parsed components
      const parsedDate = new Date(
        parseInt(parts[0]), // Year
        parseInt(parts[1]) - 1, // Month (subtract 1 as months are 0-indexed in JavaScript Date)
        parseInt(parts[2]), // Day
        parseInt(parts[3]), // Hours
        parseInt(parts[4]), // Minutes
        parseInt(parts[5]), // Seconds
        parseInt(parts[6]) || 0, // Milliseconds
      );

      // Check if the parsed date is valid
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException("Invalid date format");
      }

      bookDto.publishedDate = parsedDate;

      const createdBook = await new this.bookModel(bookDto).save();

      return {
        message: "Record created succesfully",
        statusCode: 201,
        result: createdBook,
      };
    } catch (error) {
      // Log the error
      this.logger.error(`Error creating book: ${error.message}`, error.stack);

      return {
        message: "Failed to create book",
        statusCode: 500,
        result: "",
      };
    }
  }

  async findAll({
    page = 1,
    perPage = 10,
    search = "",
    orderBy = "createdAt",
    orderDirection = "desc",
  }: {
    page: number;
    perPage: number;
    search?: string;
    orderBy?: "createdAt" | "updatedAt";
    orderDirection?: "asc" | "desc";
  }): Promise<{ message: string; statusCode: number; result: BookDocument[] }> {
    try {
      const cacheKey = `books:${JSON.stringify({
        page,
        perPage,
        search,
        orderBy,
        orderDirection,
      })}`;
      const cachedResult = await this.cache.get(cacheKey);

      if (cachedResult) {
        const parsedResult: string = cachedResult as string;
        return {
          message: "Books found successfully",
          statusCode: HttpStatus.OK,
          result: JSON.parse(parsedResult),
        };
      } else {
        const skip = (page - 1) * perPage;
        let query = this.bookModel.find();

        // Apply search filters if provided
        if (search) {
          query = query.find({
            $or: [
              { title: { $regex: new RegExp(search, "i") } },
              { genre: { $regex: new RegExp(search, "i") } },
              { isbn: { $regex: new RegExp(search, "i") } },
            ],
          });
        }

        query = query.sort({ orderBy: orderDirection });

        // Execute the query with pagination
        const books = await query.skip(skip).limit(perPage).exec();

        await this.cache.set(cacheKey, JSON.stringify(books));

        return {
          message: "Books found successfully",
          statusCode: HttpStatus.OK,
          result: books,
        };
      }
    } catch (error) {
      this.logger.error(`Error finding books: ${error.message}`, error.stack);
      return {
        message: "Error finding books",
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        result: [],
      };
    }
  }

  async getMoreInfo({
    search,
  }: {
    search?: string;
  }): Promise<{ message: string; statusCode: number; result: BookDocument[] }> {
    try {
      const cacheKey = `books:${JSON.stringify({ search })}`;
      const cachedResult = await this.cache.get(cacheKey);
      if (cachedResult) {
        const parsedResult: string = cachedResult as string;
        return {
          message: "Books found successfully",
          statusCode: HttpStatus.OK,
          result: JSON.parse(parsedResult),
        };
      } else {
        const info = await googleAdditionalBookInfo(search);

        if (!info) {
          throw new NotFoundException(`More Info about Book not found`);
        }
        await this.cache.set(cacheKey, JSON.stringify(info.items));
        return {
          message: "More additional info found",
          statusCode: 200,
          result: info.items,
        };
      }
    } catch (error) {
      this.logger.error(`Error finding book info`, error.stack);
      throw new InternalServerErrorException({
        statusCode: 404,
        message: `Error finding more book info`,
      });
    }
  }

  async findById(id: string): Promise<BookDocument> {
    try {
      const cacheKey = `books:${JSON.stringify({ id })}`;
      const cachedResult = await this.cache.get(cacheKey);
      if (cachedResult) {
        const parsedResult: string = cachedResult as string;
        return JSON.parse(parsedResult);
      }
      const book = await this.bookModel.findById(id).exec();

      if (!book) {
        throw new NotFoundException(`Book not found`);
      }
      await this.cache.set(cacheKey, JSON.stringify(book));

      return book;
    } catch (error) {
      this.logger.error(`Error finding book`, error.stack);
      throw new InternalServerErrorException({
        statusCode: 404,
        message: `Error finding book`,
      });
    }
  }

  async update(
    id: string,
    updateBookDto: UpdateBookDto,
  ): Promise<{
    message: string;
    statusCode: number;
    result: BookDocument | string | undefined;
  }> {
    try {
      const book = await this.bookModel
        .findByIdAndUpdate(id, updateBookDto, { new: true })
        .exec();

      await this.flushKeysContainingBooks("books*");

      return { message: "Updated", statusCode: 200, result: book };
    } catch (error) {
      this.logger.error(`Error updating book`, error.stack);
      throw new InternalServerErrorException({
        statusCode: 404,
        message: `Error updating book`,
      });
    }
  }

  async remove(id: string): Promise<{ message: string; statusCode: number }> {
    try {
      await this.bookModel.findByIdAndDelete(id).exec();
      await this.flushKeysContainingBooks("books*");
      return { message: "Deleted successfully", statusCode: 200 };
    } catch (error) {
      this.logger.error(`Error deleting book`, error.stack);
      return { message: "Error deleting", statusCode: 500 };
    }
  }

  async flushKeysContainingBooks(pattern: string) {
    try {
      const result = await this.cache.store.keys(pattern);

      for (const key of result) {
        await this.cache.del(key);
      }
      return true;
    } catch (error) {
      console.error("Error flushing keys:", error);
      throw error;
    }
  }
}
