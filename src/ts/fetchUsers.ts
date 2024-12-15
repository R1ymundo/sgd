export const fetchUsers = async (): Promise<Recipient[]> => {
    try {
        const response = await fetch('https://flask-n5b4.onrender.com/usuarios');
        const data = await response.json();
        return data;
        } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        return []; // Retorna un arreglo vacío si hay error
        }
};