"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addSKTerm_1 = __importDefault(require("../mysql/addSKTerm"));
const handleAddSKTerm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const term = req.body;
    (0, addSKTerm_1.default)(term)
        .then(q => {
        res.status(200).json({ success: true });
    })
        .catch(err => {
        console.log(err);
        res.status(401).json({ success: false, error: err.error });
    });
});
exports.default = handleAddSKTerm;
