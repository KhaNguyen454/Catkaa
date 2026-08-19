import { API_BASE_URL } from "../config/apiConfig";
import { getAuthToken } from "./authService";

export interface RoomStatusChartData {
  name: string;
  value: number;
  color: string;
}

export interface DashboardSummary {
  roomOccupancyRate: string;
  totalGuestsThisMonth: number;
  todayRevenue: string;
  supportRequestsCount: number;
  roomStatusChart: RoomStatusChartData[];
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

export const getCurrentGuests = async (): Promise<CurrentGuest[]> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/dashboard/current-guests`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch current guests");
  const result = await response.json();
  return result.data;
};

export const exportGuestsExcel = async (): Promise<void> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/dashboard/export-guests`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to export guests");
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  
  const dateStr = new Date().toISOString().split('T')[0];
  link.download = `KhachDangLuuTru_${dateStr}.xlsx`;
  
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
