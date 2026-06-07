import { API_BASE_URL } from '../config/apiConfig';

export interface PricingFeature {
    name: string;
    value: string;
    highlight?: boolean;
    disabled?: boolean;
}

export interface PricingPlan {
    id: number;
    name: string;
    subtitle: string;
    price: string;
    features: PricingFeature[];
    btnText: string;
    isPopular: boolean;
}

export const getPricingPlans = async (): Promise<PricingPlan[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/pricing-plans`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching pricing plans:", error);
        throw error;
    }
};
