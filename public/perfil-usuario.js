document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');
    console.log('User ID from URL:', userId);

    if (!userId) {
        alert('User ID is missing in the URL');
        window.location.href = 'buscar.html';
        return;
    }

    fetch(`/perfil-usuario/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
                window.location.href = 'buscar.html';
                return;
            }
            console.log('User profile data:', data);
            document.getElementById('username').textContent = `${data.nombre} ${data.apellidos} (${data.usuario})`;
            document.getElementById('user-email').textContent = data.email;

            return fetch(`/fotos-usuario/${userId}`);
        })
        .then(response => response.json())
        .then(photos => {
            console.log('User photos data:', photos);
            const photosContainer = document.querySelector('.photos-container');
            photosContainer.innerHTML = '';

            if (photos.length > 0) {
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
            } else {
                photosContainer.innerHTML = '<p>No se encontraron fotos</p>';
            }
        })
        .catch(error => console.error('Error fetching user profile or photos:', error));
});
