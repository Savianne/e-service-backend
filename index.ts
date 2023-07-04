import express, { RequestHandler } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import path from 'path';
import serveStatic from 'serve-static';
import config from './config';
import { Server, Socket } from 'socket.io';
import http from 'http';

//Routers
import loginRoute from './Routers/loginRoute';
import adminRoute from './Routers/adminRoute';
import resetPasswordRoute from './Routers/resetPasswordRoute';
import utilityRoute from './Routers/utilRoute';
import residentRoute from './Routers/residentRoute';

//handler
import handleGetSKTerms from './request-handlers/get-sk-terms-handler';
import handleGetTerms from './request-handlers/get-terms';

dotenv.config();

const port = process.env.PORT;

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Specify the allowed origin(s)
    methods: ['GET', 'POST'] // Specify the allowed HTTP methods
  }
});

// parse application/json
app.use(bodyParser.json());

//Use Cookie-parser
app.use(cookieParser())

//Setup CORS
app.use(config.allowCORS? config.allowCORS == "*"? cors() : cors({origin: config.allowCORS}) : (req, res, next) => next());

app.use(serveStatic(path.join(__dirname, '../Public')));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../Views/public-view.html'));
});

app.use("/login", loginRoute);
app.use("/admin", adminRoute);
app.use("/reset-password", resetPasswordRoute);
app.use("/utils", utilityRoute);
app.use("/resident", residentRoute);

app.post('/sk-officials', handleGetSKTerms);
app.post('/barangay-officials', handleGetTerms);

io.on('connection', (socket: Socket) => {
  console.log('A user connected.');

  socket.on('disconnect', () => {
    console.log('A user disconnected.');
  });

  socket.on('chat message', (message: string) => {
    console.log('Received message:', message);
    // Handle the message and emit it back to clients if needed
  });
});

server.listen(3008, () => {
  console.log(`Server listening on port 3006`);
});

app.listen(port, () => console.log(`Server is Up and running at port: ${port}`));