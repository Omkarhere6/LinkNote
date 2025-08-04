
import mongoose, {model, Schema} from "mongoose";
import { ListFormat } from "typescript";

mongoose.connect("")

const UserSchema = new Schema({
    username: {type: String, unique: true},
    password: {type:String}
})

const ContentSchema = new Schema({
    title: {type:String},
    link:{type: String},
    tags: [{type: String}],
    type: {type:String},
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true },
})

const LinkSchema = new Schema({
    hash: String,
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true, unique: true },
})

export const LinkModel = model("Links", LinkSchema);
export const ContentModel = model("Content", ContentSchema);
export const UserModel = model("User", UserSchema);
