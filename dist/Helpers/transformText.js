"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function transformDateToText(givenDate) {
    const day = givenDate.getDate();
    const month = givenDate.toLocaleString('default', { month: 'long' });
    const year = givenDate.getFullYear();
    let dayText;
    if (day >= 11 && day <= 13) {
        dayText = `${day}th`;
    }
    else {
        switch (day % 10) {
            case 1:
                dayText = `${day}st`;
                break;
            case 2:
                dayText = `${day}nd`;
                break;
            case 3:
                dayText = `${day}rd`;
                break;
            default:
                dayText = `${day}th`;
                break;
        }
    }
    return `${dayText} day of ${month.toUpperCase()}, ${year}`;
}
exports.default = transformDateToText;
