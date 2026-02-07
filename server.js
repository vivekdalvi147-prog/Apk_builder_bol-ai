const express = require('express');
const multer = require('multer');
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

// Cleanup function
const deleteFile = (filePath) => {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

app.post('/upload', upload.single('projectZip'), (req, res) => {
    const file = req.file;
    
    if (!file) {
        return res.status(400).json({ error: "No file uploaded." });
    }

    // 1. Validate ZIP
    try {
        const zip = new AdmZip(file.path);
        const zipEntries = zip.getEntries();
        let hasIndex = false;

        zipEntries.forEach((entry) => {
            if (entry.entryName === "index.html" || entry.entryName.endsWith("/index.html")) {
                hasIndex = true;
            }
        });

        if (!hasIndex) {
            deleteFile(file.path);
            return res.status(400).json({ error: "Invalid Structure: 'index.html' is missing!" });
        }

        // 2. Simulate APK Build (Real build requires Android SDK on server)
        // Here we are simulating the time it takes to build
        setTimeout(() => {
            // In a real scenario, here you would run a script like 'cordova build android'
            // For this demo, we return success and the original file as a 'dummy' APK
            res.json({ 
                success: true, 
                message: "APK Built Successfully!", 
                downloadUrl: `/download/${file.filename}` 
            });
        }, 3000); // 3 seconds fake build time

    } catch (err) {
        deleteFile(file.path);
        res.status(500).json({ error: "Error processing ZIP file." });
    }
});

// Download Endpoint
app.get('/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    if(fs.existsSync(filePath)){
        res.download(filePath, 'Bol-AI-App.apk', (err) => {
            if(!err) deleteFile(filePath); // Delete after download for security
        });
    } else {
        res.status(404).send("File expired or not found.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bol-AI Engine running on port ${PORT}`));
