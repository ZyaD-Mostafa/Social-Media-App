"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = void 0;
const generateOTP = () => {
    return String(Math.floor(100000 + Math.random() * 900000));
};
exports.generateOTP = generateOTP;
