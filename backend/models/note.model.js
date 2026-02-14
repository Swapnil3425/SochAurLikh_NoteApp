const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const noteSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    isPinned: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false }, // New field
    isArchived: { type: Boolean, default: false },
    isPrivate: { type: Boolean, default: false },
    isTrash: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    userId: { type: String, required: true },
    createdOn: { type: Date, default: new Date().getTime() },
    updatedAt: { type: Date, default: new Date().getTime() },
});

module.exports = mongoose.model("Note", noteSchema);

