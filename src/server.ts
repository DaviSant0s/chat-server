import { serverHttp, io, port } from './http';
import './websocket';

// Como reaproveitamos o servidor do express ele vai funcionar da mesma forma que o app
serverHttp.listen(port, () => {
  console.log(`Server is running on PORT ${port}`);
  console.log(`http://localhost:${port}/`)
});
