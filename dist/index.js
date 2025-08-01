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
app.use(middleware_1.userMiddleware);
app.post("/api/v1/content", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.ContentModel.create({
            title: req.body.title,
            link: req.body.link,
            tags: [],
            type: req.body.type,
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
app.get("/api/v1/content", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userContent = yield db_1.ContentModel.find({ userId: req.body.userId }).populate("userId username");
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
app.delete("/api/v1/content", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.ContentModel.deleteOne({ _id: req.body.contentId, userId: req.body.userId });
        res.status(200).json({
            message: "Content Deleted",
        });
    }
    catch (error) {
        res.status(400).json({
            message: "Something went wrong"
        });
    }
}));
app.listen(3000);
