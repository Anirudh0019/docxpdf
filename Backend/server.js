const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Set up multer for file uploads
const upload = multer({ dest: 'src/uploads/' });

// Endpoint for converting DOCX to PDF
app.post('/convert', upload.single('file'), (req, res) => {
  const docxFilePath = req.file.path;
  const pdfFilePath = `src/converted/${req.file.filename}.pdf`;

  // Command to convert DOCX to PDF using LibreOffice
  exec(`libreoffice --headless --convert-to pdf "${docxFilePath}" --outdir src/converted`, (error) => {
    if (error) {
      console.error('Error during conversion:', error);
      return res.status(500).json({ error: 'Conversion failed' });
    }

    // Send the converted PDF file to the client
    res.download(pdfFilePath, `${path.parse(req.file.originalname).name}.pdf`, (err) => {
      if (err) {
        console.error('Error sending PDF:', err);
        res.status(500).send('Error downloading the file');
      }

      // Clean up files after download
      fs.unlink(docxFilePath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting DOCX file:', unlinkErr);
      });
      fs.unlink(pdfFilePath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting PDF file:', unlinkErr);
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
