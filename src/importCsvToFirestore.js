const { Datastore } = require('@google-cloud/datastore');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Assurez-vous que GOOGLE_APPLICATION_CREDENTIALS est défini
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, '../serviceAccountKey.json');

// Crée un client Datastore
const datastore = new Datastore();

// Chemin vers le fichier CSV
const csvFilePath = path.join(__dirname, '../data.csv');

async function importToDatastore(data) {
  const key = datastore.key(['VotreKind', data.id]); 
  const entity = {
    key: key,
    data: data,
  };
  try {
    await datastore.save(entity);
    console.log(`Entité ${key.id} sauvegardée.`);
  } catch (error) {
    console.error('ERREUR :', error);
  }
}

const results = [];
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    results.forEach((row) => {
      importToDatastore(row);
    });
  });
