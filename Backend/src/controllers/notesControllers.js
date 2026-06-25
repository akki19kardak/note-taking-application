import Note from "../models/Note.js"
export async function getAllNote(req,res)  {
    try{
        const notes = await Note.find().sort({createAt: -1});
        res.status(200).json(notes);
    }catch (error) {
        console.error("Error in getAllNotes controller", error);//debugging
        res.status(500).json({message: "Internal server error"});
    }
}

export async function getNoteById(req,res) {
    try{
        const note = await Note.findById(req.params.id);
        if(!note) return res.status(404).json({message:"Note not found! "});
        res.json(note);
    }catch(error) {
        console.error("Error in getNoteById controller", error);
        res.status(500).json({message:"Internal server error"});
    }
}

export async function createNote(req,res)  {
    try{
        const {title,content} = req.body;
        const note = new Note({title, content});

        const savedNote = await note.save();
        res.status(201).json({message: "Note created successfully"});
    }catch(error){
        console.error("Error in createNote controller", error);
        res,status(500).json({message: "Internal server error"});
    }
}

export async function updateNote(req,res)  {
    try {
        const{title,content} = req.body;
        const updatedNote = await Note.findByIdAndUpdate(req.params.id,{title, content},
            {
                new: true,
            }
        );
        if(!updatedNote) return res.status(404).json({message:"Note not found"});
            res.status(200).json({message:"Note updated successfully"});
    }catch(error) {
    console.error("Error in updateNote controller", error);
    res.status(500).json({message:"Internal Server error"});
    }
}

export async function deleteNote(req,res)  {
    try{
        const deletedNote =  await Note.findByIdAndDelete(req.params.id,{title,content},);
        if(!deleteNote) return res.status(404).json({message:"Note not found"});
          res.status(200).json({message:"Note has deleted successfully"});
    }catch (error) {
            console.error("Error in deleteNote controller", error);
    res.status(200).json({message:"Internal server error"});
 }
}