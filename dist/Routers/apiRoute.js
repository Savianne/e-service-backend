"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
//Handlers 
const add_resident_handler_1 = __importDefault(require("../request-handlers/add-resident-handler"));
const get_residents_record_handler_1 = __importDefault(require("../request-handlers/get-residents-record-handler"));
//Custom Middleware
const verifyUserRequest_1 = __importDefault(require("../CustomMiddleware/verifyUserRequest"));
const apiRoute = express_1.default.Router();
apiRoute.use(verifyUserRequest_1.default);
apiRoute.post('/add-resident-record', add_resident_handler_1.default);
apiRoute.post('/get-residents-record', get_residents_record_handler_1.default);
exports.default = apiRoute;
