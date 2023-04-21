import { Router } from "express";
const router = Router();
import fetchuser from "../middleware/fetchuser";
import Note, { find, findById, findByIdAndUpdate, findByIdAndDelete } from "../models/Note";
import { body, validationResult } from "express-validator";

// const express = require("express");
// const router = express.Router();
// var fetchuser = require("../middleware/fetchuser");
// const Note = require("../models/Note");
// const { body, validationResult } = require("express-validator");

// ROUTE 1 : GET all notes using : GET "/api/notes/fetchallnotes" login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error occured server");
  }
});
// ROUTE 2 : add note using : POST "/api/notes/addnote" login required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "enter vaild title").isLength({ min: 3 }),
    body("description", "description must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      // Finds the validation errors in this request and wraps them in an object with handy functions
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();
      res.json(savedNote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Error occured server");
    }
  }
);
// ROUTE 3 : update a note using : PUT "/api/notes/updatenote/id" login required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
    // create new note object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }
    // find note and update it (authentication check)
    let note = await findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }
    // update news
    note = await findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error occured server");
  }
});

// ROUTE 4 : delete a note using : DELETE "/api/notes/deletenote/id" login required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    // find note and delete it (authentication check)
    let note = await findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }
    // delete news
    note = await findByIdAndDelete(req.params.id);
    res.json({ Success: "Deleted", note: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error occured server");
  }
});
export default router;
