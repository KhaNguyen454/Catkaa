import { API_BASE_URL } from "../config/apiConfig";
import { getAuthToken } from "./authService";

export interface RoomStatusChartData {
  label: string;
  value: number;
  color: string;
}

export interface DashboardSummary {
  roomOccupancyRate: string;
  totalGuestsThisMonth: number;
  todayRevenue: string;
  supportRequestsCount: number;
  roomStatusChart: RoomStatusChartData[];

  // Admin stats
  totalUsers?: number;
  totalHotels?: number;
  totalSystemRevenue?: string;
  totalSupportRequests?: number;
}

export interface CurrentGuest {
  id: number;
  name: string;
  room: string;
  checkin: string;
  checkout: string;
  status: string;
  type: string;
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/dashboard/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch dashboard summary");
  const result = await response.json();
  return result.data;
};

export interface CurrentGuestFilter {
  startDate?: string;
  endDate?: string;
}

export const getCurrentGuests = async (filters?: CurrentGuestFilter): Promise<CurrentGuest[]> => {
  const token = getAuthToken();
  const queryParams = new URLSearchParams();
  if (filters?.startDate) queryParams.append('startDate', filters.startDate);
  if (filters?.endDate) queryParams.append('endDate', filters.endDate);

  const url = `${API_BASE_URL}/api/dashboard/current-guests${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch current guests");
  const result = await response.json();
  return result.data;
};

export const exportGuestsExcel = async (filters?: CurrentGuestFilter): Promise<void> => {
  const token = getAuthToken();
  const queryParams = new URLSearchParams();
  if (filters?.startDate) queryParams.append('startDate', filters.startDate);
  if (filters?.endDate) queryParams.append('endDate', filters.endDate);

  const url = `${API_BASE_URL}/api/dashboard/export-guests${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to export guests");
  
  const blob = await response.blob();
  const fileUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = fileUrl;
  
  const dateStr = new Date().toISOString().split('T')[0];
  link.download = `KhachDangLuuTru_${dateStr}.xlsx`;
  
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(fileUrl);
};

export interface ContactRequestData {
  id: number;
  senderName: string;
  email: string;
  message: string;
  isResolved: boolean;
  createdAt: string;
}

export const getContactRequests = async (): Promise<ContactRequestData[]> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/contact`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch contact requests");
  const result = await response.json();
  return result.data;
};

export const updateContactStatus = async (id: number, isResolved: boolean): Promise<void> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/contact/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isResolved }),
  });
  if (!response.ok) throw new Error("Failed to update contact status");
};
