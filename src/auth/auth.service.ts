// import {
//   BadRequestException,
//   ForbiddenException,
//   Injectable,
//   InternalServerErrorException,
// } from '@nestjs/common';
// import { AuthDto } from './dto/auth.dto';
// import { JwtService } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config';
// import * as argon2 from 'argon2';
// import { TestersService } from '../testers/testers.service';
// import { CreateTesterDto } from '../testers/dto/create-tester.dto';
// import { ProductOwnersService } from '../product-owners/product-owners.service';
// import { CreateProductOwnerDto } from 'src/product-owners/dto/create-product-owner.dto';

// @Injectable()
// export class AuthService {
//   constructor(
//     private testersService: TestersService,
//     private productOwnerService: ProductOwnersService,
//     private jwtService: JwtService,
//     private configService: ConfigService,
//   ) {}

//   async testerSignUp(createTesterDto: CreateTesterDto): Promise<any> {
//     // Check if user exists
//     const userExists = await this.testersService.findByEmail(
//       createTesterDto.email,
//     );
//     if (userExists) {
//       throw new BadRequestException('User already exists');
//     }

//     // Hash password
//     const hash = await this.hashData(createTesterDto.password);
//     const newUser = await this.testersService.create({
//       ...createTesterDto,
//       password: hash,
//     });

//     const tokens = await this.getTokens(newUser._id, newUser.email);
//     await this.updateRefreshToken(newUser._id, tokens.refreshToken);
//     return tokens;
//   }

//   async productOwnerSignUp(createuserDto: CreateProductOwnerDto): Promise<any> {
//     // Check if user exists
//     const userExists = await this.productOwnerService.findByEmail(
//       createuserDto.email,
//     );
//     if (userExists) {
//       throw new BadRequestException('User already exists');
//     }

//     // Hash password
//     const hash = await this.hashData(createuserDto.password);
//     const newUser = await this.productOwnerService.create({
//       ...createuserDto,
//       password: hash,
//     });

//     const tokens = await this.getTokens(newUser._id, newUser.email);
//     await this.updateProductOwnerRefreshToken(newUser._id, tokens.refreshToken);
//     return tokens;
//   }

//   async testerSignIn(data: AuthDto) {
//     try {
//       // Check if user exists
//       const user = await this.testersService.findByEmail(data.email);

//       if (!user) throw new BadRequestException('User does not exist');

//       const passwordMatches = await argon2.verify(user.password, data.password);

//       if (!passwordMatches)
//         throw new BadRequestException('Password is incorrect');

//       const tokens = await this.getTokens(user._id, user.email);

//       await this.updateRefreshToken(user._id, tokens.refreshToken);

//       return tokens;
//     } catch (error) {
//       throw new InternalServerErrorException(
//         'Request failed: ' + error.message,
//       );
//     }
//   }

//   async productOwnerSignIn(data: AuthDto) {
//     try {
//       // Check if user exists
//       const user = await this.productOwnerService.findByEmail(data.email);

//       if (!user) throw new BadRequestException('User does not exist');

//       const passwordMatches = await argon2.verify(user.password, data.password);

//       if (!passwordMatches)
//         throw new BadRequestException('Password is incorrect');

//       const tokens = await this.getTokens(user._id, user.email);

//       await this.updateProductOwnerRefreshToken(user._id, tokens.refreshToken);

//       return tokens;
//     } catch (error) {
//       throw new InternalServerErrorException(
//         'Request failed: ' + error.message,
//       );
//     }
//   }

//   async testerLogout(userId: string) {
//     try {
//       return this.testersService.update(userId, { refreshToken: null });
//     } catch (error) {
//       throw new InternalServerErrorException(
//         'Request failed: ' + error.message,
//       );
//     }
//   }

//   async productOwnerLogout(userId: string) {
//     try {
//       return this.productOwnerService.update(userId, { refreshToken: null });
//     } catch (error) {
//       throw new InternalServerErrorException(
//         'Request failed: ' + error.message,
//       );
//     }
//   }

//   async updateRefreshToken(userId: string, refreshToken: string) {
//     try {
//       const hashedRefreshToken = await this.hashData(refreshToken);

//       await this.testersService.update(userId, {
//         refreshToken: hashedRefreshToken,
//       });
//     } catch (error) {
//       throw new InternalServerErrorException(
//         'Request failed: ' + error.message,
//       );
//     }
//   }

//   async updateProductOwnerRefreshToken(userId: string, refreshToken: string) {
//     try {
//       const hashedRefreshToken = await this.hashData(refreshToken);

//       await this.productOwnerService.update(userId, {
//         refreshToken: hashedRefreshToken,
//       });
//     } catch (error) {
//       throw new InternalServerErrorException(
//         'Request failed: ' + error.message,
//       );
//     }
//   }

//   async getTokens(userId: string, email: string) {
//     try {
//       const [accessToken, refreshToken] = await Promise.all([
//         this.jwtService.signAsync(
//           {
//             sub: userId,
//             email,
//           },
//           {
//             secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
//             expiresIn: '15m',
//           },
//         ),
//         this.jwtService.signAsync(
//           {
//             sub: userId,
//             email,
//           },
//           {
//             secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
//             expiresIn: '7d',
//           },
//         ),
//       ]);

//       return {
//         accessToken,
//         refreshToken,
//       };
//     } catch (error) {
//       throw new InternalServerErrorException(
//         'Request failed: ' + error.message,
//       );
//     }
//   }

//   hashData = (data: any) => {
//     return argon2.hash(data);
//   };

//   async testerRefreshTokens(userId: string, refreshToken: string) {
//     try {
//       const user = await this.testersService.findById(userId);
//       if (!user || !user.refreshToken)
//         throw new ForbiddenException('Access Denied');
//       const refreshTokenMatches = await argon2.verify(
//         user.refreshToken,
//         refreshToken,
//       );
//       if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
//       const tokens = await this.getTokens(user.id, user.email);
//       await this.updateRefreshToken(user.id, tokens.refreshToken);
//       return tokens;
//     } catch (error) {
//       throw new InternalServerErrorException(
//         'Request failed: ' + error.message,
//       );
//     }
//   }

//   async productOwnerRefreshTokens(userId: string, refreshToken: string) {
//     try {
//       const user = await this.productOwnerService.findById(userId);
//       if (!user || !user.refreshToken)
//         throw new ForbiddenException('Access Denied');
//       const refreshTokenMatches = await argon2.verify(
//         user.refreshToken,
//         refreshToken,
//       );
//       if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
//       const tokens = await this.getTokens(user.id, user.email);
//       await this.updateProductOwnerRefreshToken(user.id, tokens.refreshToken);
//       return tokens;
//     } catch (error) {
//       throw new InternalServerErrorException(
//         'Request failed: ' + error.message,
//       );
//     }
//   }
// }
