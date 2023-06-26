"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const serve_static_1 = __importDefault(require("serve-static"));
const config_1 = __importDefault(require("./config"));
//Routers
const loginRoute_1 = __importDefault(require("./Routers/loginRoute"));
const adminRoute_1 = __importDefault(require("./Routers/adminRoute"));
const resetPasswordRoute_1 = __importDefault(require("./Routers/resetPasswordRoute"));
dotenv_1.default.config();
const port = process.env.PORT;
const app = (0, express_1.default)();
// parse application/json
app.use(body_parser_1.default.json());
//Use Cookie-parser
app.use((0, cookie_parser_1.default)());
//Setup CORS
app.use(config_1.default.allowCORS ? config_1.default.allowCORS == "*" ? (0, cors_1.default)() : (0, cors_1.default)({ origin: config_1.default.allowCORS }) : (req, res, next) => next());
app.use((0, serve_static_1.default)(path_1.default.join(__dirname, '../Public')));
app.get("/", (req, res) => {
    res.send("Public Page");
});
app.use("/login", loginRoute_1.default);
app.use("/admin", adminRoute_1.default);
app.use("/reset-password", resetPasswordRoute_1.default);
app.listen(port, () => console.log(`Server is Up and running at port: ${port}`));
