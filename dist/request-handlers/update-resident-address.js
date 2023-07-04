"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateResidentAddressTransaction_1 = __importDefault(require("../mysql/updateResidentAddressTransaction"));
const handleUpdateResidentAddress = (req, res) => {
    const residentUID = req.body.residentUID;
    const recordUpdates = req.body.recordUpdates;
    // console.log(recordUpdates)
    (0, updateResidentAddressTransaction_1.default)(residentUID, recordUpdates)
        .then(response => {
        res.status(200).json({ success: true });
    })
        .catch(err => {
        console.log(err);
        res.status(500).json({ success: false });
    });
};
exports.default = handleUpdateResidentAddress;
