import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { fetchUsers } from '../ts/fetchUsers';
import { sendData } from '../ts/sendData';
import Swal from 'sweetalert2';

interface Sender {
  id: string;
  name: string;
  email: string;
}

type DocumentType = 'minuta' | 'memorandum';

export default function VerifyDocument() {
  const [sender, setSender] = useState('');
  const [senders, setSenders] = useState<Sender[]>([]);
  const [pemFile, setPemFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pemBase64, setPemBase64] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('minuta');
  
  useEffect(() => {
    const loadUsers = async () => {
      const users = await fetchUsers(); 
      setSenders(users);
    };
    loadUsers();
  }, []); 

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/x-pem-file': ['.pdf'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      console.log('Archivo subido:', acceptedFiles[0].name);
      setPemFile(acceptedFiles[0]);
      setFileName(acceptedFiles[0].name);
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

    let apiUrl = '';
    switch (documentType) {
      case 'memorandum':
        apiUrl = 'http://127.0.0.1:5000/verificar_archivo';
        break;
      case 'minuta':
        apiUrl = 'http://127.0.0.1:5000/verificar_archivo_minuta';
        break;
      default:
        console.error('Tipo de documento no válido');
        return;
    }

    const data = {
      remitente: sender,
      nombreArchivo: fileName,  
      archivoPDF: pemBase64, 
    };

    const result = await sendData(apiUrl, data);
    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Resultado de la Verificación',
        text: 'La firma es válida.',
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Resultado de la Verificación',
        text: 'La firma es inválida. El documento ha sido alterado.',
      });
    }
    
    setSender('')
    setPemFile(null);
    setPemBase64(null);
    setDocumentType(documentType);
  };  

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle verification logic
    console.log('Verifying document for sender:', sender);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Verificar Documento</h1>
      
      <form onSubmit={handleVerify} className="space-y-6 bg-white shadow rounded-lg p-6">
        <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Documento</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm w-ful p-2">
              <option value="minuta">Minuta</option>
              <option value="memorandum">Memorándum</option>
            </select>
          </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
          {documentType === 'minuta' ? 'Participantes' : 'Destinatario'}
          </label>
          <select
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
          >
            <option value="">{documentType === 'minuta' ? 'Seleccione un participante' : 'Seleccione un remitente'}</option>
            {senders.map((s) => (
              <option key={s._id} value={s._id}>
                {`${s.nombre} ${s.apellido} - ${s.puesto}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Documento PDF
          </label>
          <div>
          
            {!pemFile ? (
              <div
                {...getRootProps()}
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                  isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                }`}
              >
                <div className="space-y-1 text-center">
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <p className="pl-1">
                      {isDragActive
                        ? 'Suelte el archivo aquí'
                        : 'Arrastre y suelte su archivo .pdf aquí o haga clic para seleccionar'}
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

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Verificar
          </button>
        </div>
        </div>
      </form>
    </div>
  );
}