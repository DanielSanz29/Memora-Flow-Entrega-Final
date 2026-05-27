CREATE DATABASE IF NOT EXISTS memora_flow
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE memora_flow;

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE TABLE IF NOT EXISTS rol (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol_id INT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rol_id) REFERENCES rol(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cliente_responsable (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dni VARCHAR(15) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(150) NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(150),
  direccion VARCHAR(255),
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fallecido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dni VARCHAR(15) NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(150) NOT NULL,
  fecha_defuncion DATE,
  lugar_defuncion VARCHAR(150),
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS expediente (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  cliente_id INT NOT NULL,
  fallecido_id INT NOT NULL,
  fecha_apertura DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado VARCHAR(30) NOT NULL DEFAULT 'abierto',
  FOREIGN KEY (cliente_id) REFERENCES cliente_responsable(id),
  FOREIGN KEY (fallecido_id) REFERENCES fallecido(id),
  INDEX idx_expediente_cliente (cliente_id),
  INDEX idx_expediente_fallecido (fallecido_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS estado_orden (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  orden_logico INT NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orden_funeraria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  expediente_id INT NOT NULL,
  tipo_servicio ENUM('incineracion','inhumacion') NOT NULL,
  estado_id INT NOT NULL,
  total_estimado DECIMAL(10,2) NOT NULL DEFAULT 0,
  observacion_general TEXT,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NULL,
  FOREIGN KEY (expediente_id) REFERENCES expediente(id),
  FOREIGN KEY (estado_id) REFERENCES estado_orden(id),
  INDEX idx_orden_expediente (expediente_id),
  INDEX idx_orden_estado (estado_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categoria_producto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS producto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categoria_id INT NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  descripcion VARCHAR(255),
  precio_base DECIMAL(10,2) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (categoria_id) REFERENCES categoria_producto(id),
  INDEX idx_producto_categoria (categoria_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS detalle_orden (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orden_id INT NOT NULL,
  producto_id INT NULL,
  concepto VARCHAR(150) NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orden_id) REFERENCES orden_funeraria(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES producto(id),
  INDEX idx_detalle_orden (orden_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS servicio_complementario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  precio_base DECIMAL(10,2) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orden_servicio_complementario (
  orden_id INT NOT NULL,
  servicio_id INT NOT NULL,
  precio_aplicado DECIMAL(10,2) NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (orden_id, servicio_id),
  FOREIGN KEY (orden_id) REFERENCES orden_funeraria(id) ON DELETE CASCADE,
  FOREIGN KEY (servicio_id) REFERENCES servicio_complementario(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS observacion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orden_id INT NOT NULL,
  usuario_id INT NOT NULL,
  texto TEXT NOT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orden_id) REFERENCES orden_funeraria(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  INDEX idx_observacion_orden (orden_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS auditoria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  entidad VARCHAR(80) NOT NULL,
  entidad_id INT NOT NULL,
  accion VARCHAR(80) NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  detalle VARCHAR(255),
  FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  INDEX idx_auditoria_entidad (entidad, entidad_id)
) ENGINE=InnoDB;
