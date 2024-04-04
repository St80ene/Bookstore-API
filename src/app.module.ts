import { Module,MiddlewareConsumer,RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BooksModule } from './books/books.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { FormatResponse } from './utils/middlewares/formatResponse.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [],
    }),
    CacheModule.register(),
    MongooseModule.forRoot(process.env.DB_CONNECTION_STRING),
    BooksModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
   configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(FormatResponse)
      .exclude({ path: 'auth', method: RequestMethod.GET })
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
