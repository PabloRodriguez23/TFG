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
    fetch(`/user-data?username=${username}`)
    .then(response => response.json())
    .then(data => {
        userEmailElement.textContent = `${data.email}`;

        // Cargar fotos del usuario
        fetch(`/user-photos?username=${username}`)
        .then(response => response.json())
        .then(photos => {
            photos.forEach(photo => {
                const photoDiv = document.createElement('div');
                photoDiv.id = `photo-${photo.id}`;
                photoDiv.className = 'photo-entry';
                photoDiv.innerHTML = `
                    <img src="${photo.imageUrl}" alt="Foto subida por el usuario" class="clickable-image">
                    <div class="photo-info">
                        <p class="comment">${photo.comment}</p>
                        <p class="timestamp">${new Date(photo.timestamp).toLocaleString()}</p>
                        <button onclick="editPhoto('${photo.id}')">Editar</button>
                        <button onclick="deletePhoto('${photo.id}')">Eliminar</button>
                    </div>
                `;
                photosContainer.appendChild(photoDiv);
            });

            addImageModalEventListeners(); // Función para manejar clic en imágenes
        })
        .catch(error => {
            console.error('Error loading user photos:', error);
        });
    })
    .catch(error => {
        console.error('Error loading user profile:', error);
    });

    setupModalCloseEvent(); // Configurar evento para cerrar modal
});

function addImageModalEventListeners() {
    document.querySelectorAll('.clickable-image').forEach(image => {
        image.addEventListener('click', function() {
            const modal = document.getElementById('imageModal');
            const modalImg = document.getElementById('img01');
            const captionText = document.getElementById('caption');
            modal.style.display = "block";
            modalImg.src = this.src;
            captionText.textContent = this.alt;
        });
    });
}

function setupModalCloseEvent() {
    const span = document.getElementsByClassName("close")[0];
    span.onclick = function() {
        const modal = document.getElementById('imageModal');
        modal.style.display = "none";
    }
}

function editPhoto(photoId) {
    console.log("Editing photo with ID:", photoId);
    // Suponiendo que tienes un modal de edición ya definido en tu HTML
    const editModal = document.getElementById('editModal');
    const editComment = document.getElementById('editComment'); // Input para comentario en tu modal
    const photoEntry = document.querySelector(`#photo-${photoId} .comment`).textContent;

    // Prellenar el campo de comentario con el comentario actual
    editComment.value = photoEntry;

    // Mostrar modal de edición
    editModal.style.display = 'block';

    // Cuando se guarda el cambio
    document.getElementById('saveEdit').onclick = function() {
        const updatedComment = editComment.value;
        fetch(`/update-photo/${photoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ comment: updatedComment })
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to update photo');
            return response.json();
        })
        .then(data => {
            alert('Foto actualizada exitosamente');
            // Actualizar la UI sin recargar la página
            document.querySelector(`#photo-${photoId} .comment`).textContent = updatedComment;
            editModal.style.display = 'none';
        })
        .catch(error => {
            console.error('Error updating photo:', error);
            alert('Error actualizando la foto');
        });
    };

    // Cerrar modal sin guardar
    document.getElementById('cancelEdit').onclick = function() {
        editModal.style.display = 'none';
    };
}

function deletePhoto(photoId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
        fetch(`/delete-photo/${photoId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete photo');
            }
            return response.json();
        })
        .then(() => {
            alert('Foto eliminada con éxito');
            // Eliminar elemento del DOM
            const photoDiv = document.getElementById(`photo-${photoId}`);
            if (photoDiv) {
                photoDiv.parentNode.removeChild(photoDiv);
            } else {
                console.error('Element not found in DOM');
            }
        })
        .catch(error => {
            console.error('Error deleting photo:', error);
            alert(`Error eliminando la foto: ${error.message}`);
        });
    }
}

