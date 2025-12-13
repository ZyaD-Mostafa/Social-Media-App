"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connDB = async () => {
    try {
        const connetion = await mongoose_1.default.connect(process.env.DB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`mongoDb connected Successfully`);
    }
    catch (error) {
        console.log(`Error ${error.message}`);
    }
};
exports.default = connDB;
