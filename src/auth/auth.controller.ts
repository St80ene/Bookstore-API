import { Controller, Get, Post, Body, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto/auth.dto";
import { Request } from "express";
import { AccessTokenGuard } from "src/auth/common/guards/accessToken.guards";
import { RefreshTokenGuard } from "src/auth/common/guards/refreshToken.guards";
import { CreateUserDto } from "src/users/dto/create-user.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Post("login")
  signin(@Body() data: AuthDto) {
    return this.authService.signIn(data);
  }

  @UseGuards(AccessTokenGuard)
  @Get("logout")
  logout(@Req() req: Request) {
    return this.authService.logout(req.user["sub"]);
  }

  @UseGuards(RefreshTokenGuard)
  @Get("refresh")
  refreshTokens(@Req() req: Request) {
    const userId = req.user["sub"];
    const refreshToken = req.user["refresh_token"];

    return this.authService.refreshToken(userId, refreshToken);
  }
}
