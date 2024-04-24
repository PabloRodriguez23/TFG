document.addEventListener('DOMContentLoaded', function() {
  const loadingIndicator = document.getElementById('loading');
  loadingIndicator.style.display = 'block'; // Mostrar el spinner de carga

  fetch('/photos')
    .then(response => response.json())
    .then(photos => {
      loadingIndicator.style.display = 'none'; // Ocultar el spinner
      const container = document.querySelector('.feed-container');
      photos.forEach(photo => {
        const div = document.createElement('div');
        div.className = 'photo-entry';
        div.innerHTML = `
          <img src="${photo.rutaImagen}" alt="Foto de ${photo.nombreUsuario}">
          <div class="photo-info">
            <p class="user">Usuario: ${photo.nombreUsuario}</p>
            <p class="timestamp">${new Date(photo.horaSubida).toLocaleString()}</p>
            <p class="comment">${photo.comentario}</p>
          </div>
        `;
        container.appendChild(div);
      });
    })
    .catch(error => {
      loadingIndicator.style.display = 'none'; // Ocultar el spinner en caso de error
      console.error('Error loading photos:', error);
    });
});
