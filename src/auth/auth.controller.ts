// auth/auth.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

class RegistroDto { nombre: string; email: string; password: string; }
class LoginDto    { email: string; password: string; }

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('registro')
  registro(@Body() dto: RegistroDto) {
    return this.authService.registro(dto.nombre, dto.email, dto.password);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
