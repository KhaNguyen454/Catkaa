import { API_BASE_URL } from '../config/apiConfig';
import { getAuthToken, clearAuthToken } from "./authService";

export type RoomRecord = {
  id: number;
  hotelId: number;
  roomNumber: string;
  roomType: string;
  price: number;
  status: string;
  description?: string | null;
  mainImageUrl?: string | null;
  imageGallery?: string[] | null;
  roomPassword?: string;
};

export type RoomPayload = {
  roomNumber: string;
  roomType: string;
  price: number;
  status: string;
  description?: string;
  mainImageUrl?: string;
  imageGallery: string[];
};



async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
      window.location.href = "/login";
    }
    throw new Error(data?.message ?? "Không thể thao tác phòng");
  }

  return data as T;
}

export function getRooms(filterHotelId?: number) {
  const query = filterHotelId ? `?filterHotelId=${filterHotelId}` : "";
  return request<RoomRecord[]>(`/api/rooms${query}`);
}

export function getRoomById(id: number) {
  return request<RoomRecord>(`/api/rooms/${id}`);
}

export function createRoom(hotelId: number, payload: RoomPayload) {
  return request<{ message?: string; data?: RoomRecord }>(
    `/api/rooms/hotel/${hotelId}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function updateRoom(id: number, payload: RoomPayload) {
  return request<{ message?: string }>(`/api/rooms/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteRoom(id: number) {
  return request<{ message?: string }>(`/api/rooms/${id}`, {
    method: "DELETE",
  });
}
