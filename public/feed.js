document.addEventListener('DOMContentLoaded', function() {
  const loadingIndicator = document.getElementById('loading');
  loadingIndicator.style.display = 'block'; // Mostrar el spinner de carga

  // Realiza la solicitud al servidor para obtener las fotos
  fetch('/photos')
  .then(response => {
      if (response.ok) {
          return response.json();
      } else {
          throw new Error('Failed to fetch photos');
      }
  })
  .then(photos => {
      loadingIndicator.style.display = 'none'; // Ocultar el spinner
      const container = document.querySelector('.feed-container');

      // Itera sobre cada foto y crea los elementos del DOM para mostrarlas
      photos.forEach(photo => {
          const div = document.createElement('div');
          div.className = 'photo-entry';
          div.innerHTML = `
              <img src="${photo.imageUrl}" alt="Foto de ${photo.username}">
              <div class="photo-info">
                  <p class="user">Usuario: ${photo.username}</p>
                  <p class="timestamp">${new Date(photo.timestamp).toLocaleString()}</p>
                  <p class="comment">${photo.comment}</p>
              </div>
          `;
          container.appendChild(div);
      });
  })
  .catch(error => {
      loadingIndicator.style.display = 'none'; // Ocultar el spinner en caso de error
      console.error('Error loading photos:', error);
      alert('Error cargando las fotos: ' + error.message);
  });
});
