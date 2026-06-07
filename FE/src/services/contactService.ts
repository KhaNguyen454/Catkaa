import { API_BASE_URL } from '../config/apiConfig';

export interface ContactSubmitData {
    name: string;
    phone: string;
    email: string;
    packageName: string;
    message: string;
}

export const submitContactForm = async (data: ContactSubmitData): Promise<string> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/contact/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        
        const responseData = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(responseData?.message || `HTTP error! status: ${response.status}`);
        }
        
        return responseData.data;
    } catch (error) {
        console.error("Error submitting contact form:", error);
        throw error;
    }
};
