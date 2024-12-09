// validation.ts
export const validateFields = (subject: string, date: string, recipient: string, content: string, pemBase64: string) => {
    if (!subject || !date || !recipient || !content) {
        return { valid: false, message: 'Por favor, asegúrate de llenar todos los campos antes de enviar el formulario.' };
        }
    
        if (!pemBase64) {
        return { valid: false, message: 'Es necesario subir un archivo .pem.' };
        }
    
        return { valid: true, message: '' };
};  