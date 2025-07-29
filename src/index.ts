import express from "express";
import jwt from "jsonwebtoken";
import { ContentModel, LinkModel, UserModel } from "./db";
import { JWT_PASSWORD } from "./config";
import { userMiddleware } from "./middleware";
import { encryptPassword ,comparePassword} from "./encryptionAlgo";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/v1/signup", async (req, res) => {
    const username = req.body.username;
    const password = (await encryptPassword(req.body.password)).toString();

    try {
        await UserModel.create({
            username: username,
            password: password
        }) 

        res.json({
            message: "User signed up"
        })
    } catch(e) {
        res.status(411).json({
            message: "User already exists"
        })
    }
})

app.post("/api/v1/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username });
    if (!user) {
        return res.status(401).json(
        { 
            message: "Invalid credentials" 
        });
    }
    const isMatch = await comparePassword(password, String(user.password));
    if (!isMatch) {
        return res.status(401).json(
        { 
            message: "Invalid credentials"
        });
    }
    const token = jwt.sign({ username: user.username ,id:user._id}, JWT_PASSWORD, { expiresIn: "1h" });
    res.json({ message: "Login successful",token });
});

app.use(userMiddleware);

app.post("/api/v1/content" ,async (req,res)=>{
    try {
        await ContentModel.create({
            title : req.body.title,
            link : req.body.link,
            tags:[],
            type:req.body.type,
            userId : req.body.userId
        })

        res.status(200).json({
            message : "Content added successfully"
        })
    } catch (error) {
        res.status(400).json({
            message : "Something went wrong"
        })
    }
});

app.get("/api/v1/content",async (req,res)=>{
    try {
        const userContent =await ContentModel.find({userId:req.body.userId}).populate("userId username") ;
        res.status(200).json({
            message: "user Contents",
            contents : userContent
        })
    } catch (error) {
        res.status(400).json({
            message: "Something went wrong"
        })
    }
});

app.delete("/api/v1/content",async (req,res)=>{
    try {
        await ContentModel.deleteOne({_id:req.body.contentId,userId : req.body.userId});
        res.status(200).json({
            message: "Content Deleted",
        })
    } catch (error) {
        res.status(400).json({
            message: "Something went wrong"
        })
    }
});

app.listen(3000);