import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Briefcase, FileText } from 'lucide-react';
import Swal from 'sweetalert2';

const positions = [
  'Director General',
  'Gerente',
  'Supervisor',
  'Analista',
  'Asistente',
  'Coordinador',
];

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    position: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);  // Estado de carga para deshabilitar el botón

  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (password: string) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
    return passwordRegex.test(password);
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'Las contraseñas no coinciden.',
      });
      return;
    }

    // Verificar que el correo sea válido
    if (!isValidEmail(formData.email)) {
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'El correo electrónico no es válido.',
      });
      return;
    }

    if (!isValidPassword(formData.password)) {
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'La contraseña debe tener al menos 8 caracteres, incluyendo al menos una letra mayúscula, un número y un símbolo.',
      });
      return;
    }

    // Cambiar el estado de carga a true mientras se envían los datos
    setLoading(true);

    // Crear el objeto con los datos que se enviarán
    const userData = {
      nombre: formData.firstName,
      apellido: formData.lastName,
      puesto: formData.position,
      correo: formData.email,
      usuario: formData.username,
      password: formData.password,
    };

    // Enviar los datos al backend con fetch
    try {
      const response = await fetch('https://flask-n5b4.onrender.com//users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      // Si la respuesta del backend tiene un campo 'id', significa que el registro fue exitoso
      if (result.id) {
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Te hemos registrado correctamente. Ahora puedes iniciar sesión.',
        });
        navigate('/login'); // Redirigir al login
      } else {
        Swal.fire({
          icon: 'error',
          title: '¡Error!',
          text: 'Hubo un problema al registrar, por favor intenta nuevamente.',
        });
      }
    } catch (error) {
      console.error('Error al hacer la solicitud:', error);
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'Hubo un error en la comunicación con el servidor. Por favor, intenta más tarde.',
      });
    } finally {
      // Independientemente del resultado, deshabilitamos el estado de carga
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <FileText className="h-12 w-12 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Crear nueva cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Complete sus datos para registrarse
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Nombre */}
            <div>
              <label htmlFor="firstName" className="sr-only">
                Nombre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Nombre"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Apellido */}
            <div>
              <label htmlFor="lastName" className="sr-only">
                Apellidos
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Apellidos"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Cargo */}
            <div>
              <label htmlFor="position" className="sr-only">
                Cargo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="position"
                  name="position"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  value={formData.position}
                  onChange={handleChange}
                >
                  <option value="">Seleccione su cargo</option>
                  {positions.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Correo */}
            <div>
              <label htmlFor="email" className="sr-only">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Correo electrónico"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Confirmar Contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={loading} // Deshabilitar si está cargando
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {loading ? 'Cargando...' : 'Registrarse'} {/* Mostrar mensaje de carga */}
            </button>
            {/* <button
              type="button"
              onClick={() => navigate('/login')}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Volver al inicio de sesión
            </button> */}
          </div>
        </form>
      </div>
    </div>
  );
}
