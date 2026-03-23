-- =============================================
-- 02_triggers.sql — Auditoría automática
-- =============================================

-- Función genérica de auditoría
CREATE OR REPLACE FUNCTION fn_auditoria()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO bitacora_auditoria
            (tabla_afectada, operacion, id_registro, datos_nuevos)
        VALUES
            (TG_TABLE_NAME, 'INSERT', NEW.id, row_to_json(NEW)::jsonb);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO bitacora_auditoria
            (tabla_afectada, operacion, id_registro, datos_anteriores, datos_nuevos)
        VALUES
            (TG_TABLE_NAME, 'UPDATE', NEW.id,
             row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO bitacora_auditoria
            (tabla_afectada, operacion, id_registro, datos_anteriores)
        VALUES
            (TG_TABLE_NAME, 'DELETE', OLD.id, row_to_json(OLD)::jsonb);
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger en expedientes
CREATE TRIGGER trg_audit_expedientes
AFTER INSERT OR UPDATE OR DELETE ON expedientes
FOR EACH ROW EXECUTE FUNCTION fn_auditoria();

-- Trigger en movimientos
CREATE TRIGGER trg_audit_movimientos
AFTER INSERT OR UPDATE OR DELETE ON movimientos
FOR EACH ROW EXECUTE FUNCTION fn_auditoria();

-- Trigger en usuarios (sin password_hash en datos_nuevos por seguridad)
CREATE OR REPLACE FUNCTION fn_auditoria_usuarios()
RETURNS TRIGGER AS $$
DECLARE
    datos_sin_pass JSONB;
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        datos_sin_pass := row_to_json(NEW)::jsonb - 'password_hash';
        INSERT INTO bitacora_auditoria
            (tabla_afectada, operacion, id_registro, datos_nuevos)
        VALUES ('usuarios', TG_OP, NEW.id, datos_sin_pass);
        RETURN NEW;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_usuarios
AFTER INSERT OR UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION fn_auditoria_usuarios();

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION fn_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_updated_at_expedientes
BEFORE UPDATE ON expedientes
FOR EACH ROW EXECUTE FUNCTION fn_updated_at();

-- SEQUENCE para código de expediente: EXP-2025-00001
CREATE SEQUENCE IF NOT EXISTS seq_expediente_anio
    START 1 INCREMENT 1 NO CYCLE;

CREATE OR REPLACE FUNCTION fn_generar_codigo_exp()
RETURNS TRIGGER AS $$
DECLARE
    anio_actual  INT;
    correlativo  INT;
BEGIN
    anio_actual := EXTRACT(YEAR FROM NOW());
    correlativo := nextval('seq_expediente_anio');
    NEW.codigo := 'EXP-' || anio_actual || '-' || LPAD(correlativo::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_codigo_expediente
BEFORE INSERT ON expedientes
FOR EACH ROW EXECUTE FUNCTION fn_generar_codigo_exp();