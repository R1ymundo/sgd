export const sendData = async (apiUrl: string, data: any) => {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
        },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const result = await response.json();
            return { success: true, result };
        } else {
            return { success: false };
        }
        
    } catch (error) {
        console.error('Error al enviar los datos:', error);
        return { success: false, message: 'Hubo un error al enviar los datos.' };
    }
};