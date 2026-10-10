import express from "express";

const userRouter = express.Router();

import { requireAuth } from "../middleware/auth";
import { getUserById } from "../controllers/user";
import { addActivityLog, getActivityLogs } from "../controllers/activity";
import { checkRole } from "../middleware/checkRole";


userRouter.get("/", requireAuth, checkRole(["admin"]),getActivityLogs);

userRouter.post(
    "/create",
     requireAuth,
     addActivityLog);



export default userRouter;