"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./db");
const config_1 = require("./config");
const middleware_1 = require("./middleware");
const encryptionAlgo_1 = require("./encryptionAlgo");
const cors_1 = __importDefault(require("cors"));
const utils_1 = require("./utils");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const password = (yield (0, encryptionAlgo_1.encryptPassword)(req.body.password)).toString();
    try {
        yield db_1.UserModel.create({
            username: username,
            password: password
        });
        res.json({
            message: "User signed up"
        });
    }
    catch (e) {
        res.status(411).json({
            message: "User already exists"
        });
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const user = yield db_1.UserModel.findOne({ username });
    if (!user) {
        return res.status(401).json({
            message: "Invalid credentials"
        });
    }
    const isMatch = yield (0, encryptionAlgo_1.comparePassword)(password, String(user.password));
    if (!isMatch) {
        return res.status(401).json({
            message: "Invalid credentials"
        });
    }
    const token = jsonwebtoken_1.default.sign({ username: user.username, id: user._id }, config_1.JWT_PASSWORD, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
}));
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hash = req.params.shareLink;
        const link = yield db_1.LinkModel.findOne({
            hash
        }).populate("user");
        if (!link) {
            res.status(411).json({
                message: "Incorrect link"
            });
            return;
        }
        const content = yield db_1.ContentModel.find({
            userId: link.userId
        });
        const user = yield db_1.UserModel.findOne({
            _id: link.userId
        });
        if (!user) {
            res.status(411).json({
                message: "Incorrect link"
            });
            return;
        }
        res.status(200).json({
            content: content,
            userName: user.username
        });
    }
    catch (error) {
        res.status(411).json({
            message: "Something went wrong"
        });
    }
}));
app.post("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.ContentModel.create({
            title: req.body.title,
            link: req.body.link,
            type: req.body.type,
            tags: req.body.tags,
            userId: req.body.userId
        });
        res.status(200).json({
            message: "Content added successfully"
        });
    }
    catch (error) {
        res.status(400).json({
            message: "Something went wrong"
        });
    }
}));
app.get("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userContent = yield db_1.ContentModel.find({ userId: req.body.userId });
        res.status(200).json({
            message: "user Contents",
            contents: userContent
        });
    }
    catch (error) {
        res.status(400).json({
            message: "Something went wrong"
        });
    }
}));
app.delete("/api/v1/content/:contentId", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.ContentModel.deleteOne({ _id: req.params.contentId, userId: req.body.userId });
        res.status(200).json({
            message: "Content Deleted",
        });
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Something went wrong"
        });
    }
}));
app.post("/api/v1/brain/share", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const share = req.body.share;
        if (share) {
            const existingLink = yield db_1.LinkModel.findOne({
                userId: req.body.userId
            });
            if (existingLink) {
                res.status(200).json({
                    message: "Link generated",
                    hash: existingLink.hash
                });
            }
            const hash = (0, utils_1.randomHash)(15);
            yield db_1.LinkModel.create({
                hash: hash,
                userId: req.body.userId,
            });
            res.status(200).json({
                message: "Link generated",
                hash: hash
            });
        }
        else {
            yield db_1.LinkModel.deleteOne({
                userId: req.body.userId
            });
            res.status(200).json({
                message: "Link removed",
            });
        }
    }
    catch (error) {
    }
}));
app.listen(3000);
