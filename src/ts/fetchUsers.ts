export const fetchUsers = async (): Promise<Recipient[]> => {
    try {
        const response = await fetch('http://127.0.0.1:5000/usuarios');
        const data = await response.json();
        return data;
        } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        return []; // Retorna un arreglo vacío si hay error
        }
};