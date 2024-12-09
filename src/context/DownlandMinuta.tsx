import { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const GenerateMinutaPDF = () => {
    const { id, type } = useParams();
    const [minuta, setMinuta] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Hacer una solicitud GET al backend para obtener la minuta
        const fetchMinuta = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/minutas?userId=${localStorage.getItem('user_id')}&type=${type}`);
            if (!response.ok) {
            throw new Error('Error al obtener las minutas');
            }
            const minutas = await response.json();
            const foundMinuta = minutas.find((min) => min._id === id);
            if (!foundMinuta) {
            Swal.fire('Minuta no encontrada', '', 'error');
            } else {
            setMinuta(foundMinuta);
            }
        } catch (error) {
            Swal.fire('Error', 'No se pudo cargar la minuta', 'error');
        } finally {
            setLoading(false);
        }
        };

        fetchMinuta();
    }, [id, type]);

    const generatePDF = () => {
        if (!minuta) return;

        const doc = new jsPDF();

        doc.setFont('Arial', 'normal');
        doc.text(`Fecha: ${minuta.fecha}`, 20, 30);
        doc.text(`Participantes:`, 20, 40);

        minuta.firmantes.forEach((firmante, index) => {
        doc.text(firmante.nombre, 20, 50 + index * 10);
        });

        doc.text(`Tema: ${minuta.titulo}`, 20, 70);
        doc.text('Tema discutido:', 20, 80);
        doc.text(minuta.contenido, 20, 90);

        doc.text('Firmas de participantes:', 20, 120);

        minuta.firmas.forEach((firma, index) => {
        doc.text(`${firma.remitente_nombre} - ${firma.remitente_puesto}`, 20, 130 + index * 20);
        doc.text(firma.r, 20, 140 + index * 20);
        doc.text(firma.s, 60, 140 + index * 20);
        });

        doc.save(`minuta_${minuta._id}.pdf`);
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <div>
        <button onClick={generatePDF} className="btn btn-primary">
            Descargar Minuta en PDF
        </button>
        {minuta && (
            <div>
            <h3>{minuta.titulo}</h3>
            <p><strong>Fecha:</strong> {minuta.fecha}</p>
            <p><strong>Participantes:</strong></p>
            <ul>
                {minuta.firmantes.map((firmante, index) => (
                <li key={index}>{firmante.nombre}</li>
                ))}
            </ul>
            <p><strong>Tema discutido:</strong></p>
            <p>{minuta.contenido}</p>
            <p><strong>Firmas de participantes:</strong></p>
            <ul>
                {minuta.firmas.map((firma, index) => (
                <li key={index}>
                    {firma.remitente_nombre} - {firma.remitente_puesto} <br />
                    {firma.r} <br />
                    {firma.s}
                </li>
                ))}
            </ul>
            </div>
        )}
        </div>
    );
};

export default GenerateMinutaPDF;
