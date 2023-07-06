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
import https from 'https';
import fs from 'fs';
import axios from 'axios';

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
    origin: ['http://localhost:3000', 'http://localhost:3005'], // Specify the allowed origin(s)
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

//SSL Certificate
const cert = fs.readFileSync('./SSL_cert/server.crt');
const key = fs.readFileSync('./SSL_Cert/server.key');

//Using express
const httpsapp = express();

httpsapp.use(cors());
httpsapp.use(bodyParser.json());

httpsapp.get('/get-semaphore-credit-bal', (req, res) => {
  const url = `https://api.semaphore.co/api/v4/account?apikey=${process.env.SEMAPHORE_APIKEY}`; // Set the target URL
  axios.get(url)
    .then(response => {
      // Handle the response from the external API
      res.json({success: true, data: response.data});
    })
    .catch(error => {
      // Handle any errors that occurred during the request
      console.error(error);
      res.status(500).send('Error occurred while making the request');
    });
})

httpsapp.post('/send-sms', (req, res) => {
  const smsData = req.body;

  axios.post(
    'https://api.semaphore.co/api/v4/messages',
    {
      apikey: process.env.SEMAPHORE_APIKEY,
      number: smsData.cpNumber,
      message: smsData.message
    }
  )
  .then(response => {
    // console.log(response)
    // console.log(response.data);
    res.json({success: true, data: response.data})
  })
  .catch(err => {
    console.log(err);
    res.sendStatus(500)
  })
})

httpsapp.post('/get-inbox', (req, res) => {
  axios.get(
    'https://api.semaphore.co/api/v4/messages',
    {
      params: {
        apikey: process.env.SEMAPHORE_APIKEY,
      },
    }
  ).then(response => {
    res.json({success: true, data: response.data})
  })
  .catch(err => {
    console.log(err);
    res.sendStatus(500)
  })
})

const server_w_ssl = https.createServer({key: key, cert: cert}, httpsapp);

server_w_ssl.listen(3002, () => console.log(`Server is Up and running at port: 3002`));

server.listen(3008, () => {
  console.log(`Server listening on port 3006`);
});

app.listen(port, () => console.log(`Server is Up and running at port: ${port}`));