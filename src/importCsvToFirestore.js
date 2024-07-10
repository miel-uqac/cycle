const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Initialiser Firebase Admin SDK
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Chemin vers le fichier CSV
const csvFilePath = path.join(__dirname, '../data.csv');

// Fonction pour importer les données dans Firestore
async function importToFirestore(data) {
  const batch = db.batch();
  data.forEach(doc => {
    const docRef = db.collection('utilisateurs').doc(doc.id);
    batch.set(docRef, doc);
  });
  await batch.commit();
  console.log('Data imported successfully!');
}

// Lire le fichier CSV et importer les données
function readCSVAndImport() {
  const data = [];
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      data.push(row);
    })
    .on('end', async () => {
      console.log('CSV file successfully processed');
      await importToFirestore(data);
    });
}

readCSVAndImport();