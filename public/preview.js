document.getElementById('photo').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const previewImage = document.getElementById('previewImage');
        const previewComment = document.getElementById('previewComment');
        const previewDiv = document.getElementById('preview');

        previewImage.src = e.target.result;
        previewDiv.style.display = 'block';

        const commentInput = document.getElementById('comment');
        previewComment.textContent = commentInput.value || 'No hay comentario';
        
        commentInput.addEventListener('input', function() {
            previewComment.textContent = commentInput.value || 'No hay comentario';
        });
    };

    if (file) {
        reader.readAsDataURL(file);
    }
});

function uploadPhoto() {
    const photoInput = document.getElementById('photo');
    const commentInput = document.getElementById('comment');

    if (photoInput.files.length > 0) {
        const formData = new FormData();
        formData.append('photo', photoInput.files[0]);
        formData.append('comment', commentInput.value);
        
        // Suponiendo que el servidor espera recibir archivos en la ruta '/upload'
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Éxito:', data);
            // Redirigir al feed
            window.location.href = 'feed.html';
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    } else {
        alert('Por favor, selecciona un archivo de imagen.');
    }
}
