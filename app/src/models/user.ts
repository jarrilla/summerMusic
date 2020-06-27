/**
 * models/user.ts
 * Each org has one 'admin' user who should link their spotifyUserId
 */

import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  org: string;
  userName: string;
  password: string;
  spotifyUserId: string;
};

export const UserSchema: Schema = new Schema({
  org: { type: String, required: true, unique: true },
  userName: { type: String, required: true, default: 'admin' },
  password: { type: String, required: true },
  spotifyUserId: { type: String, required: true, unique: true }
});

export default model<IUser>('user', UserSchema);