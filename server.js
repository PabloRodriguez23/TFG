const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de la conexión a MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'red_social_fotos'
});

// Conectar a MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error de conexión a MySQL:', err);
    return;
  }
  console.log('Conexión a MySQL establecida');
});

// Middleware para analizar datos JSON
app.use(bodyParser.json());

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para manejar el inicio de sesión
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Consulta para buscar el usuario en la base de datos
    const query = `SELECT * FROM Usuario WHERE username = '${username}' AND password = '${password}'`;
    connection.query(query, (err, result) => {
      if (err) {
        console.error('Error al buscar el usuario en la base de datos:', err);
        res.status(500).json({ message: 'Error del servidor' });
        return;
      }

      if (result.length > 0) {
        // Si se encuentra el usuario, responder con el usuario
        res.status(200).json(result[0]);
      } else {
        // Si no se encuentra el usuario, responder con un estado 401 Unauthorized
        res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
      }
    });
  } catch (error) {
    console.error('Error de inicio de sesión:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor en funcionamiento en http://localhost:${PORT}`);
});