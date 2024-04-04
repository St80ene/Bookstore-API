import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BookDocument = Book & Document;

@Schema({ timestamps: true })
export class Book {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  genre: string;

  @Prop({ type: Date })
  publishedDate: Date;

  @Prop({ required: true })
  isbn: string;
}

// Define indexes for title, author, and isbn fields

export const BookSchema = SchemaFactory.createForClass(Book);

BookSchema.index({ title: 1, author: 1, isbn: 1 });
