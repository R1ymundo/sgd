import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js';

export const generateMemorandumPdf = async (memorandumId: string, type: string, user: any) => {
    try {
        // Obtener los memorándums desde el backend
        const response = await fetch(`http://127.0.0.1:5000/memorandums?userId=${user.id}&type=${type}`);
        const memorandums = await response.json();

        // Filtrar el memorándum que coincide con el ID
        const memorandum = memorandums.find((m: any) => m._id === memorandumId);

        if (!memorandum) {
            Swal.fire({
                icon: 'error',
                title: 'Memorándum no encontrado',
                text: 'No se pudo encontrar el memorándum solicitado.',
            });
            return;
        }

        // Definir el contenido del memorándum con máximo 40 líneas por página
        const contentLines = memorandum.contenido.split('\n');  // Dividir el contenido en líneas
        let pagesContent = [];
        let currentPage = [];
        
        // Dividir el contenido en páginas de 40 líneas
        contentLines.forEach((line, index) => {
            currentPage.push(line);
            if (currentPage.length === 40 || index === contentLines.length - 1) {
                pagesContent.push(currentPage.join('<br>'));
                currentPage = []; // Reiniciar la página
            }
        });

        // Crear el HTML para el PDF
        let html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Memorándum</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    width: 90%;
                    margin: 0 auto;
                    padding: 20px;
                    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
                    text-align: justify;
                    overflow-wrap: break-word;
                    word-wrap: break-word;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .header h1 {
                    font-size: 24px;
                    text-transform: uppercase;
                }
                .content {
                    line-height: 1.5;
                }
                .footer {
                    margin-top: 40px;
                    page-break-before: always;
                }
                .page-break {
                    page-break-before: always;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Memorándum</h1>
                </div>
                <div class="content">
                    <p><strong>Fecha:</strong> ${memorandum.fecha}</p>
                    <p><strong>De:</strong> ${memorandum.remitente_nombre}</p>
                    <p><strong>Para:</strong> ${memorandum.destinatario_nombre}</p>
                    <p><strong>Asunto:</strong> ${memorandum.titulo}</p>
                    <p>${memorandum.contenido.replace(/\n/g, '<br>')}</p>
                    
                    <!-- Páginas con 40 líneas por cada una -->
                    ${pagesContent.map((page, idx) => `
                        <div class="page-break">
                            <p>${page}</p>
                        </div>
                    `).join('')}
                </div>
                <div class="footer">
                    <p>Atentamente,</p>
                    <p><strong>${memorandum.remitente_nombre}</strong><br>
                    <strong>${memorandum.remitente_puesto}</strong></p>
                    <p style="font-size: 14.8px; white-space: nowrap;">
                        ${memorandum.firma.r}<br>
                        ${memorandum.firma.s}
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Crear un contenedor temporal para el HTML
        const element = document.createElement('div');
        element.innerHTML = html;

        // Opciones de configuración para el PDF
        const options = {
            margin: [10, 10, 10, 10],  // Márgenes de la página
            filename: `memorandum_${memorandumId}.pdf`,
            html2canvas: { dpi: 192, scale: 3 }, // Mejor calidad para el contenido renderizado
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }, // Formato A4 y orientación vertical
        };

        // Usar html2pdf.js para generar el PDF
        html2pdf().from(element).set(options).save();

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error al obtener el memorándum',
            text: 'Hubo un problema al obtener los datos del memorándum.',
        });
    }
};
