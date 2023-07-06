"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const serve_static_1 = __importDefault(require("serve-static"));
const config_1 = __importDefault(require("./config"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
//Routers
const loginRoute_1 = __importDefault(require("./Routers/loginRoute"));
const adminRoute_1 = __importDefault(require("./Routers/adminRoute"));
const resetPasswordRoute_1 = __importDefault(require("./Routers/resetPasswordRoute"));
const utilRoute_1 = __importDefault(require("./Routers/utilRoute"));
const residentRoute_1 = __importDefault(require("./Routers/residentRoute"));
//handler
const get_sk_terms_handler_1 = __importDefault(require("./request-handlers/get-sk-terms-handler"));
const get_terms_1 = __importDefault(require("./request-handlers/get-terms"));
dotenv_1.default.config();
const port = process.env.PORT;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:3005'],
        methods: ['GET', 'POST'] // Specify the allowed HTTP methods
    }
});
// parse application/json
app.use(body_parser_1.default.json());
//Use Cookie-parser
app.use((0, cookie_parser_1.default)());
//Setup CORS
app.use(config_1.default.allowCORS ? config_1.default.allowCORS == "*" ? (0, cors_1.default)() : (0, cors_1.default)({ origin: config_1.default.allowCORS }) : (req, res, next) => next());
app.use((0, serve_static_1.default)(path_1.default.join(__dirname, '../Public')));
app.get("/", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../Views/public-view.html'));
});
app.use("/login", loginRoute_1.default);
app.use("/admin", adminRoute_1.default);
app.use("/reset-password", resetPasswordRoute_1.default);
app.use("/utils", utilRoute_1.default);
app.use("/resident", residentRoute_1.default);
app.post('/sk-officials', get_sk_terms_handler_1.default);
app.post('/barangay-officials', get_terms_1.default);
exports.io.on('connection', (socket) => {
    console.log('A user connected.');
    socket.on('disconnect', () => {
        console.log('A user disconnected.');
    });
    socket.on('chat message', (message) => {
        console.log('Received message:', message);
        // Handle the message and emit it back to clients if needed
    });
});
//SSL Certificate
const cert = fs_1.default.readFileSync('./SSL_cert/server.crt');
const key = fs_1.default.readFileSync('./SSL_Cert/server.key');
//Using express
const httpsapp = (0, express_1.default)();
httpsapp.use((0, cors_1.default)());
httpsapp.use(body_parser_1.default.json());
httpsapp.get('/get-semaphore-credit-bal', (req, res) => {
    const url = `https://api.semaphore.co/api/v4/account?apikey=${process.env.SEMAPHORE_APIKEY}`; // Set the target URL
    axios_1.default.get(url)
        .then(response => {
        // Handle the response from the external API
        res.json({ success: true, data: response.data });
    })
        .catch(error => {
        // Handle any errors that occurred during the request
        console.error(error);
        res.status(500).send('Error occurred while making the request');
    });
});
httpsapp.post('/send-sms', (req, res) => {
    const smsData = req.body;
    axios_1.default.post('https://api.semaphore.co/api/v4/messages', {
        apikey: process.env.SEMAPHORE_APIKEY,
        number: smsData.cpNumber,
        message: smsData.message
    })
        .then(response => {
        // console.log(response)
        // console.log(response.data);
        res.json({ success: true, data: response.data });
    })
        .catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
});
httpsapp.post('/get-inbox', (req, res) => {
    axios_1.default.get('https://api.semaphore.co/api/v4/messages', {
        params: {
            apikey: process.env.SEMAPHORE_APIKEY,
        },
    }).then(response => {
        res.json({ success: true, data: response.data });
    })
        .catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
});
const server_w_ssl = https_1.default.createServer({ key: key, cert: cert }, httpsapp);
server_w_ssl.listen(3002, () => console.log(`Server is Up and running at port: 3002`));
server.listen(3008, () => {
    console.log(`Server listening on port 3006`);
});
app.listen(port, () => console.log(`Server is Up and running at port: ${port}`));
