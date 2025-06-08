import { io } from './http';

// Isso vai gerar uma conexão entre o cliente e servidor quando o cliente for se conectar com a aplicação
// O socket vai ser a representação do cliente dentro do servidor
// Toda vez que um cliente se conecta com a nossa aplicação, é gerada um socket pra ele

// Quando queremos fazer algo mais relacionado ao cliente utilizamos o 'socket' ao invés do 'io'
// O socket é algo único, algo direcionado pelo cliente.
// Quando eu quiser fazer algo para a aplicação toda eu utilizo o 'io'

interface RoomUser {
  socket_id: string;
  username: string;
  room: string;
}

interface Message {
  room: string;
  text: string;
  createdAt: Date;
  username: string;
}

const users: RoomUser[] = [];
const messages: Message[] = [];

io.on('connection', (socket) => {
  // vai ficar escutando o evento gerado pelo cliente
  socket.on('select_room', (data, callback) => {
    // Adiciona o socket (cliente) à sala especificada, permitindo que ele receba mensagens enviadas apenas para essa sala
    socket.join(data.room);

    console.log(users)

    // verificar se o usuário já está na sala
    const userInRoom = users.find(
      (user) => user.username === data.username && user.room === data.room
    );

    // alterando para o novo socket_id se já for existente
    if (userInRoom) {
      userInRoom.socket_id = socket.id;
    } else {
      users.push({
        room: data.room,
        username: data.username,
        socket_id: socket.id,
      });
    }

    // verifica se a sala é nova
    const roomAlreadyExisted =
      io.sockets.adapter.rooms.has(data.room) &&
      Array.from(io.sockets.adapter.rooms.get(data.room)!).length === 1;

    if (roomAlreadyExisted) {
      io.emit('rooms_updated');
    }

    const messagesRoom = getMessagesRoom(data.room);
    callback(messagesRoom);
  });

  // Retorna todas as mensagens para o front
  socket.on('get_messages', (callback) => {
    callback(messages)
  })

  socket.on('message', (data) => {
    // Salvar as mensagens
    const message: Message = {
      room: data.room,
      username: data.username,
      text: data.message,
      createdAt: new Date(),
    };

    messages.push(message);

    // atualiza as mensagens no front
    io.emit('messages_updated');

    // Enviar para usuários da sala
    io.to(data.room).emit('message', message);
  });

  socket.on('get_rooms', (callback) => {
    const rooms = Array.from(io.sockets.adapter.rooms.entries())
      .filter(([roomName]) => !io.sockets.sockets.has(roomName)) // Remove salas privadas (que são sockets)
      .map(([roomName]) => roomName); // Pega só o nome da sala

    callback(rooms);
  });
});

function getMessagesRoom(room: string) {
  const messagesRoom = messages.filter((message) => message.room === room);
  return messagesRoom;
}
