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
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await comparePassword(password, String(user.password));
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ username: user.username }, JWT_PASSWORD, { expiresIn: "1h" });
    res.json({ message: "Login successful",token });
});



app.listen(3000);