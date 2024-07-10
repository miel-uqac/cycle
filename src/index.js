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
  apiKey: "AIzaSyBXp6ZAqezf4GjwET7QS3qhX9xn9Yi4W3U",
  authDomain: "veluqac-3a3e8.firebaseapp.com",
  projectId: "veluqac-3a3e8",
  storageBucket: "veluqac-3a3e8.appspot.com",
  messagingSenderId: "853579110294",
  appId: "1:853579110294:web:65e22ffa525012dafb2fb7",
  measurementId: "G-SDXX1H5JC6"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM chargé");

    const signupForm = document.querySelector(".signup");
    const loginForm = document.querySelector(".login");
    const logoutBtn = document.querySelector(".logout");
    const errorMessage = document.getElementById('error-message');
    const resetPasswordBtn = document.getElementById("resetPasswordBtn");
    const resetEmail = document.getElementById("resetEmail");
    const resetPasswordMessage = document.getElementById("resetPasswordMessage");
    const deleteAccountButton = document.getElementById('deleteAccountButton');

    let dspEmail = document.getElementById("displayEmail");
    let status = document.getElementById("status");

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

    //Inscription de l'utilisateur
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
                signupForm.reset();
                errorMessage.textContent = "";
            })
            .catch((error) => {
                console.log(error.message);
                errorMessage.textContent = error.message;
            });
        });
    }
    
    //Connexion de l'utilisateur
    if (loginForm){
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
    
            const email = loginForm.email.value;
            const password = loginForm.password.value;
    
            signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log("Utilisateur connecté avec succès", userCredential.user);
                const user = userCredential.user;
                dspEmail.textContent = user.email;
                status.textContent = user.emailVerified;
                loginForm.reset();
            })
            .catch((error) => {
                console.error("Erreur de connexion:", error.message);
                errorMessage.textContent = error.message;
            });
        });
    }

    //Deconnexion de l'utilisateur
    if (logoutBtn){
        logoutBtn.addEventListener("click", () => {
            signOut(auth)
            .then(() => console.log("utilisateur deconnecté"))
            .catch((err) => console.log(err.message));
        });
    }

    // Écouter les changements d'état de l'authentification
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("Utilisateur authentifié:", user);
            // Récupérer les données de l'utilisateur depuis Firestore
            const userDocRef = doc(db, "utilisateurs", user.uid);
            getDoc(userDocRef).then((docSnap) => {
                if (docSnap.exists()) {
                    // Vérifiez l'existence de l'élément avant de définir textContent
                    const userEmailElement = document.getElementById('userEmail');
                    if (userEmailElement) {
                        userEmailElement.textContent = userData.email;
                    } else {
                        console.error("Élément userEmail non trouvé dans le DOM.");
                    }

                    // Ajoutez d'autres éléments pour afficher plus de données
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
                } else {
                    console.log("Aucune donnée d'utilisateur trouvée !");
                }
            }).catch((error) => {
                console.log("Erreur lors de la récupération des données de l'utilisateur:", error);
            });   
        } else {
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
                <p>Temps d'utilisation: ${appareil.temps}</p>
                <img src="${appareil.image}" alt="${appareil.nom}" style="width: 100px;"/>
            `;
            appareilsContainer.appendChild(appareilDiv);
        });
    }).catch((error) => {
        console.log("Erreur:", error);
    });

    // Gestion de la réinitialisation du mot de passe par email
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
                resetPasswordMessage.textContent = error.message;
            });
    });

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
    
});
