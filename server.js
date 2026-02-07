const express = require('express');
const multer = require('multer');
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

const app = express();

// 1. AUTOMATIC FOLDER CREATION (Important for GitHub/Render)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. LOW RAM CONFIGURATION (Multer limits)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 } // Limit: 20MB (Low RAM Friendly)
});

app.use(express.static('public'));

// Helper to delete files to save RAM/Space
const deleteFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { console.log("Delete error", e); }
    }
};

app.post('/upload', upload.single('projectZip'), (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: "No file selected!" });
    }

    try {
        // 3. LOW RAM PROCESSING (Extract only entries, not full files into RAM)
        const zip = new AdmZip(file.path);
        const zipEntries = zip.getEntries();
        let hasIndex = false;

        for (let entry of zipEntries) {
            if (entry.entryName === "index.html" || entry.entryName.endsWith("/index.html")) {
                hasIndex = true;
                break;
            }
        }

        if (!hasIndex) {
            deleteFile(file.path);
            return res.status(400).json({ error: "Invalid Project: 'index.html' not found inside ZIP!" });
        }

        // Fake Build Delay (Futuristic Feel)
        setTimeout(() => {
            res.json({ 
                success: true, 
                message: "Cyber-Engine Built the APK!", 
                downloadUrl: `/download/${file.filename}` 
            });
        }, 3000);

    } catch (err) {
        console.error(err);
        if (file) deleteFile(file.path);
        res.status(500).json({ error: "Engine Error: Could not process ZIP." });
    }
});

app.get('/download/:filename', (req, res) => {
    const filePath = path.join(uploadDir, req.params.filename);
    if (fs.existsSync(filePath)) {
        res.download(filePath, 'Bol-AI-Project.apk', (err) => {
            if (!err) deleteFile(filePath); // Delete immediately after download
        });
    } else {
        res.status(404).send("File expired. Build again.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bol-AI Engine Active on Port ${PORT}`));
