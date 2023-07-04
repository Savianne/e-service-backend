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
        origin: 'http://localhost:3000',
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
server.listen(3008, () => {
    console.log(`Server listening on port 3006`);
});
app.listen(port, () => console.log(`Server is Up and running at port: ${port}`));
