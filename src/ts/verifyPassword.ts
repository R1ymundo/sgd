import Swal from 'sweetalert2';

export const verifyPassword = async (userId: string) => {
    const { value: password } = await Swal.fire({
        title: 'Confirmación de Contraseña',
        input: 'password',
        inputLabel: 'Ingresa tu contraseña para confirmar',
        inputPlaceholder: 'Contraseña',
        inputAttributes: { autocapitalize: 'off', autocorrect: 'off' },
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
    });


    if (!password) {
        Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debes ingresar la contraseña para proceder.',
        });
        return null;
    }

    try {
        const response = await fetch('https://flask-n5b4.onrender.com/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
        });
        const result = await response.json();

        if (result.message !== 'Password verified') {
        Swal.fire({
            icon: 'error',
            title: 'Contraseña Incorrecta',
            text: 'La contraseña ingresada no es válida.',
        });
        return null;
        }
        return password;
    } catch (error) {
        Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al verificar la contraseña.',
        });
        return null;
    }
};
