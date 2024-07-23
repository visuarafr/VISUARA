import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { collection, query, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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
    const clientList = document.getElementById('client-list');
    clientList.innerHTML = ''; // Clear previous content

    const q = query(collection(db, "clients"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const clientData = doc.data();
        const clientItem = document.createElement('div');
        clientItem.classList.add('client-item');
        clientItem.innerHTML = `
            <div class="client-name">${clientData.name}</div>
            <button class="btn btn-primary email-btn" onclick="sendEmail('${clientData.email}', '${clientData.name}')">Envoyer Email</button>
        `;
        clientList.appendChild(clientItem);
    });

    // Add search functionality
    document.getElementById('search-bar').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const clientItems = document.querySelectorAll('.client-item');
        clientItems.forEach(item => {
            const clientName = item.querySelector('.client-name').textContent.toLowerCase();
            if (clientName.includes(searchTerm)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

window.sendEmail = function(clientEmail, clientName) {
    const templateParams = {
        user_email: clientEmail,
        user_name: clientName,
        reply_to: "reply@example.com",
        message: "Vos photos sont maintenant disponibles."
    };

    emailjs.send('service_oes8k5b', 'template_6f8cima', templateParams)
        .then((response) => {
            console.log('SUCCESS!', response.status, response.text);
            alert('Email envoyé avec succès à ' + clientName + '!');
        }, (error) => {
            console.error('FAILED...', error);
            alert('Erreur lors de l\'envoi de l\'email à ' + clientName + ' : ' + error.text);
        });
}
