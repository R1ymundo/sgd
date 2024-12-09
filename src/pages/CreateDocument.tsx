import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../context/AuthContext'; 
import { validateFields } from '../ts/validation';
import { verifyPassword } from '../ts/verifyPassword';
import { sendData } from '../ts/sendData';
import { fetchUsers } from '../ts/fetchUsers';
import Swal from 'sweetalert2';

type DocumentType = 'minuta' | 'memorandum' | 'memorandum-confidencial';

interface Recipient {
  id: string;
  nombre: string;
  apellido: string;
  puesto: string;
}

export default function CreateDocument() {
  const { user } = useAuth();
  const [documentType, setDocumentType] = useState<DocumentType>('minuta');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [recipient, setRecipient] = useState<string[]>([]); // Cambiado a array de strings
  const [content, setContent] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [pemFile, setPemFile] = useState<File | null>(null);
  const [pemBase64, setPemBase64] = useState<string | null>(null);

  useEffect(() => {
    // Establecer la fecha actual del sistema
    setDate(new Date().toISOString().split('T')[0]); // Formato YYYY-MM-DD
    const loadUsers = async () => {
      const users = await fetchUsers(); // Usar la función importada
      setRecipients(users);
    };
    loadUsers();
  }, []); 

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/x-pem-file': ['.pem'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      console.log('Archivo subido:', acceptedFiles[0].name);
      setPemFile(acceptedFiles[0]);
      convertPemToBase64(acceptedFiles[0]);
    },
  });

  const convertPemToBase64 = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        const base64String = reader.result as string;
        const base64Content = base64String.split(',')[1];
        setPemBase64(base64Content);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setPemFile(null);
    setPemBase64(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateFields(subject, date, recipient, content, pemBase64);
    if(documentType !== 'minuta'){
      if (!validation.valid) {
        Swal.fire({
          icon: 'error',
          title: 'Campos Vacíos',
          text: validation.message,
        });
        return;
      }
    }

    if (documentType === 'memorandum-confidencial') {
      const password = await verifyPassword(user.id);
      if (!password) return;
    }

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
    
    const data = {
      titulo: subject,
      fecha: date,
      contenido: content,
      destinatario: documentType === 'minuta' ? recipient : recipient[0], // Para 'minuta' permite múltiples destinatarios
      userId: user.id,  // Ejemplo de user ID
      llavePrivada: pemBase64,  // Aquí se manda solo la parte base64
    };

    console.log(data)

    const result = await sendData(apiUrl, data);
    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Documento creado',
        text: `El ${documentType} ha sido creado con éxito.`,
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al crear el documento. Intenta de nuevo.',
      });
    }

    setSubject('');
    setContent('');
    setRecipient([]); // Reiniciar destinatarios
    setPemFile(null);
    setPemBase64(null);
    setDocumentType(documentType);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Crear Documento</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Documento</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm w-ful p-2">
              <option value="minuta">Minuta</option>
              <option value="memorandum">Memorándum</option>
              <option value="memorandum-confidencial">Memorándum Confidencial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha</label>
            <input
              type="date"
              value={date}
              disabled // Esto hace que el campo sea solo lectura
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Asunto</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            placeholder="Ingrese el asunto del documento"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">{documentType === 'minuta' ? 'Participantes' : 'Destinatario'}</label>
          <select
            multiple={documentType === 'minuta'} // Si el documento es 'minuta', habilitar la selección múltiple
            value={recipient}
            onChange={(e) => setRecipient(Array.from(e.target.selectedOptions, option => option.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
          >
            <option value="">{documentType === 'minuta' ? 'Seleccione un participante' : 'Seleccione un remitente'}</option>
            {recipients.map((r) => (
              <option key={r._id} value={r._id}>
                {`${r.nombre} ${r.apellido} - ${r.puesto}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contenido</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Ingrese el contenido del documento"
          />
        </div>
        
        {(documentType === 'memorandum' || documentType === 'memorandum-confidencial') &&(
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Llave Privada (.pem)</label>
          {!pemFile ? (
            <div
              {...getRootProps()}
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
            >
              <div className="space-y-1 text-center">
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <p className="pl-1">
                    {isDragActive
                      ? 'Suelte el archivo aquí'
                      : 'Arrastre y suelte su archivo .pem aquí o haga clic para seleccionar'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                <Upload className="h-6 w-6 text-indigo-500" />
              </div>
              <span className="text-sm">{pemFile.name}</span>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Eliminar
              </button>
            </div>
          )}
        </div>
        )}
        <div className="mt-6">
          <button
            type="submit"
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Crear Documento
          </button>
        </div>
      </form>
    </div>
  );
}
