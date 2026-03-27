import sys

def main():
    try:
        from weasyprint import HTML 
        html_content = """
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #2C3E50; }
                p { color: #34495E; font-size: 16px; }
                .footer { margin-top: 50px; font-size: 12px; color: #7F8C8D; text-align: center; }
            </style>
        </head>
        <body>
            <h1>Reporte de Prueba - Opticode</h1>
            <p>Este es un documento PDF generado dinámicamente utilizando <strong>WeasyPrint</strong>.</p>
            <p>WeasyPrint permite convertir HTML y CSS directamente a PDF, manteniendo los estilos intactos de manera sencilla y eficiente.</p>
            <div class="footer">
                Generado automáticamente - Opticode 2026
            </div>
        </body>
        </html>
        """
        
        # Crear el PDF
        pdf_file = "prueba_weasyprint.pdf"
        HTML(string=html_content).write_pdf(pdf_file)
        
        print(f"¡Éxito! El PDF ha sido generado correctamente: {pdf_file}")
    except Exception as e:
        print(f"Error al generar el PDF: {e}", file=sys.stderr)
       
if __name__ == "__main__":
    main()
