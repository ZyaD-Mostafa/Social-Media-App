"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRepository = void 0;
const database_repository_1 = require("./database.repository");
class FriendRepository extends database_repository_1.DatabaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
}
exports.FriendRepository = FriendRepository;
