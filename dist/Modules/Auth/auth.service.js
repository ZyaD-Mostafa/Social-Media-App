"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthService {
    constructor() { }
    signup = async (req, res, next) => {
        const { username, email, password } = req.body;
        console.log({ username, email, password });
        return res.status(201).json({
            message: "User created successfully",
        });
    };
    login = (req, res) => {
        const { email, password } = req.body;
        console.log({ email, password });
        res.status(200).json({
            message: "User logged in successfully",
        });
    };
}
exports.default = new AuthService();
