import { Injectable } from '@nestjs/common';
import { ChatMessage, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatMessageService {
  constructor(private prisma: PrismaService) {}

  async chatMessage(
    chatMessageWhereUniqueInput: Prisma.ChatMessageWhereUniqueInput,
  ): Promise<ChatMessage | null> {
    return this.prisma.chatMessage.findUnique({
      where: chatMessageWhereUniqueInput,
    });
  }

  async chatMessages(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ChatMessageWhereUniqueInput;
    where?: Prisma.ChatMessageWhereInput;
    orderBy?: Prisma.ChatMessageOrderByWithRelationInput;
  }): Promise<ChatMessage[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.chatMessage.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createChatMessage(
    data: Prisma.ChatMessageCreateInput,
  ): Promise<ChatMessage> {
    return this.prisma.chatMessage.create({
      data,
    });
  }

  async updateChatMessage(params: {
    where: Prisma.ChatMessageWhereUniqueInput;
    data: Prisma.ChatMessageUpdateInput;
  }): Promise<ChatMessage> {
    const { where, data } = params;
    return this.prisma.chatMessage.update({
      data,
      where,
    });
  }

  async deleteChatMessage(
    where: Prisma.ChatMessageWhereUniqueInput,
  ): Promise<ChatMessage> {
    return this.prisma.chatMessage.delete({
      where,
    });
  }
}
