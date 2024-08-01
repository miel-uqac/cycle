import { initializeApp } from "firebase/app";
import { 
    collection, 
    getDocs, 
    getFirestore, 
    doc, 
    setDoc, 
    deleteDoc,
    serverTimestamp, 
    getDoc 
} from "firebase/firestore";
import {
    getAuth,
    onAuthStateChanged,
    signOut,
    deleteUser,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification
} from "firebase/auth";

// Configuration Firebase de l'application web
const firebaseConfig = {
    apiKey: "AIzaSyC4TPchLaw2mpjpC2RG8SWOHrrUgTCg0dM",
    authDomain: "veluqac3.firebaseapp.com",
    projectId: "veluqac3",
    storageBucket: "veluqac3.appspot.com",
    messagingSenderId: "475407741894",
    appId: "1:475407741894:web:907dea7ba7906ba593b8c7",
    measurementId: "G-EE5B1TKDHT"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig); // Initialisation de l'application Firebase
const db = getFirestore(app); // Initialisation de Firestore
const auth = getAuth(app); // Initialisation de l'authentification Firebase

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM chargé");

    // Sélection des éléments du DOM
    const signupForm = document.querySelector(".signup");
    const loginForm = document.querySelector(".login");
    const logoutBtn = document.querySelector(".logout");
    const errorMessage = document.getElementById('error-message');
    const resetPasswordBtn = document.getElementById("resetPasswordBtn");
    const resetEmail = document.getElementById("resetEmail");
    const resetPasswordMessage = document.getElementById("resetPasswordMessage");
    const deleteAccountButton = document.getElementById('deleteAccountButton');
    const newPasswordForm = document.getElementById('resetPasswordForm');
    const fichierCSV = document.getElementById('uploadForm');

    let dspEmail = document.getElementById("displayEmail");
    let status = document.getElementById("status");

    const profileContainer = document.getElementById('profile-container');
    const userNameElement = document.getElementById('user-name');
    const userEmailElement = document.getElementById('user-email');
    
    // Fonction de validation de mot de passe
    function validatePassword(password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    // Fonction de validation d'email
    function validateEmail(email) {
        const emailRegex = /^([\w.%+-]+)@(uqac\.ca|etu\.uqac\.ca)$/i;
        return emailRegex.test(email);
    }

    // Inscription de l'utilisateur
    if (signupForm){
        signupForm.addEventListener("submit", (e) => {
            e.preventDefault();
    
            const email = signupForm.email.value;
            const password = signupForm.password.value;
            const codeBarre = signupForm.codeBarre.value;
            
            // Vérification de l'email
            if (!validateEmail(email)) {
                errorMessage.textContent = "L'email doit être une adresse uqac.ca ou etu.uqac.ca";
                return;
            }

            // Vérification du mot de passe
            if (!validatePassword(password)) {
                errorMessage.textContent = "Le mot de passe doit contenir au moins 8 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial";
                return;
            }

            // Vérification du code barre
            if (!codeBarre) {
                errorMessage.textContent = "Le code barre est requis";
                return;
            }

            // Création de l'utilisateur avec email et mot de passe
            createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("Utilisateur inscrit avec succès", userCredential.user);
                
                // Envoi de l'email de vérification
                sendEmailVerification(auth.currentUser)
                    .then(() => {
                        alert("Un email de vérification a été envoyé à votre adresse email.");
                    })
                    .catch((error) => {
                        console.log("Erreur lors de l'envoi de l'email de vérification : ", error.message);
                    });
            
                // Extraire le nom d'utilisateur de l'email
                const username = email.split('@')[0];

                // Enregistrement des données de l'utilisateur dans Firestore
                console.log("Enregistrement des données de l'utilisateur :", {
                    email: email,
                    username: username,
                    codeBarre: codeBarre
                });

                // Enregistrer les données de l'utilisateur dans Firestore
                return setDoc(doc(db, "utilisateurs", user.uid), {
                    email: email,
                    username: username,
                    createdAt: serverTimestamp(),
                    quantite_energie_cours : 0,
                    quantite_energie_total : 0,
                    quantite_energie_mois : 0,
                    quantite_energie_semaine : 0,
                    quantite_energie_cree : 0,
                    nombre_points : 0,
                    code_barre : codeBarre,
                });
            })
            .then(() => {
                console.log("Données de l'utilisateur sauvegardées avec succès");
                signupForm.reset(); // Réinitialiser le formulaire après une inscription réussie
                errorMessage.textContent = ""; // Effacer les messages d'erreur
            })
            .catch((error) => {
                console.log(error.message);
                errorMessage.textContent = error.message; // Afficher les erreurs éventuelles
            });
        });
    }
    
    // Connexion de l'utilisateur
    if (loginForm){
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault(); // Empêche l'envoi du formulaire
    
            const email = loginForm.email.value;
            const password = loginForm.password.value;
    
            signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log("Utilisateur connecté avec succès", userCredential.user);
                const user = userCredential.user;
                dspEmail.textContent = user.email; // Afficher l'email de l'utilisateur connecté
                status.textContent = user.emailVerified ? 'Verified' : 'Not Verified'; // Afficher le statut de vérification de l'email
                loginForm.reset(); // Réinitialiser le formulaire après une connexion réussie
            })
            .catch((error) => {
                console.error("Erreur de connexion:", error.message);
                errorMessage.textContent = error.message; // Afficher les erreurs éventuelles
            });
        });
    }

    // Deconnexion de l'utilisateur
    if (logoutBtn){
        logoutBtn.addEventListener("click", () => {
            signOut(auth)
            .then(() => console.log("utilisateur deconnecté"))
            .catch((err) => console.log(err.message)); // Afficher les erreurs éventuelles lors de la déconnexion
        });
    }

    // Écouter les changements d'état de l'authentification
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            signupForm.style.display = 'none';
            loginForm.style.display = 'none';
            resetPasswordButton.style.display = 'none';
            resetPasswordMessage.style.display = 'none';
            logoutButton.style.display = 'block';
            deleteAccountButton.style.display = 'block';
            console.log("Utilisateur authentifié:", user);

            try {
                // Récupérer les données de l'utilisateur depuis Firestore
                const userDocRef = doc(db, "utilisateurs", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();

                    // Vérifiez l'existence de l'élément avant de définir textContent
                    const userEmailElement = document.getElementById('userEmail');
                    if (userEmailElement) {
                        userEmailElement.textContent = userData.email;
                    } else {
                        console.error("Élément userEmail non trouvé dans le DOM.");
                    }

                    const userNameElement = document.getElementById('userName');
                    if (userNameElement) {
                        userNameElement.textContent = userData.username;
                    } else {
                        console.error("Élément userName non trouvé dans le DOM.");
                    }

                    const userCodeBarreElement = document.getElementById('userCodeBarre');
                    if (userCodeBarreElement) {
                        userCodeBarreElement.textContent = userData.code_barre;
                    } else {
                        console.error("Élément userCodeBarre non trouvé dans le DOM.");
                    }

                    profileContainer.style.display = 'block';
                } else {
                    console.log("Aucune donnée d'utilisateur trouvée !");
                }
            } catch (error) {
                console.log("Erreur lors de la récupération des données de l'utilisateur:", error);
            }
        } else {
            signupForm.style.display = 'block';
            loginForm.style.display = 'block';
            resetPasswordButton.style.display = 'block';
            resetPasswordMessage.style.display = 'block';
            logoutButton.style.display = 'none';
            deleteAccountButton.style.display = 'none';
            profileContainer.style.display = 'none';
            console.log("Aucun utilisateur authentifié. Restez sur la page actuelle.");
        }
    });

    // Récupération des données de la base de données
    const appareilsContainer = document.getElementById('appareilsContainer');
    const appareilsCollection  = collection (db, "appareils");
    getDocs(appareilsCollection ).then((snapshot) => {
        let appareils = [];
        snapshot.docs.forEach((doc) => {
            appareils.push({ ...doc.data(), id: doc.id});
        });
        console.log(appareils);
        appareils.forEach((appareil) => {
            const appareilDiv = document.createElement('div');
            appareilDiv.className = 'appareil';
            appareilDiv.innerHTML = `
                <h2>${appareil.nom}</h2>
                <p>ID: ${appareil.id}</p>
                <p>Consommation en kWh: ${appareil.consomation}</p>
                <p>Temps d'utilisation: ${appareil.temps_utilisation} heures</p>
                <img src="${appareil.imageUrl}" alt="${appareil.nom}" style="width: 100px;"/>
            `;
            appareilsContainer.appendChild(appareilDiv);
        });
    }).catch((error) => {
        console.log("Erreur:", error);
    });

    // Gestion de la réinitialisation du mot de passe par email
    if (resetPasswordBtn && resetEmail && resetPasswordMessage) {
        resetPasswordBtn.addEventListener("click", () => {
            const email = resetEmail.value;

            if (!validateEmail(email)) {
                resetPasswordMessage.textContent = "Veuillez entrer une adresse email uqac.ca ou etu.uqac.ca valide";
                return;
            }

            sendPasswordResetEmail(auth, email)
                .then(() => {
                    resetPasswordMessage.textContent = "Email de réinitialisation envoyé avec succès.";
                })
                .catch((error) => {
                    console.error("Erreur lors de l'envoi de l'email de réinitialisation:", error);
                    resetPasswordMessage.textContent = error.message; // Afficher les erreurs éventuelles
                });
        });
    }

    // Gestion de la suppression du compte utilisateur
    if (deleteAccountButton) {
        deleteAccountButton.addEventListener('click', () => {
            // Supprimer le compte utilisateur
            const user = auth.currentUser;
            if (user) {
                const userDocRef = doc(db, "utilisateurs", user.uid);
                console.log("Utilisateur authentifié pour suppression:", user);

                // Supprimer les données de l'utilisateur de Firestore
                deleteDoc(userDocRef)
                    .then(() => {
                        console.log("Données utilisateur supprimées de Firestore");
                        
                        // Supprimer l'utilisateur de Firebase Authentication
                        deleteUser(user)
                            .then(() => {
                                console.log("Utilisateur supprimé de Firebase Authentication");
                                alert("Votre compte a été supprimé avec succès.");
                            })
                            .catch((error) => {
                                console.error("Erreur lors de la suppression de l'utilisateur :", error.message);
                                errorMessage.textContent = "Erreur lors de la suppression du compte. Veuillez vous reconnecter et réessayer.";
                            });
                    })
                    .catch((error) => {
                        console.error("Erreur lors de la suppression des données de l'utilisateur :", error.message);
                        errorMessage.textContent = "Erreur lors de la suppression des données de l'utilisateur. Veuillez réessayer.";
                    });
            } else {
                console.log("Aucun utilisateur authentifié.");
                errorMessage.textContent = "Aucun utilisateur authentifié. Veuillez vous reconnecter et réessayer.";
            }
        });
    }

    // Gestion du changement de mot de passe
    if (newPasswordForm){
        newPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = newPasswordForm.newPassword.value;
            const passwordConfirm = newPasswordForm.confirmPassword.value;

            if(password !== passwordConfirm){
                alert("Les mots de passe ne correspondent pas");
                return;
            }

            const urlParams = new URLSearchParams(window.location.search);
            const oobCode = urlParams.get('oobCode');

            if (!oobCode) {
                errorMessage.textContent = "Lien de réinitialisation invalide";
                errorMessage.style.display = 'block';
                alert("Lien de réinitialisation invalide");
                return;
            }

            try {
                // s'assurer que l'utilisateur est connecté
                const user = firebase.auth().currentUser;

                if (!user) {
                    alert("Vous devez être connecté pour réinitialiser le mot de passe.");
                    return;
                }

                const email = user.email;
                console.log("Email de l'utilisateur:", email);

                // Réinitialisez le mot de passe
                await auth.confirmPasswordReset(oobCode, password);
                errorMessage.textContent = ""; 
                errorMessage.style.display = 'none'; 
                alert("Mot de passe réinitialisé avec succès");
            } catch (error) {
                console.error("Erreur lors de la réinitialisation du mot de passe:", error);
                alert("Erreur lors de la réinitialisation du mot de passe");
                errorMessage.textContent = "Erreur lors de la réinitialisation du mot de passe";
                errorMessage.style.display = 'block';
            }
        });
    }
    
    // Gestion de l'importation de fichiers CSV
    if (fichierCSV){
        async function uploadCSV(){
            const fileInput = document.getElementById('csvFile');
            const file = fileInput.files[0];
            if (!file) {
                alert("Please select a CSV file to upload.");
                return;
            }

            const formData = new FormData();
            formData.append('csvFile', file);

            const response = await fetch('/importCSV', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('CSV data successfully imported to Firestore!');
            } else {
                alert('Failed to import CSV data to Firestore.');
            }
        }
    }
});
