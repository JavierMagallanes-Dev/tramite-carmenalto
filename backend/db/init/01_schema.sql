-- =============================================
-- SISTEMA TRÁMITE DOCUMENTARIO
-- Municipalidad Distrital de Carmen Alto
-- 01_schema.sql — Estructura de tablas
-- =============================================

-- Roles del sistema
CREATE TABLE roles (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

-- Áreas municipales
CREATE TABLE areas (
    id       SERIAL PRIMARY KEY,
    nombre   VARCHAR(100) NOT NULL,
    sigla    VARCHAR(10)  NOT NULL UNIQUE,
    jefe_id  INT,
    activo   BOOLEAN NOT NULL DEFAULT TRUE
);

-- Usuarios del sistema
CREATE TABLE usuarios (
    id               SERIAL PRIMARY KEY,
    dni              VARCHAR(8)   NOT NULL UNIQUE,
    nombres          VARCHAR(100) NOT NULL,
    apellidos        VARCHAR(100) NOT NULL,
    correo           VARCHAR(150) NOT NULL UNIQUE,
    password_hash    VARCHAR(255) NOT NULL,
    area_id          INT REFERENCES areas(id),
    rol_id           INT NOT NULL REFERENCES roles(id),
    intentos_fallidos INT NOT NULL DEFAULT 0,
    bloqueado_hasta  TIMESTAMP,
    activo           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- FK circular: areas.jefe_id → usuarios.id (se agrega después)
ALTER TABLE areas ADD CONSTRAINT fk_jefe
    FOREIGN KEY (jefe_id) REFERENCES usuarios(id);

-- Tipos de trámite (catálogo TUPA)
CREATE TABLE tipos_tramite (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(200) NOT NULL,
    dias_habiles    INT          NOT NULL,
    costo_soles     NUMERIC(8,2) NOT NULL DEFAULT 0,
    area_destino_id INT          NOT NULL REFERENCES areas(id),
    activo          BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Ciudadanos (solicitantes)
CREATE TABLE ciudadanos (
    id              SERIAL PRIMARY KEY,
    tipo_doc        VARCHAR(10)  NOT NULL DEFAULT 'DNI',
    nro_documento   VARCHAR(20)  NOT NULL,
    nombre_completo VARCHAR(200) NOT NULL,
    correo          VARCHAR(150),
    celular         VARCHAR(15),
    UNIQUE(tipo_doc, nro_documento)
);

-- Expedientes (núcleo del sistema)
CREATE TABLE expedientes (
    id               SERIAL PRIMARY KEY,
    codigo           VARCHAR(20)  NOT NULL UNIQUE,
    ciudadano_id     INT          NOT NULL REFERENCES ciudadanos(id),
    tipo_tramite_id  INT          NOT NULL REFERENCES tipos_tramite(id),
    area_actual_id   INT          NOT NULL REFERENCES areas(id),
    creado_por_id    INT          NOT NULL REFERENCES usuarios(id),
    estado           VARCHAR(30)  NOT NULL DEFAULT 'Recibido',
    prioridad        VARCHAR(10)  NOT NULL DEFAULT 'Normal',
    asunto           TEXT         NOT NULL,
    fecha_limite     DATE         NOT NULL,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_estado CHECK (estado IN (
        'Recibido','En proceso','Observado',
        'Derivado','Resuelto','Archivado'
    )),
    CONSTRAINT chk_prioridad CHECK (prioridad IN ('Normal','Urgente','Muy urgente'))
);

-- Movimientos / trazabilidad
CREATE TABLE movimientos (
    id               SERIAL PRIMARY KEY,
    expediente_id    INT          NOT NULL REFERENCES expedientes(id),
    usuario_id       INT          NOT NULL REFERENCES usuarios(id),
    tipo_accion      VARCHAR(50)  NOT NULL,
    comentario       TEXT,
    area_origen_id   INT          REFERENCES areas(id),
    area_destino_id  INT          REFERENCES areas(id),
    estado_resultado VARCHAR(30),
    fecha_hora       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Documentos adjuntos
CREATE TABLE documentos (
    id               SERIAL PRIMARY KEY,
    expediente_id    INT          NOT NULL REFERENCES expedientes(id),
    subido_por_id    INT          NOT NULL REFERENCES usuarios(id),
    nombre_original  VARCHAR(255) NOT NULL,
    nombre_uuid      VARCHAR(255) NOT NULL UNIQUE,
    ruta_storage     VARCHAR(500) NOT NULL,
    etapa            VARCHAR(50)  NOT NULL DEFAULT 'Solicitud',
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Notificaciones por email
CREATE TABLE notificaciones (
    id                SERIAL PRIMARY KEY,
    expediente_id     INT          NOT NULL REFERENCES expedientes(id),
    destinatario_email VARCHAR(150) NOT NULL,
    tipo_evento       VARCHAR(50)  NOT NULL,
    estado_envio      VARCHAR(20)  NOT NULL DEFAULT 'Pendiente',
    enviado_at        TIMESTAMP,
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_estado_envio CHECK (
        estado_envio IN ('Pendiente','Enviado','Error')
    )
);

-- Bitácora de auditoría
CREATE TABLE bitacora_auditoria (
    id               SERIAL PRIMARY KEY,
    tabla_afectada   VARCHAR(50)  NOT NULL,
    operacion        VARCHAR(10)  NOT NULL,
    id_registro      INT          NOT NULL,
    datos_anteriores JSONB,
    datos_nuevos     JSONB,
    usuario_id       INT          REFERENCES usuarios(id),
    ip_usuario       INET,
    fecha_hora       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Índices compuestos para búsquedas frecuentes
CREATE INDEX idx_expedientes_estado    ON expedientes(estado);
CREATE INDEX idx_expedientes_area      ON expedientes(area_actual_id);
CREATE INDEX idx_expedientes_ciudadano ON expedientes(ciudadano_id);
CREATE INDEX idx_expedientes_fecha     ON expedientes(fecha_limite);
CREATE INDEX idx_movimientos_exp       ON movimientos(expediente_id);
CREATE INDEX idx_notificaciones_estado ON notificaciones(estado_envio);
CREATE INDEX idx_bitacora_tabla        ON bitacora_auditoria(tabla_afectada, fecha_hora);