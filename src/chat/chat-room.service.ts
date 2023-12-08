import { Injectable } from '@nestjs/common';
import { ChatRoom, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatRoomService {
  constructor(private prisma: PrismaService) {}

  async joinChatRoom(roomId: number, userId: number) {
    return this.updateChatRoom({
      where: { id: roomId },
      data: {
        users: {
          create: {
            userId,
          },
        },
      },
    });
  }

  async chatRoom(
    chatRoomWhereUniqueInput: Prisma.ChatRoomWhereUniqueInput,
  ): Promise<ChatRoom | null> {
    return this.prisma.chatRoom.findUnique({
      where: chatRoomWhereUniqueInput,
    });
  }

  async chatRooms(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ChatRoomWhereUniqueInput;
    where?: Prisma.ChatRoomWhereInput;
    orderBy?: Prisma.ChatRoomOrderByWithRelationInput;
  }): Promise<ChatRoom[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.chatRoom.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createChatRoom(data: Prisma.ChatRoomCreateInput): Promise<ChatRoom> {
    return this.prisma.chatRoom.create({
      data,
    });
  }

  async updateChatRoom(params: {
    where: Prisma.ChatRoomWhereUniqueInput;
    data: Prisma.ChatRoomUpdateInput;
  }): Promise<ChatRoom> {
    const { where, data } = params;
    return this.prisma.chatRoom.update({
      data,
      where,
    });
  }

  async deleteChatRoom(
    where: Prisma.ChatRoomWhereUniqueInput,
  ): Promise<ChatRoom> {
    return this.prisma.chatRoom.delete({
      where,
    });
  }
}
