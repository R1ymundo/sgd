import Swal from 'sweetalert2';

export const deleteConfidential = async (confidentialId: string) => {
    try {
        // Enviar solicitud DELETE al backend para eliminar la Memorándum
        const response = await fetch(`http://127.0.0.1:5000/confidential-memorandums/${confidentialId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Verificar si la respuesta fue exitosa
        if (!response.ok) {
            Swal.fire({
                icon: 'error',
                title: 'Error al eliminar el Memorándum',
                text: 'No se pudo procesar la solicitud de eliminación.',
            });
            return;
        }

        // Obtener la respuesta del servidor
        const result = await response.json();

        console.log(result)

        if (result.message === 'Memorandum eliminado con éxito') {
            Swal.fire({
                icon: 'success',
                title: 'Memorándum eliminado',
                text: 'La Memorándum se eliminó correctamente.',
            }).then(() => {

            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'No se pudo eliminar el Memorándum',
                text: 'Hubo un error al intentar eliminar la Memorándum.',
            });
        }
    } catch (error) {
        console.error('Error en la eliminación de la Memorándum:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de red',
            text: 'Hubo un problema al conectar con el servidor.',
        });
    }
};
