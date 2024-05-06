const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Crear el directorio de uploads si no existe
const uploadDir = './uploads';
fs.mkdirSync(uploadDir, { recursive: true });

const corsOptions = {
  origin: function (origin, callback) {
      if (!origin || /localhost|mi-dominio.com|192.168.x.x/.test(origin)) {
          callback(null, true)
      } else {
          callback(new Error('CORS not allowed from this origin'));
      }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

//app.use(cors(corsOptions));
app.use(cors());


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
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Solo se permiten imágenes'), false);
        }
        cb(null, true);
    }
});

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
app.use('/uploads', express.static(uploadDir));
app.use(session({
    secret: 'secreto',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Cambiar a true si se usa HTTPS
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM Usuario WHERE usuario = ? AND contrasena = ?';

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

function requireLogin(req, res, next) {
  if (!req.session || !req.session.username) {
      // Si no hay un usuario logueado, envía un estado HTTP 401 (No autorizado)
      return res.status(401).send({ message: 'Debes estar logueado para realizar esta acción' });
  }
  // Si hay un usuario logueado, continúa con el middleware siguiente
  next();
}


app.post('/upload', requireLogin, upload.single('photo'), (req, res) => {
  const file = req.file;
  const comment = req.body.comment;
  const username = req.session.username;  // Esto asume que el username está almacenado en la sesión
  
  if (!file) {
      return res.status(400).send({ message: 'Por favor, sube un archivo' });
  }
  
  const insertQuery = 'INSERT INTO Fotos (username, comment, filepath) VALUES (?, ?, ?)';
  connection.query(insertQuery, [username, comment, file.path], (err, result) => {
      if (err) {
          console.error('Error al insertar datos en la base de datos:', err);
          return res.status(500).send({ message: 'Error al guardar la imagen en la base de datos' });
      }
      res.status(201).send({ message: 'Imagen subida y datos guardados exitosamente' });
  });
});


app.get('/photos', (req, res) => {
  const query = 'SELECT * FROM fotos ORDER BY created_at DESC';
  connection.query(query, (err, results) => {
      if (err) {
          console.error('Error al consultar la base de datos:', err);
          return res.status(500).send({ message: 'Error al recuperar las fotos' });
      }
      
      const photos = results.map(photo => {
        return {
            imageUrl: `/${photo.filepath.replace(/\\/g, '/')}`, // Reemplaza las barras invertidas con barras normales
            username: photo.username,
            timestamp: photo.created_at,
            comment: photo.comment
        };
    });
      res.json(photos);
  });
});

app.get('/user-data', requireLogin, (req, res) => {
    const usuario = req.query.username;  // Asegúrate de que el nombre del parámetro coincida con cómo lo envías desde el cliente.
    if (!usuario) {
        return res.status(400).json({ message: 'No username provided' });
    }

    const query = 'SELECT usuario, email FROM Usuario WHERE usuario = ?'; // Asegúrate de que 'usuario' es el nombre correcto de la columna.
    connection.query(query, [usuario], (err, results) => {
        if (err) {
            console.error('Error fetching user data:', err);
            return res.status(500).json({ message: 'Error fetching user data' });
        }
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    });
});



// Ruta para obtener las fotos de un usuario específico
app.get('/user-photos', requireLogin, (req, res) => {
    const username = req.query.username;
    if (!username) {
        return res.status(400).json({ message: 'No username provided' });
    }

    const query = 'SELECT * FROM Fotos WHERE username = ? ORDER BY created_at DESC';
    connection.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error fetching photos:', err);
            return res.status(500).json({ message: 'Error fetching photos' });
        }
        const photos = results.map(photo => ({
            id: photo.id,
            imageUrl: `/${photo.filepath.replace(/\\/g, '/')}`,
            username: photo.username,
            timestamp: photo.created_at,
            comment: photo.comment
        }));
        res.json(photos);
    });
});

// Ruta para actualizar una foto
app.put('/update-photo/:photoId', requireLogin, (req, res) => {
    const { photoId } = req.params;
    const { comment } = req.body;
    const username = req.session.username;  // Asegurar que solo el dueño puede editar

    const updateQuery = 'UPDATE Fotos SET comment = ? WHERE id = ? AND username = ?';
    connection.query(updateQuery, [comment, photoId, username], (err, result) => {
        if (err) {
            console.error('Error updating photo:', err);
            return res.status(500).send({ message: 'Error updating photo' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Photo not found or permission denied' });
        }
        res.send({ message: 'Photo updated successfully' });
    });
});

// Ruta para eliminar una foto
app.delete('/delete-photo/:photoId', requireLogin, (req, res) => {
    const { photoId } = req.params; // Extraer el ID de la foto de los parámetros de la ruta
    const username = req.session.username;  // Esto asume que el username está almacenado en la sesión

    // Verificar que el ID de la foto es un número válido
    if (!photoId || isNaN(photoId)) {
        return res.status(400).send({ message: 'Invalid photo ID' });
    }

    const deleteQuery = 'DELETE FROM Fotos WHERE id = ? AND username = ?';

    // Ejecutar la consulta para eliminar la foto
    connection.query(deleteQuery, [parseInt(photoId), username], (err, result) => {
        if (err) {
            console.error('Error deleting photo:', err);
            return res.status(500).send({ message: 'Error deleting photo' });
        }

        // Verificar si se eliminó alguna fila
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Photo not found or permission denied' });
        }

        // Enviar respuesta de éxito
        res.send({ message: 'Photo deleted successfully' });
    });
});




app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor accesible en la red local mediante la ip 192.168.0.23:${PORT} o mi-dominio.com`);
});
