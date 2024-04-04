import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  create(createUsterDto: CreateUserDto): Promise<UserDocument> {
    const createdUser = new this.userModel(createUsterDto);
    return createdUser.save();
  }

  async findAll({
    page = 1,
    perPage = 10,
    search,
    orderBy = 'createdAt',
    orderDirection = 'desc',
  }: {
    page: number;
    perPage: number;
    search?: string;
    orderBy?: 'createdAt' | 'updatedAt';
    orderDirection?: 'asc' | 'desc';
  }): Promise<{ message: string; statusCode: number; result: UserDocument[] }> {
    const skip = (page - 1) * perPage;
    let query = this.userModel.find();
    try {
      query = query.sort({ orderBy: orderDirection });
      // Apply search filters if provided
      if (search) {
        query = query.find({
          $or: [
            { name: { $regex: new RegExp(search, 'i') } },
            { email: { $regex: new RegExp(search, 'i') } },
          ],
        });
      }

      // Execute the query with pagination
      const users = await query.skip(skip).limit(perPage).exec();

      return {
        message: 'Books found successfully',
        statusCode: HttpStatus.OK,
        result: users,
      };
    } catch (error) {
      this.logger.error(`Error finding books: ${error.message}`, error.stack);
      return {
        message: 'Error finding books',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        result: [],
      };
    }
  }

  async findById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id);
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto
  ): Promise<UserDocument> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    await this.userModel.findByIdAndDelete(id).exec();
  }
}
