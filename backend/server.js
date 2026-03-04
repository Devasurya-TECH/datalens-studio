const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Temporary storage for uploaded files
const upload = multer({ dest: 'uploads/' });

// Engine URL
const ENGINE_URL = process.env.ENGINE_URL || (process.env.ENGINE_HOST ? `https://${process.env.ENGINE_HOST}` : 'http://127.0.0.1:8000');

// MongoDB Connection (update placeholder with your URI)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/datalens';
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB not connected. App will run in memory-only mode.'));

const datasetSchema = new mongoose.Schema({
    filename: String,
    originalName: String,
    uploadDate: { type: Date, default: Date.now },
    size: Number,
});
const Dataset = mongoose.model('Dataset', datasetSchema);

app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
        const newDataset = new Dataset({
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size
        });

        if (mongoose.connection.readyState === 1) {
            await newDataset.save();
        } else {
            console.warn('MongoDB not connected - skipping DB save for', req.file.originalname);
        }

        // Prepare to forward to Python Engine
        const filePath = path.join(__dirname, 'uploads', req.file.filename);
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath), req.file.originalname);

        // Forward to FastAPI Engine
        const engineResponse = await axios.post(`${ENGINE_URL}/api/analyze`, form, {
            headers: { ...form.getHeaders() }
        });

        res.json({ message: 'Upload and analysis successful', metadata: newDataset, analysis: engineResponse.data });
    } catch (err) {
        console.error('Error processing file:', err.message);
        res.status(500).json({ error: 'Error processing file' });
    }
});

app.get('/api/feature/:filename/:column', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'uploads', req.params.filename);
        const engineResponse = await axios.get(`${ENGINE_URL}/api/feature?file_path=${encodeURIComponent(filePath)}&column=${encodeURIComponent(req.params.column)}`);
        res.json(engineResponse.data);
    } catch (err) {
        console.error('Feature engine error:', err.message);
        res.status(500).json({ error: 'Engine error' });
    }
});

app.get('/api/correlation/:filename', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'uploads', req.params.filename);
        const engineResponse = await axios.get(`${ENGINE_URL}/api/correlation?file_path=${encodeURIComponent(filePath)}`);
        res.json(engineResponse.data);
    } catch (err) {
        console.error('Correlation engine error:', err.message);
        res.status(500).json({ error: 'Engine error' });
    }
});

app.get('/api/ml-detect/:filename/:target', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'uploads', req.params.filename);
        const engineResponse = await axios.get(`${ENGINE_URL}/api/ml-detect?file_path=${encodeURIComponent(filePath)}&target=${encodeURIComponent(req.params.target)}`);
        res.json(engineResponse.data);
    } catch (err) {
        res.status(500).json({ error: 'Engine error' });
    }
});

app.get('/api/insights/:filename', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'uploads', req.params.filename);
        const engineResponse = await axios.get(`${ENGINE_URL}/api/insights?file_path=${encodeURIComponent(filePath)}`);
        res.json(engineResponse.data);
    } catch (err) {
        res.status(500).json({ error: 'Engine error' });
    }
});

app.post('/api/preprocess', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'uploads', req.body.filename);
        const payload = {
            file_path: filePath,
            operations: req.body.operations,
            export: req.body.export || false
        };
        const engineResponse = await axios.post(`${ENGINE_URL}/api/preprocess`, payload);
        res.json(engineResponse.data);
    } catch (err) {
        console.error('Preprocess error:', err.message);
        res.status(500).json({ error: 'Engine error' });
    }
});

app.get('/api/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    let downloadName = req.params.filename;
    if (req.query.original) {
        const original = req.query.original;
        // Strip .csv if it exists, then append _cleaned.csv
        const base = original.toLowerCase().endsWith('.csv') ? original.slice(0, -4) : original;
        downloadName = `${base}_cleaned.csv`;
    }
    res.download(filePath, downloadName);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
