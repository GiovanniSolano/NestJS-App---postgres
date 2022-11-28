import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}
  
  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;

    try {

      payload = this.jwtService.verify( token );
      await this.messagesWsService.registerClient( client, payload.id );  

    } catch (error) {

      client.disconnect();
      return;
      
    }    

    // console.log({payload});
    

    // console.log('Cliente conectado:', client.id);
    
    // client.join('sala');
    // client.join(client.id);
    // client.join(user.email);
    
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
    
  }
  
  handleDisconnect(client: Socket) {    

    // console.log('Cliente desconectado:', client.id);
    this.messagesWsService.removeClient( client.id );
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());

  }

  @SubscribeMessage('message-from-client')
  onMessageFromClient( client: Socket, payload: NewMessageDto ) {

    // Emite unicamente al cliente.
    // client.emit('message-from-client', {
    //   fullName: 'Soy yo',
    //   message: payload.message || 'no-message'
    // });

    // Emitir a todos menos al cliente inicial
    // client.broadcast.emit('message-from-client', {
    //   fullName: 'Soy yo',
    //   message: payload.message || 'no-message'
    // });

    // this.wss.to('clientID');

    this.wss.emit('message-from-server', {
        fullName: this.messagesWsService.getUserFullName(client.id),
        message: payload.message || 'no-message'
    });

  }

}
