"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareHash = void 0;
exports.generateHash = generateHash;
const bcrypt_1 = __importDefault(require("bcrypt"));
async function generateHash(plaintext, saltRound = Number(process.env.SALT)) {
    return await bcrypt_1.default.hash(plaintext, saltRound);
}
const compareHash = async ({ plainText, hash, }) => {
    return await bcrypt_1.default.compare(plainText, hash);
};
exports.compareHash = compareHash;
