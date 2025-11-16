const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Increase payload limit for base64 images
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Upload endpoint
app.post('/api/upload', async (req, res) => {
  try {
    const { image, timestamp, filename, path: uploadPath } = req.body;

    if (!image || !timestamp || !filename) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create directory structure
    const assetsDir = path.join(__dirname, 'assets', timestamp.toString());
    
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    // Save image
    const imagePath = path.join(assetsDir, filename);
    const imageBuffer = Buffer.from(image, 'base64');
    fs.writeFileSync(imagePath, imageBuffer);

    console.log(`Image saved: ${imagePath}`);

    res.json({
      success: true,
      path: imagePath,
      timestamp,
      filename,
      size: imageBuffer.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to save image', message: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Upload endpoint: http://localhost:${PORT}/api/upload`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
