import express from "express";

const userRouter = express.Router();

import { fetchAllUsers, getUserById, updateUser } from "../controllers/user";
import { requireAuth } from "../middleware/auth";
import { checkRole } from "../middleware/checkRole";

userRouter.get("/:id", requireAuth, getUserById);
userRouter.put("/update/:id", requireAuth,checkRole(["admin","doctor","nurse"]), updateUser);
userRouter.get("/",requireAuth,checkRole(["admin","doctor","nurse"]),fetchAllUsers);




export default userRouter;