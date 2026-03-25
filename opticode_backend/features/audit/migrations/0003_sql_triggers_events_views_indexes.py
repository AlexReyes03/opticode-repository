from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("audit", "0002_remove_uploadedfile_content_uploadedfile_file_and_more"),
    ]

    operations = [
        # ──────────────────────────────────────────────
        # ÍNDICES
        # ──────────────────────────────────────────────
        migrations.RunSQL(
            sql="CREATE INDEX idx_usuarios_email ON usuarios (email);",
            reverse_sql="DROP INDEX idx_usuarios_email ON usuarios;",
        ),
        migrations.RunSQL(
            sql="CREATE INDEX idx_uploaded_files_project_id ON uploaded_files (project_id);",
            reverse_sql="DROP INDEX idx_uploaded_files_project_id ON uploaded_files;",
        ),
        # ──────────────────────────────────────────────
        # TRIGGERS
        # ──────────────────────────────────────────────

        # T1 — Cuando se inserta un hallazgo con severity 'error',
        #       actualiza el estado del reporte a 'Fallas'.
        migrations.RunSQL(
            sql="""
                CREATE TRIGGER trg_set_audit_status
                AFTER INSERT ON hallazgos_accesibilidad
                FOR EACH ROW
                BEGIN
                    IF NEW.severity = 'error' THEN
                        UPDATE reportes
                        SET status = 'Fallas'
                        WHERE id = NEW.audit_result_id;
                    END IF;
                END;
            """,
            reverse_sql="DROP TRIGGER IF EXISTS trg_set_audit_status;",
        ),

        # T2 — Cuando se inserta un hallazgo, recalcula el score
        #       del archivo: 100 - (errores * 10), mínimo 0.
        migrations.RunSQL(
            sql="""
                CREATE TRIGGER trg_update_score_on_finding
                AFTER INSERT ON hallazgos_accesibilidad
                FOR EACH ROW
                BEGIN
                    DECLARE error_count INT;
                    DECLARE file_id BIGINT;

                    SELECT uploaded_file_id INTO file_id
                    FROM reportes
                    WHERE id = NEW.audit_result_id;

                    SELECT COUNT(*) INTO error_count
                    FROM hallazgos_accesibilidad
                    WHERE audit_result_id = NEW.audit_result_id
                      AND severity = 'error';

                    UPDATE uploaded_files
                    SET score = GREATEST(0, 100 - (error_count * 10))
                    WHERE id = file_id;
                END;
            """,
            reverse_sql="DROP TRIGGER IF EXISTS trg_update_score_on_finding;",
        ),

         # ──────────────────────────────────────────────
        # EVENTOS
        # ──────────────────────────────────────────────

        # E1 — Limpieza diaria de reportes huérfanos
        migrations.RunSQL(
            sql="""
                CREATE EVENT evt_cleanup_orphan_reports
                ON SCHEDULE EVERY 1 DAY
                STARTS CURRENT_TIMESTAMP
                DO
                    DELETE FROM reportes
                    WHERE uploaded_file_id NOT IN (
                        SELECT id FROM uploaded_files
                    );
            """,
            reverse_sql="DROP EVENT IF EXISTS evt_cleanup_orphan_reports;",
        ),

        # E2 — Limpieza semanal de proyectos vacíos con más de 30 días
        migrations.RunSQL(
            sql="""
                CREATE EVENT evt_cleanup_empty_projects
                ON SCHEDULE EVERY 7 DAY
                STARTS CURRENT_TIMESTAMP
                DO
                    DELETE FROM proyectos
                    WHERE id NOT IN (
                        SELECT DISTINCT project_id FROM uploaded_files
                    )
                    AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
            """,
            reverse_sql="DROP EVENT IF EXISTS evt_cleanup_empty_projects;",
        ),

         # ──────────────────────────────────────────────
        # VISTAS
        # ──────────────────────────────────────────────

        # V1 — Resumen por proyecto
        migrations.RunSQL(
            sql="""
                CREATE VIEW vw_project_summary AS
                SELECT
                    p.id            AS project_id,
                    p.name          AS project_name,
                    u.email         AS owner_email,
                    COUNT(uf.id)    AS total_files,
                    SUM(CASE WHEN r.status = 'Fallas' THEN 1 ELSE 0 END) AS files_with_failures,
                    ROUND(AVG(uf.score), 2) AS avg_score
                FROM proyectos p
                LEFT JOIN usuarios u        ON u.id  = p.owner_id
                LEFT JOIN uploaded_files uf  ON uf.project_id = p.id
                LEFT JOIN reportes r         ON r.uploaded_file_id = uf.id
                GROUP BY p.id, p.name, u.email;
            """,
            reverse_sql="DROP VIEW IF EXISTS vw_project_summary;",
        ),

        # V2 — Resumen de violaciones WCAG
        migrations.RunSQL(
            sql="""
                CREATE VIEW vw_wcag_violations_summary AS
                SELECT
                    h.wcag_rule,
                    h.severity,
                    COUNT(*)       AS total_findings,
                    COUNT(DISTINCT r.uploaded_file_id) AS affected_files
                FROM hallazgos_accesibilidad h
                JOIN reportes r ON r.id = h.audit_result_id
                GROUP BY h.wcag_rule, h.severity;
            """,
            reverse_sql="DROP VIEW IF EXISTS vw_wcag_violations_summary;",
        ),

    ]
