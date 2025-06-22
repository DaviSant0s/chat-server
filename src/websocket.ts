import { io } from './http';

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
const rooms: Set<string> = new Set();

io.on('connection', (socket) => {
  // vai ficar escutando o evento gerado pelo cliente
  socket.on('select_room', (data, callback) => {

    console.log(`[Servidor] ${data.username} entrou na sala ${data.room}`);

    socket.join(data.room);

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

    // Adiciona a sala na lista (mesmo que ela já exista)
    rooms.add(data.room);

    io.emit('rooms_updated');

    const messagesRoom = getMessagesRoom(data.room);
    callback(messagesRoom);
  });

  socket.on('message', (data) => {
    // Salvar as mensagens
    const message: Message = {
      room: data.room,
      username: data.username,
      text: data.message,
      createdAt: new Date(),
    };

    messages.push(message);

    // Enviar para usuários da sala
    io.to(data.room).emit('message', message);
  });

  socket.on('get_rooms', (callback) => {
    callback(Array.from(rooms));
  });
});

function getMessagesRoom(room: string) {
  const messagesRoom = messages.filter((message) => message.room === room);
  return messagesRoom;
}
