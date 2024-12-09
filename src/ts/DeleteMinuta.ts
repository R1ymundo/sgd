import Swal from 'sweetalert2';

export const deleteMinuta = async (minutaId: string) => {
    try {
        // Enviar solicitud DELETE al backend para eliminar la minuta
        const response = await fetch(`http://127.0.0.1:5000/minutas/${minutaId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Verificar si la respuesta fue exitosa
        if (!response.ok) {
            Swal.fire({
                icon: 'error',
                title: 'Error al eliminar la minuta',
                text: 'No se pudo procesar la solicitud de eliminación.',
            });
            return;
        }

        // Obtener la respuesta del servidor
        const result = await response.json();

        if (result.message === 'Minuta eliminada con éxito') {
            Swal.fire({
                icon: 'success',
                title: 'Minuta eliminada',
                text: 'La minuta se eliminó correctamente.',
            }).then(() => {
                // Redirigir al usuario a la página de visualización de minutas
                
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'No se pudo eliminar la minuta',
                text: 'Hubo un error al intentar eliminar la minuta.',
            });
        }
    } catch (error) {
        console.error('Error en la eliminación de la minuta:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de red',
            text: 'Hubo un problema al conectar con el servidor.',
        });
    }
};
