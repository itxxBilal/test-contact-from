const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// Use /tmp for uploads in Vercel
const uploadDir = path.join("/tmp", "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Use /tmp/uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Store contact data
const contacts = [];

// Serve static files
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Contact Form API
app.post("/api/contact", upload.single("profilePic"), (req, res) => {
    const { name, email, message } = req.body;
    const profilePic = req.file ? `${uploadDir}/${req.file.filename}` : null;

    const contactData = { name, email, message, profilePic };
    contacts.push(contactData);

    res.json({ message: "Contact form submitted successfully!", contactData });
});

// API to get all submitted contacts
app.get("/api/contacts", (req, res) => {
    res.json(contacts);
});
// Serve index.html on root ("/")
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


// Serve dashboard page
app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Export app for Vercel
module.exports = app;

// Start server locally (Only when not in Vercel)
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}
