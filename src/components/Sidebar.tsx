import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, FilePlus, CheckCircle, LogOut, FileSignature } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Documentos', href: '/', icon: FileText },
    { name: 'Crear Documento', href: '/create', icon: FilePlus },
    { name: 'Verificar Documento', href: '/verify', icon: CheckCircle },
    { name: 'Firmar Documento', href: '/sign', icon: FileSignature },
  ];

  return (
    <div className="flex flex-col w-64 bg-white border-r">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <FileText className="h-8 w-8 text-indigo-600" />
          <span className="ml-2 text-xl font-semibold text-gray-900">SGD</span>
        </div>
        <div className="mt-8 flex-1 px-2 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                location.pathname === item.href
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={clsx(
                  'mr-3 h-5 w-5',
                  location.pathname === item.href
                    ? 'text-indigo-600'
                    : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {item.name}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div>
            <p className="text-sm font-medium text-gray-700">{user?.nombre + " " + user?.apellido}</p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-auto flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}