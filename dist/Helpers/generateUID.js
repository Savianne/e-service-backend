"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUID = exports.generateResidentssUID = void 0;
const nanoid_1 = require("nanoid");
const nanoid_dictionary_1 = require("nanoid-dictionary");
function generateResidentssUID() {
    const generate8UniqueNumbers = (0, nanoid_1.customAlphabet)(nanoid_dictionary_1.numbers, 8);
    const uniqueId = `SC${generate8UniqueNumbers()}`;
    return uniqueId;
}
exports.generateResidentssUID = generateResidentssUID;
function generateUID() {
    return (0, nanoid_1.nanoid)(15);
}
exports.generateUID = generateUID;
