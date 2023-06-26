import express, { RequestHandler } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import path from 'path';
import serveStatic from 'serve-static';
import config from './config';

//Routers
import loginRoute from './Routers/loginRoute';
import adminRoute from './Routers/adminRoute';
import resetPasswordRoute from './Routers/resetPasswordRoute';

dotenv.config();

const port = process.env.PORT;

const app = express();


// parse application/json
app.use(bodyParser.json());

//Use Cookie-parser
app.use(cookieParser())

//Setup CORS
app.use(config.allowCORS? config.allowCORS == "*"? cors() : cors({origin: config.allowCORS}) : (req, res, next) => next());

app.use(serveStatic(path.join(__dirname, '../Public')));

app.get("/", (req, res) => {
  res.send("Public Page");
});

app.use("/login", loginRoute);
app.use("/admin", adminRoute);
app.use("/reset-password", resetPasswordRoute)

app.listen(port, () => console.log(`Server is Up and running at port: ${port}`));