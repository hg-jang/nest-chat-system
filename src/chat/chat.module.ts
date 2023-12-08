import { Module } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { ChatMessageService } from './chat-message.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';

@Module({
  providers: [ChatRoomService, ChatMessageService, ChatGateway],
  controllers: [ChatController],
})
export class ChatModule {}
