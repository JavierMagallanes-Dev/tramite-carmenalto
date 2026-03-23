-- =============================================
-- 03_seed.sql — Datos iniciales
-- =============================================

-- Roles
INSERT INTO roles (nombre, descripcion) VALUES
    ('Administrador', 'Acceso total al sistema'),
    ('Mesa de Partes',  'Registra y deriva expedientes'),
    ('Jefe de Area',    'Supervisa y resuelve en su área'),
    ('Tecnico',         'Atiende expedientes asignados');

-- Áreas (sin jefe_id por ahora, se actualiza después)
INSERT INTO areas (nombre, sigla) VALUES
    ('Mesa de Partes',                         'MDP'),
    ('Subgerencia de Autorizaciones y Licencias','SAL'),
    ('Gerencia de Desarrollo Urbano y Rural',   'GDUR'),
    ('Subgerencia de Rentas y Tributacion',     'SRT'),
    ('Subgerencia de Registros Civiles',        'SRC'),
    ('Area de Fiscalizacion y Control',         'AFC'),
    ('Defensa Civil',                           'DC'),
    ('Gerencia de Servicios Municipales',       'GSM'),
    ('Asesoria Juridica',                       'AJ'),
    ('Gerencia Municipal',                      'GM'),
    ('Alcaldia',                                'ALC');

-- Usuarios de prueba (password: Admin123! — hash bcrypt salt=12)
INSERT INTO usuarios (dni, nombres, apellidos, correo, password_hash, area_id, rol_id) VALUES
(
    '12345678','Admin','Sistema',
    'admin@carmenalto.gob.pe',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMqJqhCanzi3rm5Isgp4/Go9P2',
    (SELECT id FROM areas WHERE sigla='MDP'),
    (SELECT id FROM roles WHERE nombre='Administrador')
),
(
    '23456789','Maria','Lopez',
    'mesa@carmenalto.gob.pe',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMqJqhCanzi3rm5Isgp4/Go9P2',
    (SELECT id FROM areas WHERE sigla='MDP'),
    (SELECT id FROM roles WHERE nombre='Mesa de Partes')
),
(
    '34567890','Juan','Quispe',
    'tecnico.sal@carmenalto.gob.pe',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMqJqhCanzi3rm5Isgp4/Go9P2',
    (SELECT id FROM areas WHERE sigla='SAL'),
    (SELECT id FROM roles WHERE nombre='Tecnico')
),
(
    '45678901','Rosa','Flores',
    'jefe.sal@carmenalto.gob.pe',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMqJqhCanzi3rm5Isgp4/Go9P2',
    (SELECT id FROM areas WHERE sigla='SAL'),
    (SELECT id FROM roles WHERE nombre='Jefe de Area')
),
(
    '56789012','Carlos','Huaman',
    'tecnico.dc@carmenalto.gob.pe',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMqJqhCanzi3rm5Isgp4/Go9P2',
    (SELECT id FROM areas WHERE sigla='DC'),
    (SELECT id FROM roles WHERE nombre='Tecnico')
),
(
    '67890123','Luis','Mendoza',
    'gerente@carmenalto.gob.pe',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMqJqhCanzi3rm5Isgp4/Go9P2',
    (SELECT id FROM areas WHERE sigla='GM'),
    (SELECT id FROM roles WHERE nombre='Jefe de Area')
);

-- Tipos de trámite
INSERT INTO tipos_tramite (nombre, dias_habiles, costo_soles, area_destino_id) VALUES
    ('Licencia de funcionamiento nueva',       15, 85.00, (SELECT id FROM areas WHERE sigla='SAL')),
    ('Renovacion de licencia de funcionamiento',10, 45.00, (SELECT id FROM areas WHERE sigla='SAL')),
    ('Autorizacion de anuncio publicitario',    8, 30.00, (SELECT id FROM areas WHERE sigla='SAL')),
    ('Licencia de construccion',               20,120.00, (SELECT id FROM areas WHERE sigla='GDUR')),
    ('Certificado de parametros urbanisticos',  7, 25.00, (SELECT id FROM areas WHERE sigla='GDUR')),
    ('Constancia de no adeudo tributario',      3, 10.00, (SELECT id FROM areas WHERE sigla='SRT')),
    ('Fraccionamiento de deuda tributaria',    10,  0.00, (SELECT id FROM areas WHERE sigla='SRT')),
    ('Partida de nacimiento',                   3,  5.00, (SELECT id FROM areas WHERE sigla='SRC')),
    ('Rectificacion de partida registral',     15, 20.00, (SELECT id FROM areas WHERE sigla='SRC')),
    ('Autorizacion de evento publico',          7, 50.00, (SELECT id FROM areas WHERE sigla='GSM'));