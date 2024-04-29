document.addEventListener('DOMContentLoaded', function() {
  const loadingIndicator = document.getElementById('loading');
  loadingIndicator.style.display = 'block'; // Mostrar el spinner de carga

  const form = document.querySelector('.login-container form');

  form.addEventListener('submit', function(event) {
      event.preventDefault(); // Evitar que el formulario se envíe

      const username = form.username.value;
      const password = form.password.value;

      // Enviar solicitud al servidor para validar las credenciales del usuario
      fetch('/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
      })
      .then(response => {
          if (response.ok) {
              return response.json();
          } else {
              throw new Error('Usuario o contraseña incorrectos');
          }
      })
      .then(data => {
          // Si las credenciales son válidas, redirigir a la página de feed
          window.location.href = 'feed.html';
      })
      .catch(error => {
          // Mostrar un mensaje de error en caso de credenciales incorrectas
          alert(error.message);
          console.error('Error de inicio de sesión:', error);
      });
  });

  // Obtener fotos después de iniciar sesión
  fetch('/photos')
    .then(response => response.json())
    .then(photos => {
      loadingIndicator.style.display = 'none'; // Ocultar el spinner
      const container = document.querySelector('.feed-container');
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
    });
});
