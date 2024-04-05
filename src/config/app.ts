import { registerAs } from '@nestjs/config';
export default registerAs('app', () => ({
  url: process.env.APP_URL || 'localhost:5000',
  env: process.env.APP_ENV || 'local',
  jwtsecret: process.env.JWT_ACCESS_SECRET,
}));
