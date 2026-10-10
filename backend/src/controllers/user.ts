import mongoose from "mongoose";
import type { Request, Response } from "express";
import { logActivity } from "../lib/activity";


export const getUserById = async (req: Request, res: Response) => {
   try
   {
    const { id } = req.params;
    const currentUser = (req as any).user;

    if (currentUser.id !== id && currentUser.role === "patient")
    {
        return res.status(403).json({ message: "Forbidden" });
    }

    const queryId = id?.length === 24 ? new mongoose.Types.ObjectId(id as string) : id;
    const collection = mongoose.connection.collection("user");
    const user = await collection.findOne({ _id: queryId as mongoose.Types.ObjectId },
                    { projection: { password: 0 }});
    if(!user){
        return res.status(404).json({ message: "User not found" });
    }
   res.json(user);
   }catch(error)
   {
      console.error("Error fetching user by ID:", error);
      res.status(500).json({ message: "Internal server error" });
   }

}


//2 update user
//only admin and medical statff uodate patient profile,
//patient can uodate teir own profile
export const updateUser = async (req:Request,res:Response) =>{
     try
     {

    
        const {id} = req.params;
        const {name,email,role,password, ...customFields} = req.body;
         
        const queryId = id?.length === 24 ? new mongoose.Types.ObjectId(id as string) : id;
        const collection = mongoose.connection.collection("user");

        const existingUser = await collection
          .findOne({ _id: queryId as mongoose.Types.ObjectId });
        if(!existingUser){
            return res.status(404).json({ message: "User not found" });
        }
        const updatePayload = {
            name,email,role,password, ...customFields
        }
        //Remove undefined /null keys
        Object.keys(updatePayload).forEach(key => {
            if (updatePayload[key] === undefined!|| updatePayload[key] === null) {
                delete updatePayload[key];
            };
        });
        //update the user
        const result = await collection.updateOne(
            { _id: new mongoose.Types.ObjectId(id as string)},// consvert string id to object id
            { $set: updatePayload }           
        );
        if(result.matchedCount === 0){
            return res.status(404).json({ message: "User not found" });
        }
         
        await logActivity((req as any).user.id, "update_user", `User with ID ${id} updated successfully`);

        res.json({ 
            message: "User updated successfully",
            updatedUser:result
         });
     }catch(error)
     {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error" });
     }
}

export const fetchAllUsers = async (req: Request, res: Response) => {
    try
    {
        //pagination params 
        const page = Math.max(1,parseInt(req.query.page as string) || 1);
        const limit = Math.max(1,parseInt(req.query.limit as string) || 10);
        const skip = (page - 1) * limit;
        const filter: any  = {};
        const role = req.query.role as string;
       
        //only add role to filter if it existes and isnt empty/all
        if(role && role !== "all" && role !== ""){
            filter.role = role;
        }

        //collection instance
        const collection = mongoose.connection.collection("user");
        //total count for pagination
        const totalUsers = await collection.countDocuments(filter);
        //fetch users with pagination
        const users = await collection.find(
            filter, //filter
            {
                projection:{
                    password:0,
                    headers : 0,
                    emailVerified: 0,
                },
        },)
             .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
           // .project({ password: 0 }) // Exclude the password field
            .toArray();

            res.json({
               res : users,
               pagination:{
                  currentPage: page,
                  totalPages: Math.ceil(totalUsers / limit),
                  totalData : totalUsers,
                  limit,
               }
            });
    }catch(error){
        console.error("Error fetching all users:", error);
        res.status(500).json({ message: "Internal server error" });
    }

    }




