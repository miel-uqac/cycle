// src/importCSV.js
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const csvParser = require('csv-parser');
const fs = require('fs');
const admin = require('firebase-admin');

const app = express();
const port = 3000;

admin.initializeApp({
    credential: admin.credential.cert(require('../serviceAccountKey.json'))
});

const db = admin.firestore();

const firestore = require('@firebase/firestore');
firestore.setLogLevel('debug');

app.use(fileUpload());

app.post('/importCSV', async (req, res) => {
    if (!req.files || !req.files.csvFile) {
        return res.status(400).send('No file uploaded.');
    }

    const csvFile = req.files.csvFile;
    const filePath = `./uploads/${csvFile.name}`;

    csvFile.mv(filePath, err => {
        if (err) {
            console.error('File move error:', err);
            return res.status(500).send(err);
        }

        const results = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                const batch = db.batch();
                results.forEach((doc) => {
                    const docRef = db.collection('appareils').doc(); 
                    batch.set(docRef, doc);
                });

                try {
                    await batch.commit();
                    fs.unlinkSync(filePath); 
                    // Supprime le fichier après l'importation
                    res.status(200).send('Data successfully imported to Firestore.');
                } catch (error) {
                    res.status(500).send('Error importing data to Firestore: ' + error.message);
                }
            });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

const retryOperation = async (operation, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (i < retries - 1) {
                await new Promise(res => setTimeout(res, delay));
            } else {
                throw error;
            }
        }
    }
};

const importDataToFirestore = async (data) => {
    const batch = db.batch();
    data.forEach((doc) => {
        const docRef = db.collection('your-collection-name').doc();
        batch.set(docRef, doc);
    });
    await retryOperation(() => batch.commit());
};
