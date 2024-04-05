import { BookDocument } from './schemas/books.schema';

export interface IResult {
  cacheKey?: string;
  result: BookDocument | string | undefined | BookDocument[] | null;
}
