import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';

import cors from 'cors';

const app = express();

app.use(
  cors({
    origin: ['http://localhost:5173', 'https://chat-web-eta-three.vercel.app/'],
    methods: ['GET', 'POST'],
  })
);

const serverHttp = http.createServer(app);

const port = 3000;

const io = new Server(serverHttp, {
  cors: {
    origin: ['http://localhost:5173', 'https://chat-web-eta-three.vercel.app/'],
    methods: ['GET', 'POST'],
  },
});

export { serverHttp, io, port };
