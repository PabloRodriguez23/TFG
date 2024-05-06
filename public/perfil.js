document.addEventListener('DOMContentLoaded', function() {
    const usernameElement = document.getElementById('username');
    const userEmailElement = document.getElementById('user-email');
    const photosContainer = document.querySelector('.photos-container');
    const username = localStorage.getItem('username'); // Obtener el nombre de usuario del almacenamiento local

    if (!username) {
        window.location.href = 'index.html'; // Redirigir al inicio si no hay sesión
    }

    usernameElement.textContent = `Nombre de Usuario: ${username}`;

    // Cargar datos del usuario
    fetch(`/user-data?username=${username}`)  // Asegúrate de que esta ruta esté correctamente configurada en tu servidor
    .then(response => response.json())
    .then(data => {
        userEmailElement.textContent = `${data.email}`;

        // Cargar fotos del usuario
        fetch(`/user-photos?username=${username}`)  // Asegúrate de que esta ruta esté correctamente configurada en tu servidor
        .then(response => response.json())
        .then(photos => {
            photos.forEach(photo => {
                const photoDiv = document.createElement('div');
                photoDiv.className = 'photo-entry';
                photoDiv.innerHTML = `
                    <img src="${photo.imageUrl}" alt="Foto subida por el usuario">
                    <div class="photo-info">
                        <p class="comment">${photo.comment}</p>
                        <p class="timestamp">${new Date(photo.timestamp).toLocaleString()}</p>
                        
                    </div>
                `;
                photosContainer.appendChild(photoDiv);
            });
        })
        .catch(error => {
            console.error('Error loading user photos:', error);
        });
    })
    .catch(error => {
        console.error('Error loading user profile:', error);
    });
});
