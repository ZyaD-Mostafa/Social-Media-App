import { DatabaseRepository } from "./database.repository";
import { Model } from "mongoose";
import { IFriendRequest } from "../models/friendsRequest.model";

export class FriendRepository extends DatabaseRepository<IFriendRequest> {
  constructor(protected override readonly model: Model<IFriendRequest>) {
    super(model);
  }
}
