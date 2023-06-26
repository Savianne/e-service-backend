"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get5MinsExpirationDate = void 0;
function get5MinsExpirationDate() {
    const currentDate = new Date();
    const expirationDate = new Date(currentDate.getTime() + 5 * 60 * 1000); // Add 5 minutes in milliseconds
    return expirationDate;
}
exports.get5MinsExpirationDate = get5MinsExpirationDate;
