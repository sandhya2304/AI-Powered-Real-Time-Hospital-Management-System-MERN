import dotenv from "dotenv";
import express ,{
    type Application,
    type Request,
    type Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { connectDB } from "./config/db";


dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin : process.env.FRONTEND_URL || "http://localhost:5173/",
}))

app.use(helmet({
    crossOriginResourcePolicy : {
         policy : "cross-origin"
        },
}))

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message : "Server is running successfully",
    });
});

app.use((err: Error, req: Request, res: Response, next: Function) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode)
    res.json({
        message : "Internal Server Error",
        error : err.message,
        stack:process.env.NODE_ENV === "production" ? null :err.stack     });
});

connectDB().then(() => {
    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
})

