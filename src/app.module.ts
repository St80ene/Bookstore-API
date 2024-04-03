import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { TestersModule } from './testers/testers.module';
// import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
// import { ProductOwnersController } from './product-owners/product-owners.controller';
// import { WaitlistController } from './waitlist/waitlist.controller';
// import { WaitlistModule } from './waitlist/waitlist.module';
// import { ProductOwnersModule } from './product-owners/product-owners.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [],
    }),
    MongooseModule.forRoot(process.env.DB_CONNECTION_STRING),
    // TestersModule,
    // AuthModule,
    // WaitlistModule,
    // ProductOwnersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
