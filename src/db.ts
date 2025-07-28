
import mongoose, {model, Schema} from "mongoose";

mongoose.connect("mongodb+srv://admin:rb6VubAY0XyU3EhR@personalprojects.61kr10x.mongodb.net/NoteLink")

const UserSchema = new Schema({
    username: {type: String, unique: true},
    password: {type:String}
})

const ContentSchema = new Schema({
    title: String,
    link: String,
    tags: [{type: mongoose.Types.ObjectId, ref: 'Tag'}],
    type: String,
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true },
})

const LinkSchema = new Schema({
    hash: String,
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true, unique: true },
})

export const LinkModel = model("Links", LinkSchema);
export const ContentModel = model("Content", ContentSchema);
export const UserModel = model("User", UserSchema);
