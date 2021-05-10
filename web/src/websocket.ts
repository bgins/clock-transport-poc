export class WebSocketConnection {
  websocket: WebSocket;
  isAlive: boolean = false;
  messageHandler: (notes: Notes) => void;

  constructor(messageHandler) {
    this.websocket = new WebSocket('wss://echo.websocket.org');
    this.messageHandler = messageHandler;

    this.websocket.onopen = () => {
      this.isAlive = true;

      this.websocket.onmessage = event => {
        const data = JSON.parse(event.data);
        this.messageHandler(data);
      }

      this.websocket.onerror = (error: any) => console.log(error.message);

      this.websocket.onclose = event => {
        if (event.wasClean) {
          console.log('connection closed cleanly');
        } else {
          console.log('connection died');
        }
      }
    }
  }

  send(notes: Notes) {
    if (this.isAlive) {
      this.websocket.send(JSON.stringify(notes));
    } else {
      console.log('websocket connection is not open')
    }
  }
}
