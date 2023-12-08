import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [UserModule, ChatModule, PrismaModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
