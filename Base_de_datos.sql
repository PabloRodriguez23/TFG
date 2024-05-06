CREATE TABLE Usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR2(50)
    nombre VARCHAR2(50),
    apellidos VARCHAR2(50),
    email VARCHAR2(100),
    edad INT,
    contrasena VARCHAR2(50)
);

INSERT INTO Usuario (usuario, nombre, apellidos, email, edad, contrasena) VALUES
('root', 'Pablo Luis', 'Rodriguez Galvez', 'pablo.r.galvez.pr@gmail.com', 21, 'root'),
('juan87', 'Juan', 'López', 'juan87@example.com', 32, 'contrasena1'),
('maria92', 'María', 'González', 'maria92@example.com', 28, 'contrasena2'),
('pablo45', 'Pablo', 'Martínez', 'pablo45@example.com', 35, 'contrasena3'),
('laura65', 'Laura', 'Sánchez', 'laura65@example.com', 40, 'contrasena4'),
('carlos73', 'Carlos', 'Rodríguez', 'carlos73@example.com', 29, 'contrasena5'),
('ana81', 'Ana', 'Fernández', 'ana81@example.com', 33, 'contrasena6'),
('david29', 'David', 'Pérez', 'david29@example.com', 27, 'contrasena7'),
('raquel56', 'Raquel', 'López', 'raquel56@example.com', 38, 'contrasena8'),
('luis68', 'Luis', 'García', 'luis68@example.com', 31, 'contrasena9'),
('carmen74', 'Carmen', 'Martínez', 'carmen74@example.com', 36, 'contrasena10');

CREATE TABLE Fotos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    comment TEXT,
    filepath VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES Usuario(username)
);