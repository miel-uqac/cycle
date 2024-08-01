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
  };const { Datastore } = require('@google-cloud/datastore'); // Importation du client Datastore pour interagir avec Google Cloud Datastore
  const fs = require('fs'); // Module pour interagir avec le système de fichiers
  const csv = require('csv-parser'); // Module pour analyser les fichiers CSV
  const path = require('path'); // Module pour gérer les chemins de fichiers
  
  // Assurez-vous que GOOGLE_APPLICATION_CREDENTIALS est défini
  process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, '../serviceAccountKey.json');
  // Définition de la variable d'environnement pour le fichier des clés d'application Google
  
  // Crée un client Datastore
  const datastore = new Datastore(); // Création d'une instance du client Datastore
  
  // Chemin vers le fichier CSV
  const csvFilePath = path.join(__dirname, '../data.csv'); // Définition du chemin vers le fichier CSV
  
  /**
   * Fonction pour importer des données dans Datastore
   * @param {Object} data - Les données à importer
   */
  async function importToDatastore(data) {
    const key = datastore.key(['VotreKind', data.id]); 
    // Création d'une clé pour l'entité Datastore avec le type 'VotreKind' et l'ID provenant des données CSV
    const entity = {
      key: key,
      data: data, // Les données à sauvegarder dans Datastore
    };
    try {
      await datastore.save(entity); // Sauvegarde de l'entité dans Datastore
      console.log(`Entité ${key.id} sauvegardée.`); // Log en cas de succès
    } catch (error) {
      console.error('ERREUR :', error); // Log en cas d'erreur
    }
  }
  
  const results = []; // Tableau pour stocker les résultats du CSV
  // Lecture et parsing du fichier CSV
  fs.createReadStream(csvFilePath)
    .pipe(csv()) // Analyse du fichier CSV
    .on('data', (data) => results.push(data)) // Ajout des données de chaque ligne au tableau 'results'
    .on('end', () => {
      results.forEach((row) => {
        importToDatastore(row); // Importation de chaque ligne de données dans Datastore
      });
    });
  
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
