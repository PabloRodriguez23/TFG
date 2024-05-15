document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    searchButton.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query) {
            fetch(`/buscar-usuarios?q=${query}`)
                .then(response => response.json())
                .then(users => {
                    searchResults.innerHTML = ''; // Limpiar resultados anteriores
                    if (users.length > 0) {
                        users.forEach(user => {
                            const userDiv = document.createElement('div');
                            userDiv.className = 'user-entry';
                            userDiv.innerHTML = `
                                <p>${user.usuario} (${user.nombre} ${user.apellidos})</p>
                                <button onclick="viewUserProfile(${user.id})">Ver Perfil</button>
                            `;
                            searchResults.appendChild(userDiv);
                        });
                    } else {
                        searchResults.innerHTML = '<p>No se encontraron usuarios.</p>';
                    }
                })
                .catch(error => {
                    console.error('Error searching for users:', error);
                    searchResults.innerHTML = '<p>Error al buscar usuarios.</p>';
                });
        }
    });
});

function viewUserProfile(userId) {
    window.location.href = `perfil-usuario.html?userId=${userId}`;
}
