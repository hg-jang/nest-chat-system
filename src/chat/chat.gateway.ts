import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { JoinChatRoomDto } from './dto/join-chat-room.dto';
import { ChatRoomService } from './chat-room.service';
import { ChatMessageService } from './chat-message.service';

@WebSocketGateway(8061, {
  namespace: 'chat',
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  connectedClients: { [socketId: string]: boolean } = {};

  // { clientSocketId: userId }
  clientUserId: { [socketId: string]: string } = {};

  chatRoomUsers: { [roomId: string]: string[] } = {};

  constructor(
    private readonly chatRoomService: ChatRoomService,
    private readonly chatMessageService: ChatMessageService,
  ) {}

  handleConnection(client: Socket): void {
    console.log('connected');
    if (this.connectedClients[client.id]) {
      client.disconnect(true);
      return;
    }

    this.connectedClients[client.id] = true;
  }

  handleDisconnect(client: Socket): void {
    console.log('disconnected');
    delete this.connectedClients[client.id];

    // 클라이언트가 속한 모든 방에서 유저를 제거
    Object.keys(this.chatRoomUsers).forEach((roomId) => {
      const index = this.chatRoomUsers[roomId]?.indexOf(
        this.clientUserId[client.id],
      );
      if (index !== -1) {
        this.chatRoomUsers[roomId].splice(index, 1);
        this.server.to(roomId).emit('userLeft', {
          userId: this.clientUserId[client.id],
          room: roomId,
        });
        this.server.to(roomId).emit('userList', {
          room: roomId,
          userList: this.chatRoomUsers[roomId],
        });
      }
    });

    // 모든 방의 유저 목록을 업데이트하여 emit
    Object.keys(this.chatRoomUsers).forEach((roomId) => {
      this.server.to(roomId).emit('user-list', {
        room: roomId,
        userList: this.chatRoomUsers[roomId],
      });
    });

    // 연결된 클라이언트 목록을 업데이트하여 emit
    this.server.emit('user-list', {
      room: null,
      userList: Object.keys(this.connectedClients),
    });
  }

  @SubscribeMessage('join-room')
  joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinChatRoomDto,
  ) {
    console.log('user joined', data);
    if (client.rooms.has(data.roomId)) {
      return;
    }

    client.join(data.roomId);
    this.clientUserId[client.id] = data.userId;

    if (!this.chatRoomUsers[data.roomId]) {
      this.chatRoomUsers[data.roomId] = [];
    }

    this.chatRoomUsers[data.roomId].push(this.clientUserId[client.id]);
    this.server.to(data.roomId).emit('userJoined', {
      userId: this.clientUserId[client.id],
      room: data.roomId,
    });
    this.server.to(data.roomId).emit('user-list', {
      room: data.roomId,
      userList: this.chatRoomUsers[data.roomId],
    });

    this.server.emit('user-list', {
      room: null,
      userList: Object.keys(this.connectedClients),
    });

    // notice new user joined
    client.broadcast.emit('new-user', {
      userId: Number(this.clientUserId[client.id]),
    });
  }

  @SubscribeMessage('leave-room')
  leaveRoom(@ConnectedSocket() client: Socket, roomId: string) {
    if (!client.rooms.has(roomId)) {
      return;
    }
    client.leave(roomId);

    const index = this.chatRoomUsers[roomId]?.indexOf(
      this.clientUserId[client.id],
    );
    if (index !== -1) {
      this.chatRoomUsers[roomId].splice(index, 1);
      this.server.to(roomId).emit('userLeft', {
        userId: this.clientUserId[client.id],
        room: roomId,
      });
      this.server.to(roomId).emit('user-list', {
        room: roomId,
        userList: this.chatRoomUsers[roomId],
      });
    }

    // 모든 방의 유저 목록을 업데이트하여 emit
    Object.keys(this.chatRoomUsers).forEach((roomId) => {
      this.server.to(roomId).emit('user-list', {
        room: roomId,
        userList: this.chatRoomUsers[roomId],
      });
    });

    // TODO: 클라이언트 id를 보낼 필요가 있는지 확인
    // 연결된 클라이언트 목록을 업데이트하여 emit
    this.server.emit('user-list', {
      room: null,
      userList: Object.keys(this.connectedClients),
    });
  }

  @SubscribeMessage('chat-message')
  async sendPersonalMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateChatMessageDto,
  ) {
    console.log('receive chat-message', data);

    // const chatMessage = await this.chatMessageService.createChatMessage({
    //   text: data.message,
    //   fromUser: {
    //     connect: {
    //       id: data.fromUserId as unknown as number,
    //     },
    //   },
    //   toRoom: {
    //     connect: {
    //       id: data.roomId as unknown as number,
    //     },
    //   },
    // });

    this.server.to(data.roomId).emit('chat-message', {
      fromUserId: Number(this.clientUserId[client.id]),
      message: data.message,
    });
  }
}
