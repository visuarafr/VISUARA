import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

window.logout = function() {
    signOut(auth).then(() => {
        window.location.replace('index.html');
    }).catch((error) => {
        console.error("Error signing out: ", error);
    });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        loadClients();
    } else {
        window.location.replace('index.html');
    }
});

async function loadClients() {
    const clientsContainer = document.getElementById('client-list');
    clientsContainer.innerHTML = ''; // Clear previous content

    try {
        const querySnapshot = await getDocs(collection(db, "clients"));
        if (querySnapshot.empty) {
            clientsContainer.innerHTML = '<p class="text-center">Aucun client trouvé.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const clientData = doc.data();
            const clientItem = document.createElement('div');
            clientItem.classList.add('client-item');

            const clientName = document.createElement('div');
            clientName.classList.add('client-name');
            clientName.textContent = clientData.name || 'Nom non disponible';

            const emailButton = document.createElement('button');
            emailButton.classList.add('btn', 'btn-primary', 'email-btn');
            emailButton.textContent = 'Envoyer Email';
            emailButton.onclick = () => sendEmail(clientData.email);

            clientItem.appendChild(clientName);
            clientItem.appendChild(emailButton);
            clientsContainer.appendChild(clientItem);
        });
    } catch (error) {
        console.error("Error loading clients:", error);
        clientsContainer.innerHTML = '<p class="text-center">Erreur lors du chargement des clients. Veuillez réessayer plus tard.</p>';
    }
}

function sendEmail(email) {
    const templateParams = {
        user_email: email,
        reply_to: "yannmartial@visuara.fr",
    };

    emailjs.send('service_oes8k5b', 'template_vq39i4z', templateParams)
        .then((response) => {
            console.log('SUCCESS!', response.status, response.text);
            alert('Email envoyé avec succès à ' + email);
        }, (error) => {
            console.error('FAILED...', error);
            alert('Erreur lors de l\'envoi de l\'email : ' + error.text);
        });
}

document.getElementById('search-bar').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const clientItems = document.querySelectorAll('.client-item');
    
    clientItems.forEach(item => {
        const clientName = item.querySelector('.client-name').textContent.toLowerCase();
        if (clientName.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
});
