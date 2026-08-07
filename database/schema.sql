-- =========================================================
-- SaludYa - Portal Web de Gestión Hospitalaria
-- Modelo físico de base de datos (PostgreSQL 15)
-- Fase 2 - Diseño de Base de Datos
-- =========================================================
-- Este script es idempotente: puede ejecutarse varias veces
-- sin fallar (usa IF NOT EXISTS / DROP ... IF EXISTS donde aplica).
-- =========================================================

BEGIN;

-- ---------------------------------------------------------
-- Función auxiliar: actualizar updated_at automáticamente
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------
-- Tabla: usuarios
-- Autenticación central para pacientes y administradores.
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    nombre          VARCHAR(100) NOT NULL,
    apellido        VARCHAR(100) NOT NULL,
    rol             VARCHAR(20)  NOT NULL CHECK (rol IN ('paciente', 'administrador')),
    is_active       BOOLEAN      NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON usuarios;
CREATE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------
-- Tabla: pacientes
-- Extensión 1:1 de usuarios (solo rol = 'paciente').
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS pacientes (
    id                    SERIAL PRIMARY KEY,
    usuario_id            INTEGER NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    documento_identidad   VARCHAR(30) NOT NULL UNIQUE,
    telefono              VARCHAR(20),
    direccion             VARCHAR(200),
    fecha_nacimiento      DATE,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------
-- Tabla: medicos
-- Recurso gestionado por el administrador (no inicia sesión).
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS medicos (
    id                    SERIAL PRIMARY KEY,
    documento_identidad   VARCHAR(30) NOT NULL UNIQUE,
    nombre                VARCHAR(100) NOT NULL,
    apellido              VARCHAR(100) NOT NULL,
    email                 VARCHAR(150) UNIQUE,
    telefono              VARCHAR(20),
    is_active             BOOLEAN NOT NULL DEFAULT true,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medicos_activo ON medicos(is_active);

-- ---------------------------------------------------------
-- Tabla: especialidades
-- Catálogo maestro de especialidades médicas.
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS especialidades (
    id            SERIAL PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL UNIQUE,
    descripcion   TEXT,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------
-- Tabla: medico_especialidad
-- Relación N:M entre médicos y especialidades.
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS medico_especialidad (
    medico_id        INTEGER NOT NULL REFERENCES medicos(id) ON DELETE CASCADE,
    especialidad_id  INTEGER NOT NULL REFERENCES especialidades(id) ON DELETE CASCADE,
    PRIMARY KEY (medico_id, especialidad_id)
);

-- ---------------------------------------------------------
-- Tabla: citas
-- Tabla transaccional central del sistema.
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS citas (
    id                    SERIAL PRIMARY KEY,
    paciente_id           INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    medico_id             INTEGER NOT NULL REFERENCES medicos(id) ON DELETE RESTRICT,
    especialidad_id       INTEGER NOT NULL REFERENCES especialidades(id) ON DELETE RESTRICT,
    fecha                 DATE NOT NULL,
    hora                  TIME NOT NULL,
    estado                VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                              CHECK (estado IN ('pendiente', 'completada', 'cancelada')),
    motivo_cancelacion    TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Regla de negocio: no domingos (0 = domingo en EXTRACT(DOW ...))
    CONSTRAINT chk_citas_no_domingo CHECK (EXTRACT(DOW FROM fecha) <> 0),

    -- Regla de negocio: horario permitido 7:00 - 17:00
    CONSTRAINT chk_citas_horario CHECK (hora >= TIME '07:00' AND hora <= TIME '17:00')
);

-- Regla de negocio: no dos citas ACTIVAS para el mismo médico a la misma
-- fecha/hora. Se usa un índice único PARCIAL (no un UNIQUE de tabla) a
-- propósito: un UNIQUE incondicional impediría agendar una nueva cita en un
-- horario cuya cita anterior fue cancelada, contradiciendo la HU-10
-- ("cancelar una cita libera el horario del médico"). Ver docs/fases/02-diseno-base-de-datos.md
-- sección 1.7 y app/models.py (Cita.__table_args__), que ya reflejaba esta
-- misma regla en el modelo SQLAlchemy.
CREATE UNIQUE INDEX IF NOT EXISTS uq_citas_medico_fecha_hora_activa
    ON citas (medico_id, fecha, hora)
    WHERE estado <> 'cancelada';

CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_medico_fecha ON citas(medico_id, fecha);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);

DROP TRIGGER IF EXISTS trg_citas_updated_at ON citas;
CREATE TRIGGER trg_citas_updated_at
    BEFORE UPDATE ON citas
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMIT;

-- =========================================================
-- Nota: los datos semilla (especialidades base, médicos de
-- ejemplo y el usuario administrador inicial) viven en
-- database/seed.sql. docker-compose.yml monta ambos scripts en
-- /docker-entrypoint-initdb.d/ del contenedor de PostgreSQL, que
-- los ejecuta en orden alfabético (schema.sql antes que seed.sql)
-- únicamente la primera vez que se crea el volumen de datos.
-- =========================================================
