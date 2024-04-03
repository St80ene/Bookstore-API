// import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
// import { CreateTesterDto } from 'src/testers/dto/create-tester.dto';
// import { AuthService } from './auth.service';
// import { AuthDto } from './dto/auth.dto';
// import { Request } from 'express';
// import { AccessTokenGuard } from 'src/auth/common/guards/accessToken.guards';
// import { RefreshTokenGuard } from 'src/auth/common/guards/refreshToken.guards';

// @Controller('auth')
// export class AuthController {
//   constructor(private readonly authService: AuthService) {}

//   @Post('/testers/signup')
//   signup(@Body() createTesterDto: CreateTesterDto) {
//     return this.authService.testerSignUp(createTesterDto);
//   }

//   @Post('/testers/login')
//   signin(@Body() data: AuthDto) {
//     return this.authService.testerSignIn(data);
//   }

//   @UseGuards(AccessTokenGuard)
//   @Get('/testers/logout')
//   logout(@Req() req: Request) {
//     return this.authService.testerLogout(req.user['sub']);
//   }

//   @UseGuards(RefreshTokenGuard)
//   @Get('/testers/refresh')
//   refreshTokens(@Req() req: Request) {
//     const userId = req.user['sub'];
//     const refreshToken = req.user['refreshToken'];
//     return this.authService.testerRefreshTokens(userId, refreshToken);
//   }

//   @Post('/product_owners/signup')
//   productOwnerSignup(@Body() createTesterDto: CreateTesterDto) {
//     return this.authService.productOwnerSignUp(createTesterDto);
//   }

//   @Post('/product_owners/login')
//   productOwnerSignin(@Body() data: AuthDto) {
//     return this.authService.productOwnerSignIn(data);
//   }

//   @UseGuards(AccessTokenGuard)
//   @Get('/product_owners/logout')
//   productOwnerLogout(@Req() req: Request) {
//     return this.authService.productOwnerLogout(req.user['sub']);
//   }

//   @UseGuards(RefreshTokenGuard)
//   @Get('/product_owners/refresh')
//   refreshProductOwnerTokens(@Req() req: Request) {
//     const userId = req.user['sub'];
//     const refreshToken = req.user['refreshToken'];
//     return this.authService.productOwnerRefreshTokens(userId, refreshToken);
//   }
// }
