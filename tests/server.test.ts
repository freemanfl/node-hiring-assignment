import { createServer, Server as HttpServer } from "http";
import { AddressInfo } from "net";
import ioClient, { Socket as ClientSocket } from "socket.io-client";
import { Server, Socket as ServerSocket } from "socket.io";

function waitFor(
  socket: ServerSocket | ClientSocket,
  event: string
): Promise<any> {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

describe("Socket.IO Server Tests", () => {
  let httpServer: HttpServer;
  let io: Server;
  let serverSocket: ServerSocket;
  let clientSocket: ClientSocket;

  beforeAll((done: jest.DoneCallback) => {
    httpServer = createServer();
    io = new Server(httpServer);

    // Mocking the server-side socket logic
    io.on("connection", (socket: ServerSocket) => {
      serverSocket = socket;

      socket.on(
        "joinRoom",
        ({ username, room }: { username: string; room: string }) => {
          // Mocking user joining logic
          socket.join(room);
          // Mocking welcome message
          socket.emit("message", `Welcome, ${username}!`);
          // Mocking broadcast of user joining
          socket.broadcast
            .to(room)
            .emit("message", `${username} has joined the chat`);
        }
      );

      socket.on("chatMessage", (msg: string) => {
        // Mocking chat message handling
        io.emit("message", msg); // Broadcasting to all clients
      });

      socket.on("disconnect", () => {
        // Mocking user leaving logic
        io.emit("message", "A user has left the chat");
      });
    });

    // Starting the server
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      clientSocket = ioClient(`http://localhost:${port}`);
      clientSocket.on("connect", done);
    });
  });

  afterAll(() => {
    // Closing the server and disconnecting the client socket
    io.close();
    clientSocket.disconnect();
  });

  test("should allow a user to join a chat room and receive welcome message", async () => {
    const username = "John";
    const room = "TestRoom";

    clientSocket.emit("joinRoom", { username, room });

    // Waiting for the 'message' event from serverSocket
    const message = await waitFor(serverSocket, "message");

    expect(message).toBe(`Welcome, ${username}!`);
  });

  test("should broadcast chat message to all users in the room", async () => {
    const message = "Hello, everyone!";
    clientSocket.emit("chatMessage", message);

    // Waiting for the 'message' event from clientSocket
    const receivedMessage = await waitFor(clientSocket, "message");

    expect(receivedMessage).toBe(message);
  });

  test("should notify when a user disconnects", async () => {
    // Simulating disconnect
    clientSocket.disconnect();

    // Waiting for the 'message' event from serverSocket
    const message = await waitFor(serverSocket, "message");

    expect(message).toBe("A user has left the chat");
  });
});
