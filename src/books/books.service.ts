import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-books.dto';
import { Book, BookDocument } from './schemas/books.schema';
import { googleAdditionalBookInfo } from 'src/utils/file';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { IResult } from './result.interface';

@Injectable()
export class BooksService {
  @Inject(CACHE_MANAGER) private cache: Cache;
  private readonly logger = new Logger(BooksService.name);
  constructor(
    @InjectModel(Book.name)
    private bookModel: Model<BookDocument>
  ) {}

  async create(bookDto: CreateBookDto): Promise<IResult> {
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
        parseInt(parts[6]) || 0 // Milliseconds
      );

      // Check if the parsed date is valid
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }

      bookDto.publishedDate = parsedDate;

      const createdBook = await new this.bookModel(bookDto).save();

      return {
        cacheKey: '/api/v1/books',
        result: createdBook,
      };
    } catch (error) {
      // Log the error
      this.logger.error(`Error creating book: ${error.message}`, error.stack);

      return {
        result: null,
      };
    }
  }

  async findAll({
    page = 1,
    perPage = 10,
    search = '',
    orderBy = 'createdAt',
    orderDirection = 'desc',
  }: {
    page: number;
    perPage: number;
    search?: string;
    orderBy?: 'createdAt' | 'updatedAt';
    orderDirection?: 'asc' | 'desc';
  }): Promise<IResult> {
    try {
      const skip = (page - 1) * perPage;
      let query = this.bookModel.find();

      // Apply search filters if provided
      if (search) {
        query = query.find({
          $or: [
            { title: { $regex: new RegExp(search, 'i') } },
            { genre: { $regex: new RegExp(search, 'i') } },
            { isbn: { $regex: new RegExp(search, 'i') } },
          ],
        });
      }

      query = query.sort({ orderBy: orderDirection });

      // Execute the query with pagination
      const books = await query.skip(skip).limit(perPage).exec();

      return {
        result: books,
      };
    } catch (error) {
      this.logger.error(`Error finding books: ${error.message}`, error.stack);
      return {
        result: [],
      };
    }
  }

  async getMoreInfo({ search }: { search?: string }): Promise<IResult> {
    try {
      const info = await googleAdditionalBookInfo(search);

      return {
        result: info,
      };
    } catch (error) {
      this.logger.error(`Error finding book info`, error.stack);
      throw new InternalServerErrorException({
        statusCode: 404,
        message: `Error finding more book info`,
      });
    }
  }

  async findById(id: string): Promise<IResult> {
    try {
      const book = await this.bookModel.findById(id).exec();

      if (!book) {
        throw new NotFoundException(`Book not found`);
      }

      return { result: book };
    } catch (error) {
      this.logger.error(`Error finding book`, error.stack);
      throw new InternalServerErrorException({
        statusCode: 404,
        message: `Error finding book`,
      });
    }
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<IResult> {
    try {
      const book = await this.bookModel
        .findByIdAndUpdate(id, updateBookDto, { new: true })
        .exec();

      return { result: book };
    } catch (error) {
      this.logger.error(`Error updating book`, error.stack);
      throw new InternalServerErrorException({
        statusCode: 404,
        message: `Error updating book`,
      });
    }
  }

  async remove(id: string): Promise<IResult> {
    try {
      await this.bookModel.findByIdAndDelete(id).exec();
      return { result: null };
    } catch (error) {
      this.logger.error(`Error deleting book`, error.stack);
      return { result: null };
    }
  }
}
