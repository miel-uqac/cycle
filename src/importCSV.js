// src/importCSV.js

const express = require('express'); // Importation du framework Express pour créer des applications web
const bodyParser = require('body-parser'); // Importation pour analyser les corps de requêtes HTTP
const fileUpload = require('express-fileupload'); // Middleware pour gérer les uploads de fichiers
const csvParser = require('csv-parser'); // Module pour analyser les fichiers CSV
const fs = require('fs'); // Module pour interagir avec le système de fichiers
const admin = require('firebase-admin'); // SDK Firebase Admin pour accéder à Firestore

const app = express(); // Création d'une instance d'application Express
const port = 3000; // Définition du port sur lequel le serveur écoutera

// Initialisation de Firebase Admin avec les informations d'identification du service
admin.initializeApp({
    credential: admin.credential.cert(require('../serviceAccountKey.json'))
});

const db = admin.firestore(); // Accès à Firestore

const firestore = require('@firebase/firestore'); // Importation du module Firestore
firestore.setLogLevel('debug'); // Configuration du niveau de log pour Firestore

app.use(fileUpload()); // Utilisation du middleware pour les uploads de fichiers

// Route pour l'importation des fichiers CSV
app.post('/importCSV', async (req, res) => {
    // Vérification si le fichier est présent dans la requête
    if (!req.files || !req.files.csvFile) {
        return res.status(400).send('No file uploaded.');
    }

    const csvFile = req.files.csvFile; // Récupération du fichier CSV
    const filePath = `./uploads/${csvFile.name}`; // Définition du chemin de sauvegarde du fichier

    // Déplacement du fichier vers le répertoire de stockage
    csvFile.mv(filePath, err => {
        if (err) {
            console.error('File move error:', err); // Log de l'erreur en cas de problème
            return res.status(500).send(err);
        }

        const results = []; // Tableau pour stocker les données du CSV
        // Lecture et parsing du fichier CSV
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (data) => results.push(data)) // Ajout des données à chaque ligne lue
            .on('end', async () => {
                const batch = db.batch(); // Création d'un lot d'écriture pour Firestore
                results.forEach((doc) => {
                    const docRef = db.collection('appareils').doc(); // Référence à un nouveau document
                    batch.set(docRef, doc); // Ajout de l'écriture au lot
                });

                try {
                    await batch.commit(); // Envoi du lot à Firestore
                    fs.unlinkSync(filePath); // Suppression du fichier après l'importation
                    res.status(200).send('Data successfully imported to Firestore.'); // Réponse en cas de succès
                } catch (error) {
                    res.status(500).send('Error importing data to Firestore: ' + error.message); // Réponse en cas d'erreur
                }
            });
    });
});

// Démarrage du serveur et écoute sur le port défini
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Fonction pour réessayer une opération en cas d'échec
const retryOperation = async (operation, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await operation(); // Exécution de l'opération
        } catch (error) {
            if (i < retries - 1) {
                await new Promise(res => setTimeout(res, delay)); // Attente avant la prochaine tentative
            } else {
                throw error; // Échec après toutes les tentatives
            }
        }
    }
};

// Fonction pour importer les données dans Firestore avec gestion des erreurs
const importDataToFirestore = async (data) => {
    const batch = db.batch(); // Création d'un lot d'écriture
    data.forEach((doc) => {
        const docRef = db.collection('your-collection-name').doc(); // Référence à un nouveau document
        batch.set(docRef, doc); // Ajout de l'écriture au lot
    });
    await retryOperation(() => batch.commit()); // Exécution de l'importation avec gestion des réessais
};
