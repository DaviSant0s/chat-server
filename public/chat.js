// Toda vez que o arquivo do chat for carregado vai ser gerado um novo socket
const socket = io();

// pegando o nome do usuário e sala da url
const urlSearch = new URLSearchParams(window.location.search);
const username = urlSearch.get('username');
const room = urlSearch.get('select_room');

// emit => para emitir alguma informação
// on => para ficar escutando alguma informação
// Posso usar os dois no servidor ou no frontend

// enviando as informações para o servidor
// preciso passar o nome do evento que vou emitir (podemos criar quantos eventos quisermos)

const usernameDiv = document.getElementById('username');
usernameDiv.innerHTML = `Olá ${username} - ${room}`;

socket.emit('select_room', {
  username,
  room,
}, response => {
  response.forEach(message => {
    createMessage(message);
  });
});

document.getElementById('message_input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const message = e.target.value;

    socket.emit('message', {
      room,
      message,
      username,
    });

    e.target.value = '';
  }
});

socket.on('message', (data) => {
  createMessage(data);
});

function createMessage(data) {
  const messageDiv = document.getElementById('chat_content');

  messageDiv.innerHTML += `
    <div class="messages" id="messages">
      <strong>${data.username}:</strong> <span>${data.text} - ${dayjs(data.createdAt).format('DD/MM HH:mm')}</span>
    </div>
  `;
};

document.getElementById("logout").addEventListener('click', e => {
  window.location.href = 'index.html';
})