import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { AuthDto } from "./dto/auth.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as argon2 from "argon2";
import { UsersService } from "src/users/users.service";
import { CreateUserDto } from "src/users/dto/create-user.dto";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<any> {
    // Check if user exists
    const userExists = await this.usersService.findByEmail(createUserDto.email);
    if (userExists) {
      throw new BadRequestException("User already exists");
    }

    // Hash password
    const hash = await this.hashData(createUserDto.password);
    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hash,
    });

    const tokens = await this.getTokens(newUser._id, newUser.email);
    await this.updateRefreshToken(newUser._id, tokens.refreshToken);
    return { ...tokens, user: newUser };
  }

  async signIn(data: AuthDto) {
    try {
      // Check if user exists
      const user = await this.usersService.findByEmail(data.email);

      if (!user) throw new BadRequestException("User does not exist");

      const passwordMatches = await argon2.verify(user.password, data.password);

      if (!passwordMatches)
        throw new BadRequestException("Password is incorrect");

      const tokens = await this.getTokens(user._id, user.email);

      await this.updateRefreshToken(user._id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new InternalServerErrorException(
        "Request failed: " + error.message
      );
    }
  }

  async logout(userId: string) {
    try {
      return this.usersService.update(userId, { refreshToken: null });
    } catch (error) {
      throw new InternalServerErrorException(
        "Request failed: " + error.message
      );
    }
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    try {
      const hashedRefreshToken = await this.hashData(refreshToken);

      await this.usersService.update(userId, {
        refreshToken: hashedRefreshToken,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        "Request failed: " + error.message
      );
    }
  }

  async getTokens(userId: string, email: string) {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.sign(
          {
            sub: userId,
            email,
          },
          {
            expiresIn: `${60 * 60 * 24}s`,
          }
        ),
        this.jwtService.signAsync(
          {
            sub: userId,
            email,
          },
          {
            expiresIn: "7d",
          }
        ),
      ]);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        "Request failed: " + error.message
      );
    }
  }

  hashData = (data: any) => {
    return argon2.hash(data);
  };

  async refreshToken(userId: string, refreshToken: string) {
    try {
      const user = await this.usersService.findById(userId);
      if (!user || !user.refreshToken)
        throw new ForbiddenException("Access Denied");
      const refreshTokenMatches = await argon2.verify(
        user.refreshToken,
        refreshToken
      );
      if (!refreshTokenMatches) throw new ForbiddenException("Access Denied");
      const tokens = await this.getTokens(user.id, user.email);
      await this.updateRefreshToken(user.id, tokens.refreshToken);
      return tokens;
    } catch (error) {
      throw new InternalServerErrorException(
        "Request failed: " + error.message
      );
    }
  }
}
