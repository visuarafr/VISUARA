import { auth, db, storage } from './firebase-config.js';
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, query, collection, where, getDocs, addDoc, doc, getDoc, orderBy } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-storage.js";

let selectedClientId = null;
let isAdmin = false;

document.addEventListener('DOMContentLoaded', (event) => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            isAdmin = await checkAdminPermissions(user);
            if (!isAdmin) {
                alert('You do not have admin permissions.');
                window.location.replace('index.html');
            } else {
                loadClients();
            }
        } else {
            window.location.replace('index.html');
        }
    });
});

async function checkAdminPermissions(user) {
    const docRef = doc(db, "admins", user.uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
}

async function loadClients() {
    const searchResults = document.getElementById('search-results');
    if (!searchResults) {
        return;
    }
    const q = query(collection(db, "clients"), orderBy("companyName"));
    const querySnapshot = await getDocs(q);
    
    searchResults.innerHTML = '';

    querySnapshot.forEach((doc) => {
        const clientData = doc.data();
        const resultDiv = document.createElement('div');
        resultDiv.classList.add('result-entry');
        resultDiv.innerHTML = `
            <div>
                <p>Company Name: ${clientData.companyName}</p>
                <p>Email: ${clientData.email}</p>
            </div>
            <button onclick="selectClient('${doc.id}')">Select</button>
        `;
        searchResults.appendChild(resultDiv);
    });
}

window.searchCompany = async function() {
    const companyName = document.getElementById('search-company').value;
    const searchResults = document.getElementById('search-results');
    if (!searchResults) {
        return;
    }
    const q = query(collection(db, "clients"), where("companyName", "==", companyName));
    const querySnapshot = await getDocs(q);
    
    searchResults.innerHTML = '';

    querySnapshot.forEach((doc) => {
        const clientData = doc.data();
        const resultDiv = document.createElement('div');
        resultDiv.classList.add('result-entry');
        resultDiv.innerHTML = `
            <div>
                <p>Company Name: ${clientData.companyName}</p>
                <p>Email: ${clientData.email}</p>
            </div>
            <button onclick="selectClient('${doc.id}')">Select</button>
        `;
        searchResults.appendChild(resultDiv);
    });

    if (querySnapshot.empty) {
        searchResults.innerHTML = '<p class="no-results">No companies found.</p>';
    }
}

window.selectClient = function(clientId) {
    selectedClientId = clientId;
    document.getElementById('assign-shooting-form').style.display = 'block';
}

window.assignShooting = async function() {
    if (!selectedClientId) {
        alert('Please select a client first.');
        return;
    }

    const shootingDate = document.getElementById('shooting-date').value;
    const shootingType = document.getElementById('shooting-type').value;
    const shootingAddress = document.getElementById('shooting-address').value;
    const shootingCity = document.getElementById('shooting-city').value;
    const shootingAdditionalInfo = document.getElementById('shooting-additional-info').value;
    const shootingPhotos = document.getElementById('shooting-photos').files;

    try {
        const newShootingRef = await addDoc(collection(db, "requests"), {
            userId: selectedClientId,
            date: shootingDate,
            shootingType: shootingType,
            address: shootingAddress,
            city: shootingCity,
            additionalInfo: shootingAdditionalInfo,
            createdAt: new Date()
        });

        const shootingId = newShootingRef.id;

        // Store metadata in "depot" collection
        await addDoc(collection(db, "depot"), {
            userId: selectedClientId,
            shootingId: shootingId,
            date: shootingDate,
            shootingType: shootingType,
            address: shootingAddress,
            city: shootingCity,
            additionalInfo: shootingAdditionalInfo,
            createdAt: new Date()
        });

        // Upload photos
        for (let i = 0; i < shootingPhotos.length; i++) {
            const photo = shootingPhotos[i];
            const storageRef = ref(storage, `shootings/${selectedClientId}/${shootingId}/${photo.name}`);
            await uploadBytes(storageRef, photo);
        }

        alert('Shooting assigned successfully.');
    } catch (error) {
        alert('Error assigning shooting: ' + error.message);
    }
}

window.logout = function() {
    signOut(auth).then(() => {
        window.location.replace('index.html');
    }).catch((error) => {
        console.error("Error signing out: ", error);
    });
}
