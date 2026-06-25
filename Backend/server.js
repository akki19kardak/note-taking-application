
import notesRoutes from "./src/routes/noteRoutes.js";
import express from "express";
const app = express();

app.use("/api/notes",notesRoutes);
/*
app.get("/api/notes", (req,res) => { 
res.status(200).send("you got 5 notes");
});

app.post("/api/notes", (req,res) => {
    res.status(200).json({message:"post updated successfully"});
});

*/
app.listen(5001, () => {
    console.log("server started on PORT 5000");
});