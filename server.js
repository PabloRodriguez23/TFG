const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
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

// Configuración de almacenamiento para Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Conectar a MySQL
connection.connect(err => {
  if (err) {
    console.error('Error de conexión a MySQL:', err);
    return;
  }
  console.log('Conexión a MySQL establecida');
});

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'secreto',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM Usuario WHERE usuario = ? AND contrasena = ?`;

  connection.query(query, [username, password], (err, result) => {
    if (err) {
      console.error('Error al buscar el usuario en la base de datos:', err);
      return res.status(500).json({ message: 'Error del servidor' });
    }
    if (result.length > 0) {
      req.session.username = username;
      res.status(200).json({ username: username, message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }
  });
});

app.post('/crearusuario', (req, res) => {
  const { username, password, nombre, apellidos, email, edad } = req.body;
  const userQuery = `SELECT * FROM Usuario WHERE usuario = ?`;

  connection.query(userQuery, [username], (err, result) => {
    if (err) {
      console.error('Error al buscar el usuario en la base de datos:', err);
      return res.status(500).json({ message: 'Error del servidor' });
    }
    if (result.length > 0) {
      return res.status(409).json({ message: 'El nombre de usuario ya está en uso' });
    }
    const insertQuery = `INSERT INTO Usuario (usuario, contrasena, nombre, apellidos, email, edad) VALUES (?, ?, ?, ?, ?, ?)`;
    connection.query(insertQuery, [username, password, nombre, apellidos, email, edad], (err, result) => {
      if (err) {
        console.error('Error al insertar el nuevo usuario en la base de datos:', err);
        return res.status(500).json({ message: 'Error del servidor' });
      }
      res.status(201).json({ message: 'Usuario creado exitosamente' });
    });
  });
});

app.get('/dashboard', requireLogin, (req, res) => {
  res.send(`Bienvenido, ${req.session.username}!`);
});

function requireLogin(req, res, next) {
  if (!req.session.username) {
    return res.redirect('/login');
  }
  next();
}

app.post('/upload', upload.single('photo'), (req, res) => {
  const file = req.file;
  const comment = req.body.comment;
  const username = req.session.username;
  if (!file) {
    return res.status(400).send({ message: 'Por favor, sube un archivo' });
  }
  const insertQuery = 'INSERT INTO Fotos (usuario, comentario, ruta_archivo) VALUES (?, ?, ?)';
  connection.query(insertQuery, [username, comment, file.path], (err, result) => {
    if (err) {
      console.error('Error al insertar datos en la base de datos:', err);
      return res.status(500).send({ message: 'Error al guardar la imagen en la base de datos' });
    }
    res.status(201).send({ message: 'Imagen subida y datos guardados exitosamente' });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor en funcionamiento en http://localhost:${PORT}`);
});
