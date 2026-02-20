require("dotenv").config();

const mongoose = require("mongoose");

mongoose.connect(process.env.CONNECTION_STRING)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDB", err));

const User = require("./models/user.model");
const Note = require("./models/note.model");

const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.use(
  cors({
    origin: "*",
  })
);


// Create Account
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName) {
    return res
      .status(400)
      .json({ error: true, message: "Full Name is required" });
  }

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }

  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });
  }

  try {
    const isUser = await User.findOne({ email: email });

    if (isUser) {
      return res.json({
        error: true,
        message: "User already exists",
      });
    }

    const user = new User({
      fullName,
      email,
      password,
    });

    await user.save();

    const accessToken = jwt.sign(
      { user },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "36000m",
      }
    );

    return res.json({
      error: false,
      user,
      accessToken,
      message: "Registration Successful",
    });
  } catch (error) {
    console.error("Error in create-account:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    const userInfo = await User.findOne({ email: email });

    if (!userInfo) {
      return res.status(400).json({ message: "User not found" });
    }

    if (userInfo.email == email && userInfo.password == password) {
      const user = { user: userInfo };
      const accessToken = jwt.sign(
        user,
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "36000m",
        }
      );

      return res.json({
        error: false,
        message: "Login Successful",
        email,
        accessToken,
        user: userInfo,
      });
    } else {
      return res.status(400).json({
        error: true,
        message: "Invalid Credentials",
      });
    }
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Get User
app.get("/get-user", authenticateToken, async (req, res) => {
  const { user } = req.user;

  const isUser = await User.findOne({ _id: user._id });

  if (!isUser) {
    return res.sendStatus(401);
  }

  return res.json({
    user: {
      fullName: isUser.fullName,
      email: isUser.email,
      _id: isUser._id,
      createdOn: isUser.createdOn,
    },
    message: "",
  });
});

// Update User
app.put("/update-user", authenticateToken, async (req, res) => {
  const { fullName } = req.body;
  const { user } = req.user;

  if (!fullName) {
    return res.status(400).json({ error: true, message: "Full Name is required" });
  }

  try {
    const userInfo = await User.findOne({ _id: user._id });

    if (!userInfo) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    userInfo.fullName = fullName;
    await userInfo.save();

    return res.json({
      error: false,
      user: {
        fullName: userInfo.fullName,
        email: userInfo.email,
        _id: userInfo._id,
        createdOn: userInfo.createdOn,
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Add Note
app.post("/add-note", authenticateToken, async (req, res) => {
  const { title, content, tags, isPinned, isFavorite, isArchived, isPrivate } = req.body;
  const { user } = req.user;
  console.log("Adding note for userId:", user._id, "Type:", typeof user._id); // Log type
  const userIdStr = String(user._id); // Force string

  // Normalize tags
  const normalizedTags = tags ? [...new Set(tags.map(tag => {
    const trimmed = tag.trim();
    if (!trimmed) return null;
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  }).filter(Boolean))] : [];

  if (!title) {
    return res.status(400).json({ error: true, message: "Title is required" });
  }

  if (!content) {
    return res
      .status(400)
      .json({ error: true, message: "Content is required" });
  }

  try {
    const note = new Note({
      title,
      content,
      tags: normalizedTags || [],
      isPinned: isPinned || false,
      isFavorite: isFavorite || false,
      isArchived: isArchived || false,
      isPrivate: isPrivate || false,
      userId: userIdStr,
    });

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note added successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Edit Note
app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;

  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return res.status(400).json({ error: true, message: "Invalid Note ID" });
  }
  const { title, content, tags, isPinned, isFavorite, isArchived, isPrivate } = req.body;
  const { user } = req.user;

  // Normalize tags if provided
  let normalizedTags = null;
  if (tags) {
    normalizedTags = [...new Set(tags.map(tag => {
      const trimmed = tag.trim();
      if (!trimmed) return null;
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    }).filter(Boolean))];
  }

  if (!title && !content && !tags && typeof isPinned === 'undefined' && typeof isFavorite === 'undefined' && typeof isArchived === 'undefined' && typeof isPrivate === 'undefined') {
    return res
      .status(400)
      .json({ error: true, message: "No changes provided" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = normalizedTags;
    if (typeof isPinned !== 'undefined') note.isPinned = isPinned;
    if (typeof isFavorite !== 'undefined') note.isFavorite = isFavorite;
    if (typeof isArchived !== 'undefined') note.isArchived = isArchived;
    if (typeof isPrivate !== 'undefined') note.isPrivate = isPrivate;
    note.updatedAt = new Date().getTime();

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

const bcrypt = require("bcryptjs"); // Import bcryptjs

// ... (existing imports and middleware)

// ... (existing helper functions)

// Update Search Notes to exclude private notes by default (unless specifically requested, for now we exclude)
// Search Notes
app.get("/search-notes", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const { query } = req.query;

  if (!query) {
    return res
      .status(400)
      .json({ error: true, message: "Search query is required" });
  }

  try {
    const matchingNotes = await Note.find({
      userId: user._id,
      isPrivate: { $ne: true }, // Exclude private notes from general search
      isTrash: { $ne: true },   // Exclude trash notes
      isArchived: { $ne: true }, // Exclude archived notes
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
      ],
    });

    return res.json({
      error: false,
      notes: matchingNotes,
      message: "Notes matching the search query retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Update Get All Notes to exclude private notes
app.get("/get-all-notes", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const { type, tag } = req.query;
  const userIdStr = String(user._id);

  try {
    let query = { userId: userIdStr };

    if (type === 'trash') {
      query.isTrash = true;
    } else if (type === 'archive') {
      query.isArchived = true;
      query.isTrash = { $ne: true };
      query.isPrivate = { $ne: true }; // Don't show private in archive
    } else if (type === 'favorites') {
      query.isFavorite = true; // Filter by isFavorite instead of isPinned
      query.isTrash = { $ne: true };
      query.isArchived = { $ne: true };
      query.isPrivate = { $ne: true }; // Don't show private in favorites
    } else {
      // Default: All Notes (excluding trash, archive, and private)
      query.isTrash = { $ne: true };
      query.isArchived = { $ne: true };
      query.isPrivate = { $ne: true };
    }

    if (tag) {
      query.tags = { $regex: new RegExp(`^${tag}$`, "i") };
    }

    const notes = await Note.find(query).sort({ isPinned: -1, updatedAt: -1 });

    return res.json({
      error: false,
      notes,
      message: "Notes retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Get All Tags
app.get("/get-all-tags", authenticateToken, async (req, res) => {
  const { user } = req.user;

  try {
    const notes = await Note.find({ userId: user._id }).sort({ updatedAt: -1 });
    const uniqueTagsSet = new Set();
    const tags = [];

    notes.forEach(note => {
      if (note.tags) {
        note.tags.forEach(tag => {
          const lowerTag = tag.toLowerCase();
          if (!uniqueTagsSet.has(lowerTag)) {
            uniqueTagsSet.add(lowerTag);
            tags.push(tag);
          }
        });
      }
    });

    return res.json({
      error: false,
      tags,
      message: "Tags retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Delete Note (Soft Delete)
app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;

  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return res.status(400).json({ error: true, message: "Invalid Note ID" });
  }
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    note.isTrash = true;
    note.deletedAt = new Date();
    await note.save();

    return res.json({
      error: false,
      message: "Note moved to trash successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Delete Note Permanent
app.delete("/delete-note-permanent/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;

  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return res.status(400).json({ error: true, message: "Invalid Note ID" });
  }
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    await Note.deleteOne({ _id: noteId, userId: user._id });

    return res.json({
      error: false,
      message: "Note deleted permanently",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Restore Note
app.put("/restore-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;

  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return res.status(400).json({ error: true, message: "Invalid Note ID" });
  }
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    note.isTrash = false;
    note.isArchived = false;
    note.deletedAt = null;
    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note restored successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Update Note Archive
app.put("/update-note-archive/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;

  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return res.status(400).json({ error: true, message: "Invalid Note ID" });
  }
  const { isArchived } = req.body;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    note.isArchived = isArchived;
    if (isArchived) {
      note.isPinned = false; // Unpin if archived
      note.isTrash = false; // Ensure not in trash
      note.isPrivate = false; // Ensure not private
    }

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note archive status updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Update Note Pinned
app.put("/update-note-pinned/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;

  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return res.status(400).json({ error: true, message: "Invalid Note ID" });
  }
  const { isPinned } = req.body;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    note.isPinned = isPinned;
    if (isPinned) {
      note.isPrivate = false; // Ensure not private if pinning
    }

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note pinned status updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Update Note Favorite
app.put("/update-note-favorite/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;

  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return res.status(400).json({ error: true, message: "Invalid Note ID" });
  }
  const { isFavorite } = req.body;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    note.isFavorite = isFavorite;
    // Decoupled: Favoriting does NOT affect Private/Pinned/Archived automatically, 
    // though typically you might want to ensure it's not trash.
    // We'll leave it flexible or ensure it's not trash if desired.

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note favorite status updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Get Note
app.get("/get-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;

  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return res.status(400).json({ error: true, message: "Invalid Note ID" });
  }
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    return res.json({
      error: false,
      note,
      message: "Note retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Cleanup function
const cleanupTrash = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
    const result = await Note.deleteMany({ isTrash: true, deletedAt: { $lt: thirtyDaysAgo } });
    if (result.deletedCount > 0) {
      console.log(`Auto-deleted ${result.deletedCount} old notes from trash.`);
    }
  } catch (error) {
    console.error("Error cleaning up trash:", error);
  }
};

// Run cleanup every hour (or on startup)
setInterval(cleanupTrash, 60 * 60 * 1000); // 1 hour
cleanupTrash(); // Run on startup

// Migration: Backfill updatedAt for existing notes
const migrateNotes = async () => {
  try {
    const notesToMigrate = await Note.find({ updatedAt: { $exists: false } });

    if (notesToMigrate.length > 0) {
      console.log(`Found ${notesToMigrate.length} notes to migrate.`);

      for (const note of notesToMigrate) {
        note.updatedAt = note.createdOn; // Default to createdOn if missing
        await note.save();
      }

      console.log(`Successfully migrated ${notesToMigrate.length} notes.`);
    }
  } catch (error) {
    console.error("Error migrating notes:", error);
  }
};
migrateNotes();

// --- Private Notes Routes ---

// Check if private password is set
app.get("/check-private-password-set", authenticateToken, async (req, res) => {
  const { user } = req.user;
  try {
    const userInfo = await User.findOne({ _id: user._id });
    return res.json({
      error: false,
      isPasswordSet: !!userInfo.privateNotesPassword,
      message: "Password status checked",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Set Private Password
app.post("/set-private-password", authenticateToken, async (req, res) => {
  const { password } = req.body;
  const { user } = req.user;

  if (!password) {
    return res.status(400).json({ error: true, message: "Password is required" });
  }

  try {
    const userInfo = await User.findOne({ _id: user._id });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    userInfo.privateNotesPassword = hashedPassword;
    await userInfo.save();

    return res.json({
      error: false,
      message: "Private password set successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Verify Private Password
app.post("/verify-private-password", authenticateToken, async (req, res) => {
  const { password } = req.body;
  const { user } = req.user;

  try {
    const userInfo = await User.findOne({ _id: user._id });
    if (!userInfo.privateNotesPassword) {
      return res.status(400).json({ error: true, message: "Password not set" });
    }

    const isMatch = await bcrypt.compare(password, userInfo.privateNotesPassword);

    if (isMatch) {
      return res.json({
        error: false,
        message: "Password verified",
      });
    } else {
      return res.json({
        error: true,
        message: "Incorrect password",
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Reset Private Password (requires account password)
app.post("/reset-private-password", authenticateToken, async (req, res) => {
  const { password } = req.body;
  const { user } = req.user;

  if (!password) {
    return res.status(400).json({ error: true, message: "Account password is required" });
  }

  try {
    const userInfo = await User.findOne({ _id: user._id });

    // Verify Account Password
    if (userInfo.password !== password) {
      return res.status(400).json({ error: true, message: "Incorrect account password" });
    }

    // Reset Private Password
    userInfo.privateNotesPassword = null;
    await userInfo.save();

    return res.json({
      error: false,
      message: "Private password reset successfully",
    });

  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Change Private Password (requires current private password)
app.post("/change-private-password", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { user } = req.user;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: true, message: "Current and new passwords are required" });
  }

  try {
    const userInfo = await User.findOne({ _id: user._id });

    if (!userInfo.privateNotesPassword) {
      return res.status(400).json({ error: true, message: "Private password not set" });
    }

    // Verify Current Private Password
    const isMatch = await bcrypt.compare(currentPassword, userInfo.privateNotesPassword);

    if (!isMatch) {
      return res.status(400).json({ error: true, message: "Incorrect current private password" });
    }

    // Hash New Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    userInfo.privateNotesPassword = hashedPassword;
    await userInfo.save();

    return res.json({
      error: false,
      message: "Private password changed successfully",
    });

  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Get Private Notes
app.get("/get-private-notes", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const userIdStr = String(user._id);

  try {
    const notes = await Note.find({
      userId: userIdStr,
      isPrivate: true,
      isTrash: { $ne: true }
    }).sort({ updatedAt: -1 });

    return res.json({
      error: false,
      notes,
      message: "Private notes retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Update Note Private Status
app.put("/update-note-private/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { isPrivate } = req.body;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    note.isPrivate = isPrivate;
    if (isPrivate) {
      note.isPinned = false;
      note.isArchived = false;
      note.isTrash = false;
    }

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note private status updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
