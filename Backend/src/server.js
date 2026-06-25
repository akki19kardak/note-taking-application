
import notesRoutes from "./routes/notesRoutes.js";
import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;
connectDB();
app.use(express.json());
app.use("/api/notes",notesRoutes);


app.use(express.json())//middleware



app.listen(5001, () => {
    console.log("server started on PORT 5001");
});