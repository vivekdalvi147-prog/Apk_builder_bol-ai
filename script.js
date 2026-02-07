const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uploadSection = document.getElementById('uploadSection');
const processSection = document.getElementById('processSection');
const successSection = document.getElementById('successSection');
const errorMsg = document.getElementById('errorMsg');
const statusText = document.getElementById('statusText');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');

// Click to upload
dropZone.addEventListener('click', () => fileInput.click());

// File Selection
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleUpload(e.target.files[0]);
    }
});

// Drag & Drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.background = "rgba(0, 242, 234, 0.2)";
});
dropZone.addEventListener('dragleave', () => {
    dropZone.style.background = "rgba(0, 242, 234, 0.05)";
});
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.background = "rgba(0, 242, 234, 0.05)";
    if (e.dataTransfer.files.length > 0) {
        handleUpload(e.dataTransfer.files[0]);
    }
});

function handleUpload(file) {
    if (file.type !== "application/x-zip-compressed" && file.type !== "application/zip") {
        showError("Only ZIP files are allowed!");
        return;
    }

    // UI Transition
    uploadSection.classList.add('hidden');
    processSection.classList.remove('hidden');
    errorMsg.classList.add('hidden');

    // Simulate Steps
    updateStatus("Extracting Files...", 1000, () => {
        updateStatus("Validating Structure...", 1000, () => {
            uploadFileToServer(file);
        });
    });
}

function updateStatus(text, delay, callback) {
    statusText.innerText = text;
    setTimeout(callback, delay);
}

function showError(msg) {
    errorMsg.innerText = msg;
    errorMsg.classList.remove('hidden');
    uploadSection.classList.remove('hidden');
    processSection.classList.add('hidden');
}

function uploadFileToServer(file) {
    statusText.innerText = "Building APK...";
    
    const formData = new FormData();
    formData.append('projectZip', file);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showError(data.error);
        } else {
            processSection.classList.add('hidden');
            successSection.classList.remove('hidden');
            downloadBtn.href = data.downloadUrl;
        }
    })
    .catch(err => {
        showError("Server Error: Could not build APK.");
    });
}

resetBtn.addEventListener('click', () => {
    successSection.classList.add('hidden');
    uploadSection.classList.remove('hidden');
    fileInput.value = "";
});
