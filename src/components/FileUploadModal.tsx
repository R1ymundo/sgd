import { Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Modal from './Modal';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onUpload: (file: File) => void;
}

export default function FileUploadModal({ isOpen, onClose, title, onUpload }: FileUploadModalProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/x-pem-file': ['.pem'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles[0]);
        onClose();
      }
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
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
                : 'Arrastre y suelte su archivo aquí, o haga clic para seleccionar'}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}