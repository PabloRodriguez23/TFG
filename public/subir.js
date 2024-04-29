document.getElementById('photo').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            const previewImage = document.getElementById('previewImage');
            const previewComment = document.getElementById('previewComment');
            const previewUser = document.getElementById('previewUser'); // Elemento para el nombre del usuario
            const previewDiv = document.getElementById('preview');

            previewImage.src = e.target.result;
            previewDiv.style.display = 'block';

            // Actualizar el comentario en la vista previa
            const commentInput = document.getElementById('comment');
            previewComment.textContent = commentInput.value || 'No hay comentario';
            
            // Actualizar el nombre del usuario en la vista previa
            const username = localStorage.getItem('username'); // Obtener el nombre de usuario del almacenamiento local
            previewUser.textContent = `Usuario: ${username}`;

            // Evitar la duplicación de event listeners
            commentInput.removeEventListener('input', updatePreviewComment);
            commentInput.addEventListener('input', updatePreviewComment);
        };

        reader.readAsDataURL(file);
    }
});

function updatePreviewComment() {
    const commentInput = document.getElementById('comment');
    const previewComment = document.getElementById('previewComment');
    previewComment.textContent = commentInput.value || 'No hay comentario';
}

function uploadPhoto() {
    const photoInput = document.getElementById('photo');
    const commentInput = document.getElementById('comment');

    if (photoInput.files.length > 0) {
        const formData = new FormData();
        formData.append('photo', photoInput.files[0]);
        formData.append('comment', commentInput.value);
        
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Éxito:', data);
            // Redirigir al feed
            window.location.href = 'feed.html';
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Hubo un problema con la subida de tu foto. Por favor, inténtalo de nuevo.');
        });
    } else {
        alert('Por favor, selecciona un archivo de imagen.');
    }
}
