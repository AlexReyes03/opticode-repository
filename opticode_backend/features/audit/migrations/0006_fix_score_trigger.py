from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("audit", "0005_finding_wcag_level_and_improvement_severity"),
    ]

    operations = [
        # Alinear el trigger de score con la fórmula del engine Python:
        # score = 100 - (error_count * 10) - (warning_count * 5), mínimo 0.
        # Los hallazgos con severity 'improvement' no penalizan.
        migrations.RunSQL(
            sql="""
                DROP TRIGGER IF EXISTS trg_update_score_on_finding;

                CREATE TRIGGER trg_update_score_on_finding
                AFTER INSERT ON hallazgos_accesibilidad
                FOR EACH ROW
                BEGIN
                    DECLARE v_error_count INT;
                    DECLARE v_warning_count INT;
                    DECLARE v_file_id BIGINT;

                    SELECT uploaded_file_id INTO v_file_id
                    FROM reportes
                    WHERE id = NEW.audit_result_id;

                    SELECT COUNT(*) INTO v_error_count
                    FROM hallazgos_accesibilidad
                    WHERE audit_result_id = NEW.audit_result_id
                      AND severity = 'error';

                    SELECT COUNT(*) INTO v_warning_count
                    FROM hallazgos_accesibilidad
                    WHERE audit_result_id = NEW.audit_result_id
                      AND severity = 'warning';

                    UPDATE uploaded_files
                    SET score = GREATEST(0, 100 - (v_error_count * 10) - (v_warning_count * 5))
                    WHERE id = v_file_id;
                END;
            """,
            reverse_sql="""
                DROP TRIGGER IF EXISTS trg_update_score_on_finding;

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
        ),
    ]
