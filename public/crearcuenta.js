document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const errorMessage = document.getElementById('error-message');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Evita que el formulario se envíe de forma predeterminada

        // Obtener los datos del formulario
        const formData = new FormData(form);

        // Crear un objeto para almacenar los datos del usuario
        const userData = {};
        formData.forEach((value, key) => {
            userData[key] = value;
        });

        // Enviar la solicitud al servidor para crear el usuario
        fetch('/crearusuario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al crear el usuario');
            }
            return response.json();
        })
        .then(data => {
            // Aquí puedes manejar la respuesta del servidor después de crear el usuario
            console.log('Usuario creado exitosamente:', data);
            // Por ejemplo, podrías redirigir al usuario a otra página
            window.location.href = '/index.html';
        })
        .catch(error => {
            // Verificar si el error es debido a que el nombre de usuario ya está en uso
            if (error.message === 'El nombre de usuario ya está en uso') {
                alert('El nombre de usuario ya está en uso. Por favor, elige otro.');
            } else {
                // Mostrar mensaje de error genérico
                alert('Error al crear el usuario. Inténtalo de nuevo.');
            }
            console.error('Error al crear el usuario:', error);
        });
        
        
    });
});
