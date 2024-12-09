import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Importa el contexto de autenticación
import { Download, Trash2 } from 'lucide-react';
import { deleteMemorandum } from '../ts/DeleteMemorandum'
import { deleteConfidential } from '../ts/DeleteConfidential'
import FileUploadModal from '../components/FileUploadModal';
import { deleteMinuta } from '../ts/DeleteMinuta'

interface Document {
  id: string;
  title: string;
  content: string;
  recipientId: string;
  recipientName: string;
  recipientPosition: string;
  date: string;
  senderName: string;
  senderPosition: string;
}

type DocumentType = 'minuta' | 'memorandum' | 'memorandum-confidencial';

export default function Dashboard() {
  const { user } = useAuth(); // Obtiene el usuario autenticado
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [documentType, setDocumentType] = useState<DocumentType>('minuta');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para manejar el criterio y orden de clasificación
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'title',
    direction: 'asc',
  });

  const handleChangeDocumentType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDocumentType = e.target.value as DocumentType;
    console.log('Nuevo tipo de documento:', newDocumentType);
    setDocumentType(newDocumentType);
  };

  const fetchDocuments = async () => {
    if (!user) return; // Asegúrate de que el usuario esté autenticado

    setLoading(true);
    try {
      let apiUrl = '';
      switch (documentType) {
        case 'memorandum':
          apiUrl = 'http://127.0.0.1:5000/memorandums';
          break;
        case 'minuta':
          apiUrl = 'http://127.0.0.1:5000/minutas';
          break;
        case 'memorandum-confidencial':
          apiUrl = 'http://127.0.0.1:5000/confidential-memorandums';
          break;
        default:
          console.error('Tipo de documento no válido');
          return;
      }
      const response = await fetch(
        `${apiUrl}?userId=${user.id}&type=${activeTab}`
      );

      if (!response.ok) {
        throw new Error('Error al obtener documentos');
      }

      const data = await response.json();

      const mappedDocuments: Document[] = data.map((doc: any) => ({
        id: doc._id,
        title: doc.titulo,
        recipientId: doc.destinatario,
        recipientName: doc.destinatario_nombre,
        recipientPosition: doc.destinatario_puesto,
        date: doc.fecha,
        content: doc.contenido,
        senderName: doc.remitente_nombre,
        senderPosition: doc.remitente_puesto,
        userId: doc.user_id,
      }));

      console.log('Documentos mapeados:', mappedDocuments); // Depuración
      setDocuments(mappedDocuments);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [activeTab, documentType, user]);

  const handleDownload = (documentId: string, type: string, userId: string, typeDocument: string) => {
    console.log(documentId);
    console.log(typeDocument);
  
    let downloadUrl = '';

    if (typeDocument === 'memorandum-confidencial' && type !== 'sent') {

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.pem'; 

      fileInput.onchange = (e: any) => {
        const file = e.target.files[0]; // Obtener el archivo seleccionado
  
        if (file) {
          const reader = new FileReader();
          
          reader.onload = function () {
            const privateKeyPem = reader.result as string;
            const encodedPrivateKey = btoa(privateKeyPem); 

            downloadUrl = `http://localhost/php/descargar_confidential.php?id=${documentId}&type=${type}&id_user=${userId}&privateKey=${encodedPrivateKey}`;
            console.log('Clave privada codificada:', encodedPrivateKey);
            window.location.href = downloadUrl;
          };

          reader.readAsText(file);
        }
      };

      fileInput.click();
    } else {

      switch (typeDocument) {
        case 'memorandum':
          downloadUrl = `http://localhost/php/descargar_memorandum.php?id=${documentId}&type=${type}&id_user=${userId}`;
          break;
        case 'minuta':
          downloadUrl = `http://localhost/php/descargar_minuta.php?id=${documentId}&type=${type}&id_user=${userId}`;
          break;
        case 'memorandum-confidencial':

          downloadUrl = `http://localhost/php/descargar_confidential.php?id=${documentId}&type=${type}&id_user=${userId}`;
          break;
        default:
          console.error('Tipo de documento no válido');
          return;
      }

      window.location.href = downloadUrl;
    }
  };
    

  const handleDelete = async (documentId: string, typeDocument: DocumentType) => {
    try {
      switch (typeDocument) {
        case 'memorandum':
          await deleteMemorandum(documentId);
          break;
        case 'minuta':
          await deleteMinuta(documentId);
          break;
        case 'memorandum-confidencial':
          await deleteConfidential(documentId);
          break;
        default:
          console.error('Tipo de documento no válido');
          return;
      }
      fetchDocuments();
    } catch (error) {
      console.error('Error al eliminar documento:', error);
    }
  };

  // Función de ordenamiento
  const sortedDocuments = [...documents].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof Document];
    const bValue = b[sortConfig.key as keyof Document];

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Manejar clic en los encabezados para cambiar la dirección del orden
  const handleSort = (key: keyof Document) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Mis Documentos</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4 flex space-x-4">
          <select
            value={documentType}
            onChange={handleChangeDocumentType}
            className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="minuta">Minutas</option>
            <option value="memorandum">Memorándum</option>
            <option value="memorandum-confidencial">Memorándum Confidencial</option>
          </select>
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setActiveTab('received')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                activeTab === 'received'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:text-gray-900 border border-gray-300'
              }`}
            >
              Recibidos
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                activeTab === 'sent'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:text-gray-900 border border-gray-300'
              }`}
            >
              Enviados
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Cargando documentos...</div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto"> {/* Habilita el scroll horizontal si la tabla es ancha */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('title')}
                  >
                    Título
                    {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    Fecha
                    {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽')}
                  </th>
                  {activeTab === 'received' && (
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('senderName')}
                    >
                      Remitente
                      {sortConfig.key === 'senderName' && (sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽')}
                    </th>
                  )}

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contenido
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis">
                      <span className="text-sm text-gray-900">{doc.title}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{doc.date}</span>
                    </td>
                    {activeTab === 'received' && (
                      <td className="px-6 py-4 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis">
                        <span className="text-sm text-gray-900">
                          {doc.senderName} ({doc.senderPosition})
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis">
                      <span className="text-sm text-gray-500">{doc.content}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => handleDownload(doc.id, activeTab, user.id, documentType)}
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      {activeTab === 'sent' && (
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDelete(doc.id, documentType)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
