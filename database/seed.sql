-- =========================================================
-- SaludYa - Portal Web de Gestión Hospitalaria
-- Datos de demostración (semilla)
-- Fase 6 - Docker
-- =========================================================
-- Se ejecuta automáticamente después de schema.sql cuando el
-- contenedor de PostgreSQL crea su volumen de datos por primera
-- vez (docker-entrypoint-initdb.d ejecuta los scripts en orden
-- alfabético). Es idempotente vía ON CONFLICT DO NOTHING, por lo
-- que también puede correrse manualmente sin duplicar datos.
--
-- Credenciales de demostración:
--   Administrador:  admin@saludya.com     / Admin1234
--   Paciente:       paciente@saludya.com  / Paciente1234
-- Los hashes de abajo son bcrypt reales (costo 12), generados y
-- verificados contra estas contraseñas en texto plano.
-- =========================================================

BEGIN;

-- ---------------------------------------------------------
-- Usuarios: administrador y paciente de demostración
-- ---------------------------------------------------------
INSERT INTO usuarios (email, password_hash, nombre, apellido, rol, is_active)
VALUES
    ('admin@saludya.com', '$2b$12$sPl8mt0cIeWBWSRXTrQUcOcS.dZYJyEOJY6LSqLJCD9LIGbatM5EW', 'Admin', 'SaludYa', 'administrador', true),
    ('paciente@saludya.com', '$2b$12$B15X.EIH2t2dOt2XdPSix.7BBSvZ3Q3z75jK6TleV42Dx5APk2Qzy', 'Paciente', 'Demo', 'paciente', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO pacientes (usuario_id, documento_identidad, telefono, direccion, fecha_nacimiento)
SELECT id, '1000000001', '+1 (555) 000-0001', 'Calle Demo 123, Ciudad', '1995-05-20'
FROM usuarios WHERE email = 'paciente@saludya.com'
ON CONFLICT (usuario_id) DO NOTHING;

-- ---------------------------------------------------------
-- Especialidades
-- ---------------------------------------------------------
INSERT INTO especialidades (nombre, descripcion) VALUES
    ('Medicina General', 'Atención primaria, chequeos generales y derivación a especialistas.'),
    ('Pediatría', 'Atención médica integral para niños y adolescentes.'),
    ('Cardiología', 'Diagnóstico y tratamiento de enfermedades del corazón.'),
    ('Dermatología', 'Diagnóstico y tratamiento de enfermedades de la piel.'),
    ('Ginecología', 'Salud del sistema reproductivo femenino.'),
    ('Oftalmología', 'Diagnóstico y tratamiento de enfermedades de los ojos.'),
    ('Ortopedia', 'Diagnóstico y tratamiento de lesiones y enfermedades del sistema musculoesquelético.'),
    ('Psicología', 'Evaluación y acompañamiento en salud mental.')
ON CONFLICT (nombre) DO NOTHING;

-- ---------------------------------------------------------
-- Médicos
-- ---------------------------------------------------------
INSERT INTO medicos (documento_identidad, nombre, apellido, email, telefono) VALUES
    ('2000000001', 'Laura', 'Martínez', 'laura.martinez@saludya.com', '+1 (555) 100-0001'),
    ('2000000002', 'Carlos', 'Gómez', 'carlos.gomez@saludya.com', '+1 (555) 100-0002'),
    ('2000000003', 'Ana', 'Rodríguez', 'ana.rodriguez@saludya.com', '+1 (555) 100-0003'),
    ('2000000004', 'Julián', 'Pérez', 'julian.perez@saludya.com', '+1 (555) 100-0004'),
    ('2000000005', 'Camila', 'Torres', 'camila.torres@saludya.com', '+1 (555) 100-0005'),
    ('2000000006', 'Andrés', 'Ramírez', 'andres.ramirez@saludya.com', '+1 (555) 100-0006')
ON CONFLICT (documento_identidad) DO NOTHING;

-- ---------------------------------------------------------
-- Relación médico <-> especialidad
-- ---------------------------------------------------------
INSERT INTO medico_especialidad (medico_id, especialidad_id)
SELECT m.id, e.id FROM medicos m, especialidades e
WHERE (m.documento_identidad, e.nombre) IN (
    ('2000000001', 'Medicina General'),
    ('2000000001', 'Cardiología'),
    ('2000000002', 'Pediatría'),
    ('2000000003', 'Dermatología'),
    ('2000000003', 'Ginecología'),
    ('2000000004', 'Ortopedia'),
    ('2000000005', 'Oftalmología'),
    ('2000000006', 'Psicología'),
    ('2000000006', 'Medicina General')
)
ON CONFLICT DO NOTHING;

COMMIT;
