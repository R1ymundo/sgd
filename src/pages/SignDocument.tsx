import { useState, useEffect } from 'react';
import { FileSignature } from 'lucide-react';
import FileUploadModal from '../components/FileUploadModal';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';  // Asegúrate de tener SweetAlert2 instalado

interface Document {
  id: string;
  subject: string;
  date: string;
  content: string;
}

export default function SignDocument() {
  const { user } = useAuth(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch the documents from the API
  const fetchDocuments = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const apiUrl = `https://flask-n5b4.onrender.com/minutas/pendientes?userId=${user.id}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error('Error al obtener documentos');
      }

      const data = await response.json();
      const mappedDocuments: Document[] = data.map((doc: any) => ({
        id: doc._id,
        subject: doc.titulo,
        date: doc.fecha,
        content: doc.contenido,
      }));

      setDocuments(mappedDocuments);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  // Handle the click to sign a document
  const handleSign = (documentId: string) => {
    setSelectedDocumentId(documentId);
    setIsModalOpen(true);
  };

  // Handle the file upload for signing the document
  const handleFileUpload = (file: File) => {
    if (!selectedDocumentId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debes seleccionar un documento para firmar.',
        confirmButtonText: 'Ok',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = function () {
      const privateKeyPem = reader.result as string;
      const encodedPrivateKey = btoa(privateKeyPem); // Encode the private key to Base64
      console.log(encodedPrivateKey)

      fetch(`https://flask-n5b4.onrender.com/minutas/firma/${selectedDocumentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,  // User ID (assuming it's available in your context)
          privateKey: encodedPrivateKey,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === 'Minuta firmada con éxito') {
            Swal.fire({
              icon: 'success',
              title: 'Minuta Firmada',
              text: 'La minuta se firmó exitosamente.',
              confirmButtonText: 'Ok',
            }).then(() => {
              fetchDocuments();  // Refresh documents list
              setIsModalOpen(false); // Close the modal after signing
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: data.message,
              confirmButtonText: 'Ok',
            });
          }
        })
        .catch((error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al firmar la minuta. Inténtalo de nuevo.',
            confirmButtonText: 'Ok',
          });
        });
    };
    reader.readAsText(file); // Read the file as text (for PEM file)
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Firmar Documentos</h1>

      {loading ? (
        <div className="text-center text-gray-500">Cargando documentos...</div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asunto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contenido
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis">
                    <span className="text-sm text-gray-900">{doc.subject}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis">
                    <span className="text-sm text-gray-900">{doc.date}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis">
                    <span className="text-sm text-gray-500">{doc.content}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleSign(doc.id)}
                      className="text-indigo-600 hover:text-indigo-900 inline-flex items-center space-x-1"
                    >
                      <FileSignature className="h-5 w-5" />
                      <span>Firmar</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FileUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Subir llave privada (.pem) para firmar"
        onUpload={handleFileUpload} // Pass the handleFileUpload function
      />
    </div>
  );
}
