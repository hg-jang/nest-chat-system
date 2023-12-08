import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { ChatRoomService } from './chat-room.service';
import { Response } from 'express';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @Get('/rooms')
  async getChatRooms(@Query('u') userId: string, @Res() res: Response) {
    try {
      const rooms = await this.chatRoomService.chatRooms({
        where: {
          users: {
            none: {
              userId: Number(userId),
            },
          },
        },
      });
      if (rooms.length === 0) {
        return res.status(HttpStatus.NOT_FOUND).json({ success: false });
      }
      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          rooms: rooms,
        },
      });
    } catch (err) {
      console.log(err);
      res.status(HttpStatus.BAD_REQUEST).json({ success: false });
    }
  }

  @Get('/rooms/my')
  async getMyChatRooms(@Query('u') userId: string, @Res() res: Response) {
    try {
      const rooms = await this.chatRoomService.chatRooms({
        where: {
          users: {
            some: {
              userId: Number(userId),
            },
          },
        },
      });
      if (rooms.length === 0) {
        return res.status(HttpStatus.NOT_FOUND).json({ success: false });
      }
      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          rooms: rooms,
        },
      });
    } catch (err) {
      console.log(err);
      res.status(HttpStatus.BAD_REQUEST).json({ success: false });
    }
  }

  @Get('/room/:id')
  getChatRoom() {}

  @Post('/room')
  async createChatRoom(
    @Body() params: CreateChatRoomDto,
    @Res() res: Response,
  ) {
    try {
      const room = await this.chatRoomService.createChatRoom({
        name: params.name,
        users: {
          create: params.userIds.map((userId) => ({ userId })),
        },
      });
      if (!room) {
        return res.status(HttpStatus.NOT_FOUND).json({ success: false });
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          roomId: room.id,
        },
      });
    } catch (err) {
      console.log(err);
      res.status(HttpStatus.BAD_REQUEST).json({ success: false });
    }
  }

  @Post('/room/:id')
  joinChatRoom() {}

  @Delete('/room/:id')
  leaveChatRoom() {}
}
