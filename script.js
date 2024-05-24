document.getElementById('reservationForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        datetime: document.getElementById('datetime').value,
        package: document.getElementById('package').value,
        notes: document.getElementById('notes').value
    };

    fetch('https://api.example.com/reservations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('reservationForm').style.display = 'none';
        document.getElementById('confirmation').style.display = 'block';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Une erreur est survenue lors de la soumission de votre demande. Veuillez réessayer.');
    });
});
