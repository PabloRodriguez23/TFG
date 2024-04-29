document.addEventListener('DOMContentLoaded', function() {
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
        .then(response => response.json())
        .then(data => {
            if (data.username) {
                localStorage.setItem('username', data.username); // Guardar el nombre de usuario en el almacenamiento local
                window.location.href = 'feed.html'; // Redirigir a la página de feed
            } else {
                throw new Error(data.message || 'Usuario o contraseña incorrectos');
            }
        })
        .catch(error => {
            // Mostrar un mensaje de error en caso de problemas con la solicitud
            alert(error.message);
            console.error('Error de inicio de sesión:', error);
        });
    });
});
