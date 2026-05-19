import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  TrendingUp,
  Users,
  BedDouble,
  Download,
  Filter,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  MoreHorizontal,
  Plus,
  Eye,
  MapPin,
  Mail,
  ShieldCheck,
  ImageIcon,
  CalendarDays,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  clearAuthToken,
  getAuthRole,
  getAuthToken,
} from "../services/authService";
import {
  createHotel,
  deleteHotel,
  getHotels,
  type Hotel,
  updateHotel,
} from "../services/hotelService";
import {
  createUser,
  deleteUser,
  getUsers,
  type UserRecord,
  updateUser,
} from "../services/userService";
import {
  createRoom,
  deleteRoom,
  getRooms,
  type RoomRecord,
  updateRoom,
} from "../services/roomService";
import BookingService, { type BookingResponse } from "../services/bookingService";
import { useMessage } from "../components/MessageContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const roomStatusData = [
  { name: "Đang có khách", value: 8, color: "#1686cb" },
  { name: "Phòng trống", value: 3, color: "#10b981" },
  { name: "Đang dọn", value: 1, color: "#f59e0b" },
];

const guests = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    room: "203",
    checkin: "14/03/2026",
    checkout: "16/03/2026",
    status: "Active",
    type: "Premium",
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    room: "105",
    checkin: "13/03/2026",
    checkout: "15/03/2026",
    status: "Active",
    type: "Standard",
  },
  {
    id: 3,
    name: "Lê Văn Cường",
    room: "301",
    checkin: "12/03/2026",
    checkout: "14/03/2026",
    status: "Completed",
    type: "VIP",
  },
  {
    id: 4,
    name: "Phạm Minh Tuấn",
    room: "402",
    checkin: "11/03/2026",
    checkout: "13/03/2026",
    status: "Completed",
    type: "Standard",
  },
];

const stats = [
  {
    label: "Công suất phòng",
    value: "85%",
    trend: "+5.2%",
    icon: BedDouble,
    color: "#1686cb",
    accent: "blue",
  },
  {
    label: "Tổng khách tháng này",
    value: "124",
    trend: "+12.1%",
    icon: Users,
    color: "#8b5cf6",
    accent: "purple",
  },
  {
    label: "Doanh thu hôm nay",
    value: "4.2M ₫",
    trend: "+8.4%",
    icon: TrendingUp,
    color: "#10b981",
    accent: "green",
  },
  {
    label: "Yêu cầu hỗ trợ",
    value: "02",
    trend: "-1",
    icon: Bell,
    color: "#f59e0b",
    accent: "amber",
  },
];

type DashboardView = "overview" | "legal" | "hotels" | "rooms" | "users" | "bookings";

const emptyHotelForm = {
  name: "",
  address: "",
  description: "",
  mainImageUrl: "",
  imageGallery: "",
};
const emptyUserForm = {
  username: "",
  password: "",
  email: "",
  role: "Host",
  hotelId: "",
};
const emptyRoomForm = {
  roomNumber: "",
  roomType: "",
  price: "",
  isAvailable: true,
  description: "",
  mainImageUrl: "",
  imageGallery: "",
};

const OwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const currentRole = getAuthRole() ?? "Host";
  const isAdmin = currentRole === "Admin";
  const isHost = currentRole === "Host";
  const defaultView: DashboardView = "overview";
  const [view, setView] = useState<DashboardView>(() => {
    // Always use defaultView on fresh load
    return defaultView;
  });
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Hotel state
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [hotelsError, setHotelsError] = useState("");
  const [savingHotel, setSavingHotel] = useState(false);
  const [editingHotelId, setEditingHotelId] = useState<number | null>(null);
  const [hotelForm, setHotelForm] = useState(emptyHotelForm);
  const [hotelModalOpen, setHotelModalOpen] = useState(false);

  // User state
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [savingUser, setSavingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [userModalOpen, setUserModalOpen] = useState(false);

  // Room state
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState("");
  const [savingRoom, setSavingRoom] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [selectedHotelForRooms, setSelectedHotelForRooms] =
    useState<Hotel | null>(null);
  const [roomHotelId, setRoomHotelId] = useState("");
  const [roomForm, setRoomForm] = useState(emptyRoomForm);
  const [roomModalOpen, setRoomModalOpen] = useState(false);

  // Booking state
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState("");
  const [bookingFilterHotelId, setBookingFilterHotelId] = useState<string>("");
  const [viewBooking, setViewBooking] = useState<BookingResponse | null>(null);
  const [confirmDeleteBookingId, setConfirmDeleteBookingId] = useState<number | null>(null);

  // Search & pagination
  const PAGE_SIZE = 8;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Detail view state
  const [viewHotel, setViewHotel] = useState<Hotel | null>(null);
  const [viewRoom, setViewRoom] = useState<RoomRecord | null>(null);
  const [viewUser, setViewUser] = useState<UserRecord | null>(null);
  const [expandedUserHotels, setExpandedUserHotels] = useState(false);

  const loadHotels = async () => {
    setHotelsLoading(true);
    setHotelsError("");
    try {
      const data = await getHotels();
      setHotels(data);
    } catch (loadError) {
      setHotelsError(
        loadError instanceof Error
          ? loadError.message
          : "Không tải được khách sạn",
      );
    } finally {
      setHotelsLoading(false);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (loadError) {
      setUsersError(
        loadError instanceof Error
          ? loadError.message
          : "Không tải được tài khoản",
      );
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchUserDetail = async (userId: number) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = (await response.json()) as { data: UserRecord };
        setViewUser(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch user detail:", error);
    }
  };

  useEffect(() => {
    sessionStorage.setItem("db-view", view);
  }, [view]);

  useEffect(() => {
    if (view === "hotels" || view === "rooms" || view === "users" || view === "bookings")
      void loadHotels();
    if (view === "hotels" || view === "rooms") void loadRooms();
    if (view === "users") void loadUsers();
    if (view === "bookings") {
      void loadBookings();
      void loadRooms();
      setBookingFilterHotelId("");
    }
    setSearch("");
    setPage(1);
  }, [view]);

  useEffect(() => {
    if (isAdmin && (view === "hotels" || view === "rooms")) setView("users");
  }, [isAdmin, isHost, view]);

  const { notify } = useMessage();

  const handleLogout = () => {
    clearAuthToken();
    notify("logoutSuccess", "success");
    navigate("/login", { replace: true });
  };

  // ── Hotel handlers ──
  const openCreateHotel = () => {
    setHotelForm(emptyHotelForm);
    setEditingHotelId(null);
    setHotelsError("");
    setHotelModalOpen(true);
  };

  const openEditHotel = (hotel: Hotel) => {
    setEditingHotelId(hotel.id);
    setHotelForm({
      name: hotel.name,
      address: hotel.address,
      description: hotel.description ?? "",
      mainImageUrl: hotel.mainImageUrl ?? "",
      imageGallery: hotel.imageGallery?.join(", ") ?? "",
    });
    setHotelsError("");
    setHotelModalOpen(true);
  };

  const closeHotelModal = () => {
    setHotelModalOpen(false);
    setEditingHotelId(null);
    setHotelForm(emptyHotelForm);
    setHotelsError("");
  };

  const handleHotelSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingHotel(true);
    setHotelsError("");
    const payload = {
      name: hotelForm.name.trim(),
      address: hotelForm.address.trim(),
      description: hotelForm.description.trim(),
      mainImageUrl: hotelForm.mainImageUrl.trim(),
      imageGallery: hotelForm.imageGallery
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    try {
      if (editingHotelId !== null) {
        await updateHotel(editingHotelId, payload);
        notify("hotelUpdatedSuccess", "success");
      } else {
        await createHotel(payload);
        notify("hotelCreatedSuccess", "success");
      }
      await loadHotels();
      closeHotelModal();
    } catch (saveError) {
      const msg =
        saveError instanceof Error
          ? saveError.message
          : "Không lưu được khách sạn";
      setHotelsError(msg);
      notify("hotelLoadError", "error");
    } finally {
      setSavingHotel(false);
    }
  };

  const handleDeleteHotel = async (hotelId: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa khách sạn này?")) return;
    setHotelsError("");
    try {
      await deleteHotel(hotelId);
      notify("hotelDeletedSuccess", "success");
      await loadHotels();
    } catch (deleteError) {
      const msg =
        deleteError instanceof Error
          ? deleteError.message
          : "Không xóa được khách sạn";
      setHotelsError(msg);
      notify("hotelLoadError", "error");
    }
  };

  // ── User handlers ──
  const openCreateUser = async () => {
    setUserForm({ ...emptyUserForm, role: isHost ? "Guest" : "Host" });
    setEditingUserId(null);
    setUsersError("");
    if (hotels.length === 0) await loadHotels();
    setUserModalOpen(true);
  };

  const openEditUser = async (user: UserRecord) => {
    setEditingUserId(user.id);
    setUserForm({
      username: user.username,
      password: "",
      email: user.email ?? "",
      role: user.role ?? "Host",
      hotelId: String(user.hotelId || ""),
    });
    setUsersError("");
    if (hotels.length === 0) await loadHotels();
    setUserModalOpen(true);
  };

  const closeUserModal = () => {
    setUserModalOpen(false);
    setEditingUserId(null);
    setUserForm(emptyUserForm);
    setUsersError("");
  };

  const handleUserSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingUser(true);
    setUsersError("");
    const payload = {
      username: userForm.username.trim(),
      password: userForm.password.trim() || undefined,
      email: userForm.email.trim() || undefined,
      role: userForm.role.trim() || undefined,
      hotelId: Number(userForm.hotelId || 0),
    };
    try {
      if (editingUserId !== null) {
        await updateUser(editingUserId, payload);
        notify("userUpdatedSuccess", "success");
      } else {
        await createUser(payload);
        notify("userCreatedSuccess", "success");
      }
      await loadUsers();
      closeUserModal();
    } catch (saveError) {
      const msg =
        saveError instanceof Error
          ? saveError.message
          : "Không lưu được tài khoản";
      setUsersError(msg);
      notify("userLoadError", "error");
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài khoản này?")) return;
    setUsersError("");
    try {
      await deleteUser(userId);
      notify("userDeletedSuccess", "success");
      await loadUsers();
    } catch (deleteError) {
      const msg =
        deleteError instanceof Error
          ? deleteError.message
          : "Không xóa được tài khoản";
      setUsersError(msg);
      notify("userLoadError", "error");
    }
  };

  // ── Room handlers ──
  const loadRooms = async (hotelId?: number) => {
    setRoomsLoading(true);
    setRoomsError("");

    try {
      const data = await getRooms(hotelId);
      setRooms(data);
    } catch (loadError) {
      setRoomsError(
        loadError instanceof Error ? loadError.message : "Không tải được phòng",
      );
    } finally {
      setRoomsLoading(false);
    }
  };

  const openRoomManager = (hotel: Hotel) => {
    setSelectedHotelForRooms(hotel);
    setRoomHotelId(String(hotel.id));
    setRoomForm(emptyRoomForm);
    setEditingRoomId(null);
    setRooms([]);
    setRoomsError("");
    setRoomModalOpen(true);
    void loadRooms(hotel.id);
  };

  const handleOpenRoomCreator = () => {
    setRoomModalOpen(true);
    setEditingRoomId(null);
    setRoomsError("");
    setRoomForm(emptyRoomForm);

    const existingHotel = hotels[0];
    if (existingHotel) {
      setSelectedHotelForRooms(existingHotel);
      setRoomHotelId(String(existingHotel.id));
      void loadRooms(existingHotel.id);
      return;
    }

    setSelectedHotelForRooms(null);
    setRoomHotelId("");
    void loadHotels();
    void loadRooms();
  };

  const closeRoomManager = () => {
    setRoomModalOpen(false);
    setSelectedHotelForRooms(null);
    setRoomsError("");
    setEditingRoomId(null);
    setRoomForm(emptyRoomForm);
    setRoomHotelId("");
  };

  const openCreateRoom = () => {
    setRoomForm(emptyRoomForm);
    setEditingRoomId(null);
    setRoomsError("");
    setRoomHotelId(
      selectedHotelForRooms ? String(selectedHotelForRooms.id) : roomHotelId,
    );
  };

  const openEditRoom = (room: RoomRecord) => {
    setEditingRoomId(room.id);
    setRoomHotelId(String(room.hotelId));
    setSelectedHotelForRooms(
      hotels.find((hotel) => hotel.id === room.hotelId) ?? null,
    );
    setRoomForm({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      price: String(room.price ?? ""),
      isAvailable: room.isAvailable,
      description: room.description ?? "",
      mainImageUrl: room.mainImageUrl ?? "",
      imageGallery: room.imageGallery?.join(", ") ?? "",
    });
    setRoomsError("");
  };

  const handleRoomSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const targetHotelId = Number(roomHotelId || selectedHotelForRooms?.id || 0);
    if (!targetHotelId) {
      setRoomsError("Vui lòng chọn khách sạn trước khi lưu phòng");
      return;
    }

    setSavingRoom(true);
    setRoomsError("");

    const payload = {
      roomNumber: roomForm.roomNumber.trim(),
      roomType: roomForm.roomType.trim(),
      price: Number(roomForm.price || 0),
      isAvailable: roomForm.isAvailable,
      description: roomForm.description.trim(),
      mainImageUrl: roomForm.mainImageUrl.trim(),
      imageGallery: roomForm.imageGallery
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    try {
      if (editingRoomId !== null) {
        await updateRoom(editingRoomId, payload);
        notify("roomUpdatedSuccess", "success");
      } else {
        await createRoom(targetHotelId, payload);
        notify("roomCreatedSuccess", "success");
      }

      closeRoomManager();
      await loadRooms();
    } catch (saveError) {
      const msg =
        saveError instanceof Error ? saveError.message : "Không lưu được phòng";
      setRoomsError(msg);
      notify("roomLoadError", "error");
    } finally {
      setSavingRoom(false);
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa phòng này?")) return;

    setRoomsError("");

    try {
      await deleteRoom(roomId);
      notify("roomDeletedSuccess", "success");
      await loadRooms(selectedHotelForRooms?.id);
    } catch (deleteError) {
      const msg =
        deleteError instanceof Error
          ? deleteError.message
          : "Không xóa được phòng";
      setRoomsError(msg);
      notify("roomLoadError", "error");
    }
  };

  // ── Booking handlers ──
  const loadBookings = async (filterHotelId?: number) => {
    setBookingsLoading(true);
    setBookingsError("");
    try {
      const data = await BookingService.getAllBookings(filterHotelId);
      setBookings(data);
    } catch (err) {
      setBookingsError(err instanceof Error ? err.message : "Không tải được danh sách booking");
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleDeleteBooking = (bookingId: number) => {
    setViewBooking(null);
    setConfirmDeleteBookingId(bookingId);
  };

  const executeDeleteBooking = async (bookingId: number) => {
    setConfirmDeleteBookingId(null);
    setViewBooking(null);
    setBookingsError("");
    try {
      await BookingService.deleteBooking(bookingId);
      notify("bookingDeletedSuccess", "success");
      await loadBookings(bookingFilterHotelId ? Number(bookingFilterHotelId) : undefined);
    } catch (err) {
      notify("bookingDeleteError", "error");
      setBookingsError(err instanceof Error ? err.message : "Không xóa được đặt phòng");
    }
  };

  const getHotelNameById = (hotelId: number) => {
    if (!hotelId || hotelId === 0) return "Chưa gắn khách sạn";
    const matched = hotels.find((h) => h.id === hotelId);
    return matched ? matched.name : "Chưa gắn khách sạn";
  };

  const getRoleLabel = (role?: string | null) => {
    if (role === "Admin") return "Quản trị viên";
    if (role === "Host") return "Chủ khách sạn";
    if (role === "Guest") return "Khách hàng";
    return role || "Chưa phân quyền";
  };

  const getRoomNumberById = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? `Phòng ${room.roomNumber}` : `#${roomId}`;
  };

  const getBookingStatusLabel = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      Confirmed: { label: "Đã xác nhận", cls: "db-badge-host" },
      CheckedIn: { label: "Đang ở", cls: "db-badge-active" },
      Completed: { label: "Đã trả phòng", cls: "db-badge-done" },
      Cancelled: { label: "Đã hủy", cls: "db-badge-cancel" },
    };
    return map[status] ?? { label: status, cls: "db-badge-done" };
  };

  const q = search.toLowerCase();
  const filteredBookings = bookings.filter(
    (b) =>
      b.guestName.toLowerCase().includes(q) ||
      b.guestCccd.toLowerCase().includes(q) ||
      getHotelNameById(b.hotelId).toLowerCase().includes(q),
  );
  const filteredHotels = hotels.filter(
    (h) =>
      h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q),
  );
  const filteredRooms = rooms.filter(
    (r) =>
      r.roomNumber.toLowerCase().includes(q) ||
      r.roomType.toLowerCase().includes(q) ||
      getHotelNameById(r.hotelId).toLowerCase().includes(q),
  );
  const filteredUsers = users
    .filter((u) => (isHost ? u.role === "Guest" : u.role !== "Admin"))
    .filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q),
    );
  const paginate = <T,>(arr: T[]) =>
    arr.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = (arr: unknown[]) =>
    Math.max(1, Math.ceil(arr.length / PAGE_SIZE));

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", display: "flex" }}>
      <style>{`
        :root { --sidebar-w: 256px; --brand: #1686cb; }

        .db-sidebar {
          width: var(--sidebar-w);
          background: linear-gradient(175deg, #0d1627 0%, #162340 60%, #1a2e52 100%);
          height: 100vh; position: fixed; left: 0; top: 0; z-index: 1000;
          display: flex; flex-direction: column;
          box-shadow: 4px 0 30px rgba(0,0,0,0.2);
          transition: left .3s cubic-bezier(.4,0,.2,1);
        }
        @media(max-width:991px){
          .db-sidebar{left:calc(-1 * var(--sidebar-w));}
          .db-sidebar.show{left:0;}
          .db-main{margin-left:0!important;max-width:100vw!important;}
        }
        .db-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:999;}
        .db-overlay.show{display:block;}

        .db-logo-wrap{padding:1.25rem 1.1rem 1rem;border-bottom:1px solid rgba(255,255,255,0.07);}
        .db-nav-label{padding:.9rem 1.1rem .35rem;font-size:.58rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.28);}
        .db-nav-btn{
          display:flex;align-items:center;gap:.7rem;
          padding:.6rem .9rem;margin:.1rem .7rem;
          border-radius:9px;color:rgba(255,255,255,.55);
          font-size:.855rem;font-weight:500;cursor:pointer;
          border:1px solid transparent;background:transparent;
          width:calc(100% - 1.4rem);text-align:left;transition:all .18s;
        }
        .db-nav-btn:hover{background:rgba(255,255,255,.07);color:#fff;}
        .db-nav-btn.active{background:rgba(22,134,203,.18);color:#7dd3f8;border-color:rgba(22,134,203,.25);}
        .db-sidebar-foot{padding:.9rem .7rem;border-top:1px solid rgba(255,255,255,.07);margin-top:auto;}
        .db-role-chip{padding:.6rem .9rem;border-radius:9px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);margin-bottom:.6rem;}
        .db-logout{display:flex;align-items:center;gap:.65rem;padding:.6rem .9rem;border-radius:9px;width:100%;border:1px solid rgba(239,68,68,.22);background:rgba(239,68,68,.07);color:#f87171;font-size:.855rem;font-weight:500;cursor:pointer;transition:all .18s;}
        .db-logout:hover{background:rgba(239,68,68,.16);color:#fca5a5;}

        .db-main{margin-left:var(--sidebar-w);max-width:calc(100vw - var(--sidebar-w));flex:1;min-height:100vh;display:flex;flex-direction:column;}
        .db-topbar{background:#fff;border-bottom:1px solid #e2e8f0;padding:.8rem 2rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;position:sticky;top:0;z-index:100;box-shadow:0 1px 4px rgba(0,0,0,.04);}
        .db-body{padding:1.75rem 2rem;flex:1;}

        /* Stat cards */
        .stat-card{background:#fff;border-radius:16px;padding:1.35rem 1.4rem;border:1px solid #e4ebf3;box-shadow:0 2px 8px rgba(0,0,0,.04);position:relative;overflow:hidden;transition:transform .2s,box-shadow .2s;}
        .stat-card::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:16px 16px 0 0;}
        .stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.08);}
        .stat-card.blue::after{background:linear-gradient(90deg,#1686cb,#38bdf8);}
        .stat-card.purple::after{background:linear-gradient(90deg,#8b5cf6,#c084fc);}
        .stat-card.green::after{background:linear-gradient(90deg,#10b981,#34d399);}
        .stat-card.amber::after{background:linear-gradient(90deg,#f59e0b,#fcd34d);}
        .stat-icon{width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;}

        /* Section card */
        .db-card{background:#fff;border-radius:16px;border:1px solid #e4ebf3;box-shadow:0 2px 10px rgba(0,0,0,.04);overflow:hidden;}
        .db-card-hd{padding:1rem 1.4rem;border-bottom:1px solid #f0f5f9;background:linear-gradient(180deg,#fafbfd,#f7f9fc);}

        /* Table */
        .db-tbl thead th{background:transparent;border-bottom:1px solid #eaf0f7;padding:.65rem 1rem;font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.09em;color:#9ab0c4;white-space:nowrap;}
        .db-tbl tbody td{padding:.82rem 1rem;border-bottom:1px solid #f1f5f9;font-size:.84rem;vertical-align:middle;color:#334155;}
        .db-tbl tbody tr:last-child td{border-bottom:none;}
        .db-tbl tbody tr:hover td{background:#fafbff;}

        /* Avatar */
        .db-av{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.83rem;flex-shrink:0;}

        /* Badges */
        .db-badge{display:inline-flex;align-items:center;padding:.28rem .65rem;border-radius:999px;font-size:.68rem;font-weight:700;}
        .db-badge-active{background:#ecfdf5;color:#059669;}
        .db-badge-done{background:#f1f5f9;color:#64748b;}
        .db-badge-admin{background:#ede9fe;color:#6d28d9;}
        .db-badge-host{background:#eff6ff;color:#1d4ed8;}
        .db-badge-cancel{background:#fff1f2;color:#e11d48;}
        .db-count{display:inline-flex;align-items:center;padding:.28rem .7rem;border-radius:999px;background:#eff6ff;color:#1d4ed8;font-size:.72rem;font-weight:700;border:1px solid #bfdbfe;}

        /* Icon buttons */
        .db-ibtn{width:30px;height:30px;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;border:1px solid;}
        .db-ibtn-edit{background:#eff6ff;color:#2563eb;border-color:#bfdbfe;}
        .db-ibtn-edit:hover{background:#2563eb;color:#fff;border-color:#2563eb;}
        .db-ibtn-del{background:#fff5f5;color:#dc2626;border-color:#fecaca;}
        .db-ibtn-del:hover{background:#dc2626;color:#fff;border-color:#dc2626;}
        .db-ibtn-view{background:#f0fdf4;color:#059669;border-color:#bbf7d0;}
        .db-ibtn-view:hover{background:#059669;color:#fff;border-color:#059669;}

        /* Detail modal info rows */
        .db-info-row{display:flex;flex-direction:column;gap:.2rem;padding:.65rem 0;border-bottom:1px solid #f1f5f9;}
        .db-info-row:last-child{border-bottom:none;}
        .db-info-val{font-size:.875rem;color:#0f172a;font-weight:500;line-height:1.5;}

        /* Search */
        .db-search{position:relative;width:230px;}
        .db-search input{width:100%;height:36px;padding:0 .75rem 0 2.1rem;border-radius:9px;border:1px solid #e2e8f0;background:#f8fafc;font-size:.83rem;outline:none;color:#334155;transition:all .2s;}
        .db-search input:focus{border-color:var(--brand);background:#fff;box-shadow:0 0 0 3px rgba(22,134,203,.1);}
        .db-search-ic{position:absolute;left:.6rem;top:50%;transform:translateY(-50%);color:#94a3b8;pointer-events:none;}

        /* Empty */
        .db-empty{padding:3.5rem 1.5rem;text-align:center;color:#94a3b8;}

        /* ── MODAL ── */
        .db-modal-backdrop{
          position:fixed;inset:0;background:rgba(10,15,30,0.55);
          z-index:2000;display:flex;align-items:center;justify-content:center;
          padding:1rem;
          animation:fadeIn .18s ease;
        }
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .db-modal{
          background:#fff;border-radius:20px;width:100%;max-width:520px;
          box-shadow:0 24px 64px rgba(0,0,0,0.25);
          overflow:hidden;
          animation:slideUp .22s cubic-bezier(.34,1.36,.64,1);
          max-height:90vh;display:flex;flex-direction:column;
        }
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .db-modal-hd{
          padding:1.35rem 1.5rem;
          background:linear-gradient(140deg,#0d1627 0%,#1a2e52 100%);
          display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;
          flex-shrink:0;
        }
        .db-modal-body{padding:1.5rem;overflow-y:auto;}
        .db-modal-foot{padding:1rem 1.5rem;border-top:1px solid #f0f5f9;display:flex;gap:.65rem;justify-content:flex-end;flex-shrink:0;}

        /* Form fields */
        .db-field-lbl{display:block;font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#64748b;margin-bottom:.35rem;}
        .db-inp{display:block;width:100%;height:44px;padding:0 .85rem;border-radius:10px;border:1px solid #d5e3f0;background:#f7fbff;font-size:.875rem;outline:none;color:#0f172a;transition:all .2s;box-sizing:border-box;}
        .db-inp:focus{border-color:var(--brand);background:#fff;box-shadow:0 0 0 3px rgba(22,134,203,.1);}
        .db-inp.textarea{height:auto;padding:.6rem .85rem;resize:vertical;min-height:76px;}
        .db-inp.select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right .75rem center;padding-right:2rem;}

        /* Buttons */
        .db-btn-primary{height:42px;border-radius:10px;border:none;background:linear-gradient(135deg,#1686cb 0%,#0f5fa8 100%);color:#fff;font-weight:700;font-size:.875rem;cursor:pointer;transition:all .2s;box-shadow:0 4px 12px rgba(22,134,203,.28);padding:0 1.5rem;}
        .db-btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 16px rgba(22,134,203,.38);}
        .db-btn-primary:disabled{opacity:.65;cursor:not-allowed;}
        .db-btn-ghost{height:42px;border-radius:10px;border:1px solid #e2e8f0;background:#f8fafc;color:#64748b;font-size:.855rem;font-weight:600;cursor:pointer;padding:0 1.2rem;transition:all .2s;}
        .db-btn-ghost:hover{background:#f1f5f9;color:#334155;}
        .db-btn-new{display:inline-flex;align-items:center;gap:.45rem;height:36px;padding:0 1rem;border-radius:9px;border:none;background:linear-gradient(135deg,#1686cb,#0f5fa8);color:#fff;font-size:.82rem;font-weight:700;cursor:pointer;box-shadow:0 3px 10px rgba(22,134,203,.3);transition:all .2s;}
        .db-btn-new:hover{transform:translateY(-1px);box-shadow:0 5px 14px rgba(22,134,203,.38);}

        .db-err{padding:.6rem .85rem;background:#fff5f5;border:1px solid #fecaca;border-radius:10px;font-size:.82rem;color:#dc2626;}
      `}</style>

      {/* Mobile overlay */}
      <div
        className={`db-overlay ${isSidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── SIDEBAR ── */}
      <aside className={`db-sidebar ${isSidebarOpen ? "show" : ""}`}>
        <div className="db-logo-wrap">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Link
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".65rem",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  background: "rgba(22,134,203,.15)",
                  border: "1px solid rgba(22,134,203,.3)",
                  borderRadius: "9px",
                  padding: "5px 6px",
                }}
              >
                <img
                  src="/images/catkaa.jpg"
                  alt="CATKAA"
                  style={{
                    height: "22px",
                    borderRadius: "5px",
                    display: "block",
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    color: "#60b8f5",
                    fontWeight: 800,
                    fontSize: ".95rem",
                    lineHeight: 1,
                  }}
                >
                  CATKAA
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,.38)",
                    fontSize: ".6rem",
                    marginTop: "3px",
                  }}
                >
                  {isAdmin ? "Quản trị hệ thống" : "Quản lý khách sạn"}
                </div>
              </div>
            </Link>
            <button
              className="btn d-lg-none p-0"
              onClick={() => setSidebarOpen(false)}
              style={{ color: "rgba(255,255,255,.45)" }}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        <nav style={{ flex: 1, padding: ".75rem 0" }}>
          <div className="db-nav-label">Menu chính</div>
          <button
            onClick={() => setView("overview")}
            className={`db-nav-btn ${view === "overview" ? "active" : ""}`}
          >
            <LayoutDashboard size={16} /> Tổng quan
          </button>
          {isHost ? (
            <>
              <button
                onClick={() => setView("users")}
                className={`db-nav-btn ${view === "users" ? "active" : ""}`}
              >
                <Users size={16} /> Khách hàng
              </button>
              <button
                onClick={() => setView("bookings")}
                className={`db-nav-btn ${view === "bookings" ? "active" : ""}`}
              >
                <CalendarDays size={16} /> Đặt phòng
              </button>
              <button
                onClick={() => setView("hotels")}
                className={`db-nav-btn ${view === "hotels" ? "active" : ""}`}
              >
                <Building2 size={16} /> Khách sạn
              </button>
              <button
                onClick={() => setView("rooms")}
                className={`db-nav-btn ${view === "rooms" ? "active" : ""}`}
              >
                <BedDouble size={16} /> Phòng
              </button>
            </>
          ) : null}
          {isAdmin ? (
            <>
              <button
                onClick={() => setView("bookings")}
                className={`db-nav-btn ${view === "bookings" ? "active" : ""}`}
              >
                <CalendarDays size={16} /> Đặt phòng
              </button>
              <button
                onClick={() => setView("users")}
                className={`db-nav-btn ${view === "users" ? "active" : ""}`}
              >
                <Users size={16} /> Tài khoản
              </button>
            </>
          ) : null}
        </nav>

        <div className="db-sidebar-foot">
          <div className="db-role-chip">
            <div
              style={{
                fontSize: ".62rem",
                color: "rgba(255,255,255,.38)",
                marginBottom: "2px",
              }}
            >
              Vai trò hiện tại
            </div>
            <div
              style={{
                fontSize: ".78rem",
                fontWeight: 700,
                color: "rgba(255,255,255,.82)",
              }}
            >
              {isAdmin ? "Quản trị viên" : "Chủ khách sạn"}
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="db-logout">
            <LogOut size={15} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="db-main">
        {/* Topbar */}
        <header className="db-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: ".85rem" }}>
            <button
              className="d-lg-none"
              onClick={() => setSidebarOpen(true)}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "9px",
                background: "#f1f5f9",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#64748b",
              }}
            >
              <Menu size={17} />
            </button>
            <div>
              <h5
                style={{
                  fontWeight: 800,
                  fontSize: "1rem",
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                {view === "overview"
                  ? "Tổng quan"
                  : view === "hotels"
                    ? "Quản lý khách sạn"
                    : view === "rooms"
                      ? "Quản lý phòng"
                      : view === "bookings"
                        ? "Quản lý đặt phòng"
                        : "Quản lý tài khoản"}
              </h5>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: ".7rem",
                  color: "#94a3b8",
                  marginTop: "2px",
                }}
              >
                <span>Trang quản trị</span>
                <ChevronRight size={9} />
                <span style={{ color: "#1686cb", fontWeight: 600 }}>
                  {view === "overview"
                    ? "Dashboard"
                    : view === "hotels"
                      ? "Khách sạn"
                      : view === "rooms"
                        ? "Phòng"
                        : view === "bookings"
                          ? "Đặt phòng"
                          : "Tài khoản"}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
            {/* <div className="db-search d-none d-lg-block">
              <Search className="db-search-ic" size={13} />
              <input type="text" placeholder="Tìm kiếm..." />
            </div> */}
            <button
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "9px",
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#64748b",
                position: "relative",
              }}
            >
              <Bell size={15} />
              <span
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#ef4444",
                }}
              />
            </button>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "9px",
                background: "linear-gradient(135deg,#1686cb,#0f5fa8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: ".78rem",
              }}
            >
              {isAdmin ? "A" : "H"}
            </div>
          </div>
        </header>

        {/* Page body */}
        <div className="db-body">
          {/* ══ OVERVIEW ══ */}
          {view === "overview" ? (
            <div>
              <div className="row g-3 mb-4">
                {stats.map((s, i) => (
                  <div key={i} className="col-6 col-md-3">
                    <div className={`stat-card ${s.accent}`}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: ".85rem",
                        }}
                      >
                        <div
                          className="stat-icon"
                          style={{ background: `${s.color}18`, color: s.color }}
                        >
                          <s.icon size={19} />
                        </div>
                        <span
                          style={{
                            fontSize: ".69rem",
                            fontWeight: 700,
                            color: s.trend.startsWith("-")
                              ? "#ef4444"
                              : "#10b981",
                            display: "flex",
                            alignItems: "center",
                            gap: "2px",
                          }}
                        >
                          <ArrowUpRight size={11} />
                          {s.trend}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: ".71rem",
                          color: "#64748b",
                          fontWeight: 600,
                          marginBottom: "4px",
                        }}
                      >
                        {s.label}
                      </div>
                      <div
                        style={{
                          fontSize: "1.45rem",
                          fontWeight: 800,
                          color: "#0f172a",
                        }}
                      >
                        {s.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="row g-4">
                <div className="col-xl-8">
                  <div className="db-card">
                    <div
                      className="db-card-hd"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: ".9rem",
                            color: "#0f172a",
                          }}
                        >
                          Khách đang lưu trú
                        </div>
                        <div
                          style={{
                            fontSize: ".7rem",
                            color: "#94a3b8",
                            marginTop: "2px",
                          }}
                        >
                          Cập nhật theo thời gian thực
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          style={{
                            height: "30px",
                            padding: "0 .65rem",
                            borderRadius: "8px",
                            background: "#f1f5f9",
                            border: "1px solid #e2e8f0",
                            color: "#64748b",
                            fontSize: ".75rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Filter size={11} />
                          Lọc
                        </button>
                        <button
                          style={{
                            height: "30px",
                            padding: "0 .65rem",
                            borderRadius: "8px",
                            background: "#f1f5f9",
                            border: "1px solid #e2e8f0",
                            color: "#64748b",
                            fontSize: ".75rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Download size={11} />
                          Xuất
                        </button>
                      </div>
                    </div>
                    <div className="table-responsive">
                      <table className="table db-tbl mb-0">
                        <thead>
                          <tr>
                            <th>Khách hàng</th>
                            <th>Phòng</th>
                            <th>Nhận phòng</th>
                            <th>Trả phòng</th>
                            <th>Trạng thái</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {guests.map((g) => (
                            <tr key={g.id}>
                              <td>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: ".6rem",
                                  }}
                                >
                                  <div
                                    className="db-av"
                                    style={{
                                      background: "#eff6ff",
                                      color: "#1686cb",
                                    }}
                                  >
                                    {g.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div
                                      style={{
                                        fontWeight: 700,
                                        color: "#0f172a",
                                        fontSize: ".84rem",
                                      }}
                                    >
                                      {g.name}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: ".68rem",
                                        color: "#94a3b8",
                                      }}
                                    >
                                      {g.type}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span
                                  style={{ fontWeight: 700, color: "#1686cb" }}
                                >
                                  P.{g.room}
                                </span>
                              </td>
                              <td
                                style={{ color: "#64748b", fontSize: ".81rem" }}
                              >
                                {g.checkin}
                              </td>
                              <td
                                style={{ color: "#64748b", fontSize: ".81rem" }}
                              >
                                {g.checkout}
                              </td>
                              <td>
                                <span
                                  className={`db-badge ${g.status === "Active" ? "db-badge-active" : "db-badge-done"}`}
                                >
                                  {g.status === "Active" ? "Đang ở" : "Đã rời"}
                                </span>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <button
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#94a3b8",
                                    padding: "2px",
                                  }}
                                >
                                  <MoreHorizontal size={15} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div
                      style={{
                        padding: ".65rem 1.4rem",
                        background: "#fafbfd",
                        borderTop: "1px solid #f0f5f9",
                        textAlign: "center",
                      }}
                    >
                      <button
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#1686cb",
                          fontWeight: 700,
                          fontSize: ".75rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                        }}
                      >
                        Xem tất cả <ChevronRight size={11} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-xl-4">
                  <div className="db-card" style={{ height: "100%" }}>
                    <div className="db-card-hd">
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: ".9rem",
                          color: "#0f172a",
                        }}
                      >
                        Tỷ lệ phòng
                      </div>
                      <div
                        style={{
                          fontSize: ".7rem",
                          color: "#94a3b8",
                          marginTop: "2px",
                        }}
                      >
                        Thống kê hôm nay
                      </div>
                    </div>
                    <div style={{ padding: "1.1rem 1.25rem" }}>
                      <ResponsiveContainer width="100%" height={170}>
                        <PieChart>
                          <Pie
                            data={roomStatusData}
                            innerRadius={52}
                            outerRadius={72}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={5}
                          >
                            {roomStatusData.map((e, i) => (
                              <Cell key={i} fill={e.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              borderRadius: "10px",
                              border: "none",
                              boxShadow: "0 4px 12px rgba(0,0,0,.1)",
                              fontSize: ".8rem",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ marginTop: ".5rem" }}>
                        {roomStatusData.map((d, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: ".5rem 0",
                              borderTop: "1px solid #f1f5f9",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: ".5rem",
                              }}
                            >
                              <div
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  background: d.color,
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                style={{ fontSize: ".76rem", color: "#64748b" }}
                              >
                                {d.name}
                              </span>
                            </div>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: ".78rem",
                                color: "#0f172a",
                              }}
                            >
                              {d.value} phòng
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : /* ══ HOTELS ══ */
          view === "hotels" ? (
            <div className="db-card">
              <div
                className="db-card-hd"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: ".9rem",
                      color: "#0f172a",
                    }}
                  >
                    Danh sách khách sạn
                  </div>
                  <div
                    style={{
                      fontSize: ".7rem",
                      color: "#94a3b8",
                      marginTop: "2px",
                    }}
                  >
                    Tất cả khách sạn đang quản lý
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".75rem",
                  }}
                >
                  <div className="db-search">
                    <Search className="db-search-ic" size={14} />
                    <input
                      placeholder="Tìm kiếm..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                    />
                  </div>
                  <button className="db-btn-new" onClick={openCreateHotel}>
                    <Plus size={14} /> Thêm khách sạn
                  </button>
                </div>
              </div>

              {hotelsError ? (
                <div style={{ padding: "0.75rem 1.4rem" }}>
                  <div className="db-err">{hotelsError}</div>
                </div>
              ) : null}

              <div className="table-responsive">
                <table className="table db-tbl mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Khách sạn</th>
                      <th>Địa chỉ</th>
                      <th>Phòng</th>
                      <th style={{ width: "80px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {hotelsLoading ? (
                      <tr>
                        <td colSpan={5} className="db-empty">
                          Đang tải dữ liệu...
                        </td>
                      </tr>
                    ) : filteredHotels.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="db-empty">
                          <Building2
                            size={30}
                            style={{
                              opacity: 0.25,
                              display: "block",
                              margin: "0 auto .5rem",
                            }}
                          />
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: ".88rem",
                              marginBottom: "4px",
                            }}
                          >
                            {search
                              ? "Không tìm thấy kết quả"
                              : "Chưa có khách sạn nào"}
                          </div>
                          {!search && (
                            <div style={{ fontSize: ".76rem" }}>
                              Nhấn <strong>Thêm khách sạn</strong> để bắt đầu.
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : (
                      paginate(filteredHotels).map((hotel, idx) => (
                        <tr key={hotel.id}>
                          <td
                            style={{
                              color: "#94a3b8",
                              fontSize: ".78rem",
                              width: "40px",
                            }}
                          >
                            {(page - 1) * PAGE_SIZE + idx + 1}
                          </td>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: ".7rem",
                              }}
                            >
                              <div
                                className="db-av"
                                style={{
                                  background: "#eff6ff",
                                  color: "#1686cb",
                                }}
                              >
                                {hotel.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div
                                  style={{ fontWeight: 700, color: "#0f172a" }}
                                >
                                  {hotel.name}
                                </div>
                                {hotel.description ? (
                                  <div
                                    style={{
                                      fontSize: ".71rem",
                                      color: "#94a3b8",
                                      marginTop: "2px",
                                      maxWidth: "240px",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {hotel.description}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td
                            style={{
                              color: "#64748b",
                              fontSize: ".81rem",
                              maxWidth: "220px",
                            }}
                          >
                            {hotel.address}
                          </td>
                          <td>
                            <span
                              className="db-count"
                              style={{ fontSize: ".7rem" }}
                            >
                              {
                                rooms.filter((r) => r.hotelId === hotel.id)
                                  .length
                              }{" "}
                              phòng
                            </span>
                          </td>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "6px",
                              }}
                            >
                              <button
                                className="db-ibtn db-ibtn-view"
                                type="button"
                                onClick={() => setViewHotel(hotel)}
                                title="Xem chi tiết"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                className="db-ibtn db-ibtn-edit"
                                type="button"
                                onClick={() => openRoomManager(hotel)}
                                title="Quản lý phòng"
                              >
                                <BedDouble size={13} />
                              </button>
                              <button
                                className="db-ibtn db-ibtn-edit"
                                type="button"
                                onClick={() => openEditHotel(hotel)}
                                title="Chỉnh sửa"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                className="db-ibtn db-ibtn-del"
                                type="button"
                                onClick={() => handleDeleteHotel(hotel.id)}
                                title="Xóa"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages(filteredHotels) > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "6px",
                    padding: "1rem",
                  }}
                >
                  <button
                    className="db-btn-ghost"
                    style={{ height: 32, padding: "0 .6rem" }}
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from(
                    { length: totalPages(filteredHotels) },
                    (_, i) => i + 1,
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{
                        height: 32,
                        minWidth: 32,
                        borderRadius: 8,
                        border: "1px solid",
                        borderColor: p === page ? "var(--brand)" : "#e2e8f0",
                        background: p === page ? "var(--brand)" : "#f8fafc",
                        color: p === page ? "#fff" : "#64748b",
                        fontWeight: 600,
                        fontSize: ".8rem",
                        cursor: "pointer",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className="db-btn-ghost"
                    style={{ height: 32, padding: "0 .6rem" }}
                    disabled={page === totalPages(filteredHotels)}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          ) : /* ══ ROOMS ══ */
          view === "rooms" ? (
            <div className="db-card">
              <div
                className="db-card-hd"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: ".9rem",
                      color: "#0f172a",
                    }}
                  >
                    Danh sách phòng
                  </div>
                  <div
                    style={{
                      fontSize: ".7rem",
                      color: "#94a3b8",
                      marginTop: "2px",
                    }}
                  >
                    Tất cả phòng đang quản lý
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".75rem",
                  }}
                >
                  <div className="db-search">
                    <Search className="db-search-ic" size={14} />
                    <input
                      placeholder="Tìm kiếm..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="db-btn-new"
                    onMouseDown={handleOpenRoomCreator}
                    onClick={handleOpenRoomCreator}
                  >
                    <Plus size={14} /> Thêm phòng
                  </button>
                </div>
              </div>

              {roomsError ? (
                <div style={{ padding: "0.75rem 1.4rem" }}>
                  <div className="db-err">{roomsError}</div>
                </div>
              ) : null}

              <div className="table-responsive">
                <table className="table db-tbl mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Phòng</th>
                      <th>Khách sạn</th>
                      <th>Loại</th>
                      <th>Giá</th>
                      <th>Trạng thái</th>
                      <th style={{ width: "80px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomsLoading ? (
                      <tr>
                        <td colSpan={7} className="db-empty">
                          Đang tải dữ liệu...
                        </td>
                      </tr>
                    ) : filteredRooms.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="db-empty">
                          <BedDouble
                            size={30}
                            style={{
                              opacity: 0.25,
                              display: "block",
                              margin: "0 auto .5rem",
                            }}
                          />
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: ".88rem",
                              marginBottom: "4px",
                            }}
                          >
                            {search
                              ? "Không tìm thấy kết quả"
                              : "Chưa có phòng nào"}
                          </div>
                          {!search && (
                            <div style={{ fontSize: ".76rem" }}>
                              Nhấn <strong>Thêm phòng</strong> để bắt đầu.
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : (
                      paginate(filteredRooms).map((room, idx) => (
                        <tr key={room.id}>
                          <td
                            style={{
                              color: "#94a3b8",
                              fontSize: ".78rem",
                              width: "40px",
                            }}
                          >
                            {(page - 1) * PAGE_SIZE + idx + 1}
                          </td>
                          <td style={{ fontWeight: 700, color: "#0f172a" }}>
                            {room.roomNumber}
                          </td>
                          <td style={{ color: "#64748b", fontSize: ".81rem" }}>
                            {getHotelNameById(room.hotelId)}
                          </td>
                          <td style={{ color: "#64748b", fontSize: ".81rem" }}>
                            {room.roomType}
                          </td>
                          <td style={{ color: "#64748b", fontSize: ".81rem" }}>
                            {room.price.toLocaleString("vi-VN")} đ
                          </td>
                          <td>
                            <span
                              className={`db-badge ${room.isAvailable ? "db-badge-active" : "db-badge-done"}`}
                            >
                              {room.isAvailable ? "Còn trống" : "Đã có khách"}
                            </span>
                          </td>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "6px",
                              }}
                            >
                              <button
                                className="db-ibtn db-ibtn-view"
                                type="button"
                                onClick={() => setViewRoom(room)}
                                title="Xem chi tiết"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                className="db-ibtn db-ibtn-edit"
                                type="button"
                                onClick={() => {
                                  const roomHotel = hotels.find(
                                    (hotel) => hotel.id === room.hotelId,
                                  );
                                  if (roomHotel) openRoomManager(roomHotel);
                                  else void handleOpenRoomCreator();
                                }}
                                title="Chỉnh sửa"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                className="db-ibtn db-ibtn-del"
                                type="button"
                                onClick={() => handleDeleteRoom(room.id)}
                                title="Xóa"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages(filteredRooms) > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "6px",
                    padding: "1rem",
                  }}
                >
                  <button
                    className="db-btn-ghost"
                    style={{ height: 32, padding: "0 .6rem" }}
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from(
                    { length: totalPages(filteredRooms) },
                    (_, i) => i + 1,
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{
                        height: 32,
                        minWidth: 32,
                        borderRadius: 8,
                        border: "1px solid",
                        borderColor: p === page ? "var(--brand)" : "#e2e8f0",
                        background: p === page ? "var(--brand)" : "#f8fafc",
                        color: p === page ? "#fff" : "#64748b",
                        fontWeight: 600,
                        fontSize: ".8rem",
                        cursor: "pointer",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className="db-btn-ghost"
                    style={{ height: 32, padding: "0 .6rem" }}
                    disabled={page === totalPages(filteredRooms)}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          ) : view === "bookings" ? (
            /* ══ BOOKINGS ══ */
            <div className="db-card">
              <div className="db-card-hd" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".75rem" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: ".9rem", color: "#0f172a" }}>Danh sách đặt phòng</div>
                  <div style={{ fontSize: ".7rem", color: "#94a3b8", marginTop: "2px" }}>
                    {bookings.length} booking{bookings.length !== 1 ? "s" : ""} tổng cộng
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: ".65rem", flexWrap: "wrap" }}>
                  {/* Filter by hotel */}
                  <select
                    className="db-inp db-inp select"
                    style={{ height: 36, width: 200, fontSize: ".82rem", padding: "0 2rem 0 .75rem" }}
                    value={bookingFilterHotelId}
                    onChange={(e) => {
                      setBookingFilterHotelId(e.target.value);
                      setPage(1);
                      void loadBookings(e.target.value ? Number(e.target.value) : undefined);
                    }}
                  >
                    <option value="">Tất cả khách sạn</option>
                    {hotels.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                  <div className="db-search">
                    <Search className="db-search-ic" size={14} />
                    <input
                      placeholder="Tên khách, CCCD..."
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                  </div>
                </div>
              </div>

              {bookingsError && <div className="db-err" style={{ margin: "1rem 1.4rem 0" }}>{bookingsError}</div>}

              <div className="table-responsive">
                <table className="table db-tbl mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Khách</th>
                      <th>Mã booking</th>
                      <th>Khách sạn</th>
                      <th>Phòng</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Trạng thái</th>
                      <th style={{ width: 70 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingsLoading ? (
                      <tr><td colSpan={9} className="db-empty">Đang tải dữ liệu...</td></tr>
                    ) : filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="db-empty">
                          <CalendarDays size={30} style={{ opacity: 0.25, display: "block", margin: "0 auto .5rem" }} />
                          <div style={{ fontWeight: 600, fontSize: ".88rem", marginBottom: 4 }}>
                            {search ? "Không tìm thấy kết quả" : "Chưa có đặt phòng nào"}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginate(filteredBookings).map((b, idx) => {
                        const status = getBookingStatusLabel(b.status);
                        return (
                          <tr key={b.id}>
                            <td style={{ color: "#94a3b8", fontSize: ".78rem", width: 40 }}>
                              {(page - 1) * PAGE_SIZE + idx + 1}
                            </td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                                <div className="db-av" style={{ background: "#eff6ff", color: "#1686cb", fontSize: ".8rem" }}>
                                  {b.guestName.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontWeight: 700, color: "#0f172a", fontSize: ".84rem" }}>{b.guestName}</span>
                              </div>
                            </td>
                            <td style={{ color: "#64748b", fontSize: ".81rem", fontFamily: "monospace" }}>{b.bookingCode || `#${b.id}`}</td>
                            <td style={{ color: "#64748b", fontSize: ".81rem" }}>{getHotelNameById(b.hotelId)}</td>
                            <td style={{ fontWeight: 600, color: "#1686cb", fontSize: ".82rem" }}>{getRoomNumberById(b.roomId)}</td>
                            <td style={{ color: "#64748b", fontSize: ".81rem" }}>
                              {new Date(b.checkInDate).toLocaleDateString("vi-VN")}
                            </td>
                            <td style={{ color: "#64748b", fontSize: ".81rem" }}>
                              {new Date(b.checkOutDate).toLocaleDateString("vi-VN")}
                            </td>
                            <td><span className={`db-badge ${status.cls}`}>{status.label}</span></td>
                            <td>
                              <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                                <button className="db-ibtn db-ibtn-view" type="button" onClick={() => setViewBooking(b)} title="Xem chi tiết">
                                  <Eye size={13} />
                                </button>
                                <button className="db-ibtn db-ibtn-del" type="button" onClick={() => handleDeleteBooking(b.id)} title="Xóa">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages(filteredBookings) > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, padding: "1rem" }}>
                  <button className="db-btn-ghost" style={{ height: 32, padding: "0 .6rem" }} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages(filteredBookings) }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)} style={{ height: 32, minWidth: 32, borderRadius: 8, border: "1px solid", borderColor: p === page ? "var(--brand)" : "#e2e8f0", background: p === page ? "var(--brand)" : "#f8fafc", color: p === page ? "#fff" : "#64748b", fontWeight: 600, fontSize: ".8rem", cursor: "pointer" }}>
                      {p}
                    </button>
                  ))}
                  <button className="db-btn-ghost" style={{ height: 32, padding: "0 .6rem" }} disabled={page === totalPages(filteredBookings)} onClick={() => setPage((p) => p + 1)}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}

              {/* Confirm delete modal */}
              {confirmDeleteBookingId !== null && (
                <div className="db-modal-backdrop" onClick={() => setConfirmDeleteBookingId(null)}>
                  <div className="db-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
                    <div className="db-modal-hd" style={{ background: "linear-gradient(140deg,#7f1d1d 0%,#991b1b 100%)" }}>
                      <div>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>Xác nhận xóa</div>
                        <div style={{ color: "rgba(255,255,255,.5)", fontSize: ".72rem", marginTop: 2 }}>Hành động này không thể hoàn tác</div>
                      </div>
                      <button onClick={() => setConfirmDeleteBookingId(null)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,.5)", cursor: "pointer", padding: 4 }}>
                        <X size={18} />
                      </button>
                    </div>
                    <div className="db-modal-body" style={{ textAlign: "center", padding: "2rem 1.5rem" }}>
                      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fff1f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                        <Trash2 size={24} color="#e11d48" />
                      </div>
                      <p style={{ fontWeight: 700, color: "#0f172a", marginBottom: ".5rem" }}>Xóa đặt phòng này?</p>
                      <p style={{ color: "#64748b", fontSize: ".85rem", margin: 0 }}>
                        Tất cả dữ liệu liên quan (check-in, thanh toán) sẽ bị xóa theo.
                      </p>
                    </div>
                    <div className="db-modal-foot" style={{ justifyContent: "center", gap: "1rem" }}>
                      <button className="db-btn-ghost" style={{ minWidth: 110 }} onClick={() => setConfirmDeleteBookingId(null)}>
                        Hủy bỏ
                      </button>
                      <button
                        className="db-btn-primary"
                        style={{ minWidth: 110, background: "linear-gradient(135deg,#dc2626,#b91c1c)", boxShadow: "0 4px 12px rgba(220,38,38,.28)" }}
                        onClick={() => executeDeleteBooking(confirmDeleteBookingId)}
                      >
                        Xóa booking
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Detail modal */}
              {viewBooking && (
                <div className="db-modal-backdrop" onClick={() => setViewBooking(null)}>
                  <div className="db-modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
                    <div className="db-modal-hd">
                      <div>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>Chi tiết đặt phòng</div>
                        <div style={{ color: "rgba(255,255,255,.45)", fontSize: ".72rem", marginTop: 2 }}>Booking #{viewBooking.id}</div>
                      </div>
                      <button onClick={() => setViewBooking(null)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,.5)", cursor: "pointer", padding: 4 }}>
                        <X size={18} />
                      </button>
                    </div>
                    <div className="db-modal-body">
                      {([
                        ["Mã booking", viewBooking.bookingCode || `#${viewBooking.id}`],
                        ["Tên khách", viewBooking.guestName],
                        ["CCCD / CMND", viewBooking.guestCccd || "—"],
                        ["Khách sạn", getHotelNameById(viewBooking.hotelId)],
                        ["Phòng", getRoomNumberById(viewBooking.roomId)],
                        ["Check-in", new Date(viewBooking.checkInDate).toLocaleDateString("vi-VN")],
                        ["Check-out", new Date(viewBooking.checkOutDate).toLocaleDateString("vi-VN")],
                        ["Trạng thái", getBookingStatusLabel(viewBooking.status).label],
                      ] as [string, string][]).map(([label, val]) => (
                        <div key={label} className="db-info-row">
                          <span style={{ fontSize: ".67rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", color: "#94a3b8" }}>{label}</span>
                          <span className="db-info-val">{val}</span>
                        </div>
                      ))}
                    </div>
                    <div className="db-modal-foot">
                      <button className="db-btn-ghost" onClick={() => setViewBooking(null)}>Đóng</button>
                      <button className="db-btn-primary" style={{ background: "linear-gradient(135deg,#dc2626,#b91c1c)", boxShadow: "0 4px 12px rgba(220,38,38,.28)" }} onClick={() => handleDeleteBooking(viewBooking.id)}>
                        Xóa booking
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ══ USERS ══ */
            <div className="db-card">
              <div
                className="db-card-hd"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: ".9rem",
                      color: "#0f172a",
                    }}
                  >
                    Danh sách tài khoản
                  </div>
                  {/* <div
                    style={{
                      fontSize: ".7rem",
                      color: "#94a3b8",
                      marginTop: "2px",
                    }}
                  >
                    Phân quyền theo vai trò
                  </div> */}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".75rem",
                  }}
                >
                  <div className="db-search">
                    <Search className="db-search-ic" size={14} />
                    <input
                      placeholder="Tìm kiếm..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                    />
                  </div>
                  <button className="db-btn-new" onClick={openCreateUser}>
                    <Plus size={14} /> Tạo tài khoản
                  </button>
                </div>
              </div>

              {usersError ? (
                <div style={{ padding: "0.75rem 1.4rem" }}>
                  <div className="db-err">{usersError}</div>
                </div>
              ) : null}

              <div className="table-responsive">
                <table className="table db-tbl mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Tên đăng nhập</th>
                      <th>Email</th>
                      <th>Vai trò</th>
                      {/* <th>Khách sạn</th> */}
                      <th style={{ width: "80px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      <tr>
                        <td colSpan={6} className="db-empty">
                          Đang tải dữ liệu...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="db-empty">
                          <Users
                            size={30}
                            style={{
                              opacity: 0.25,
                              display: "block",
                              margin: "0 auto .5rem",
                            }}
                          />
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: ".88rem",
                              marginBottom: "4px",
                            }}
                          >
                            {search
                              ? "Không tìm thấy kết quả"
                              : "Chưa có tài khoản nào"}
                          </div>
                          {!search && (
                            <div style={{ fontSize: ".76rem" }}>
                              Nhấn <strong>Tạo tài khoản</strong> để bắt đầu.
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : (
                      paginate(filteredUsers).map((u, idx) => (
                        <tr key={u.id}>
                          <td
                            style={{
                              color: "#94a3b8",
                              fontSize: ".78rem",
                              width: "40px",
                            }}
                          >
                            {(page - 1) * PAGE_SIZE + idx + 1}
                          </td>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: ".7rem",
                              }}
                            >
                              <div
                                className="db-av"
                                style={{
                                  background: "#ede9fe",
                                  color: "#6d28d9",
                                }}
                              >
                                {u.username.charAt(0).toUpperCase()}
                              </div>
                              <span style={{ fontWeight: 700, color: "#0f172a" }}>
                                {u.username}
                              </span>
                            </div>
                          </td>
                          <td style={{ color: "#64748b", fontSize: ".81rem" }}>
                            {u.email || "—"}
                          </td>
                          <td>
                            <span
                              className={`db-badge ${u.role === "Admin" ? "db-badge-admin" : "db-badge-host"}`}
                            >
                              {getRoleLabel(u.role)}
                            </span>
                          </td>
                          {/* <td style={{ color: "#64748b", fontSize: ".81rem" }}>
                            {getHotelNameById(u.hotelId)}
                          </td> */}
                          <td>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "6px",
                              }}
                            >
                              <button
                                className="db-ibtn db-ibtn-view"
                                type="button"
                                onClick={() => setViewUser(u)}
                                title="Xem chi tiết"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                className="db-ibtn db-ibtn-edit"
                                type="button"
                                onClick={() => openEditUser(u)}
                                title="Chỉnh sửa"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                className="db-ibtn db-ibtn-del"
                                type="button"
                                onClick={() => handleDeleteUser(u.id)}
                                title="Xóa"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages(filteredUsers) > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "6px",
                    padding: "1rem",
                  }}
                >
                  <button
                    className="db-btn-ghost"
                    style={{ height: 32, padding: "0 .6rem" }}
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from(
                    { length: totalPages(filteredUsers) },
                    (_, i) => i + 1,
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{
                        height: 32,
                        minWidth: 32,
                        borderRadius: 8,
                        border: "1px solid",
                        borderColor: p === page ? "var(--brand)" : "#e2e8f0",
                        background: p === page ? "var(--brand)" : "#f8fafc",
                        color: p === page ? "#fff" : "#64748b",
                        fontWeight: 600,
                        fontSize: ".8rem",
                        cursor: "pointer",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className="db-btn-ghost"
                    style={{ height: 32, padding: "0 .6rem" }}
                    disabled={page === totalPages(filteredUsers)}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ══ ROOM MODAL ══ */}
      {roomModalOpen ? (
        <div
          className="db-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeRoomManager();
          }}
        >
          <div className="db-modal" style={{ maxWidth: "860px" }}>
            <div className="db-modal-hd">
              <div>
                <div
                  style={{
                    fontSize: ".6rem",
                    fontWeight: 800,
                    letterSpacing: ".16em",
                    textTransform: "uppercase",
                    color: "rgba(96,184,245,.75)",
                    marginBottom: "5px",
                  }}
                >
                  Quản lý phòng
                </div>
                <div
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 800,
                    color: "#fff",
                  }}
                >
                  {selectedHotelForRooms
                    ? selectedHotelForRooms.name
                    : "Chọn khách sạn để thêm phòng"}
                </div>
              </div>
              <button
                onClick={closeRoomManager}
                style={{
                  background: "rgba(255,255,255,.1)",
                  border: "1px solid rgba(255,255,255,.15)",
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "rgba(255,255,255,.7)",
                  flexShrink: 0,
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRoomSubmit} style={{ display: "contents" }}>
              <div
                className="db-modal-body"
                style={{ display: "grid", gap: "1rem" }}
              >
                <div style={{ display: "grid", gap: ".9rem" }}>
                  <div>
                    <label className="db-field-lbl">
                      Khách sạn <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <select
                      className="db-inp select"
                      value={roomHotelId}
                      onChange={(e) => setRoomHotelId(e.target.value)}
                    >
                      <option value="">Chọn khách sạn</option>
                      {hotels.map((hotel) => (
                        <option key={hotel.id} value={hotel.id}>
                          {hotel.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="db-field-lbl">
                        Số phòng <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        className="db-inp"
                        value={roomForm.roomNumber}
                        onChange={(e) =>
                          setRoomForm((c) => ({
                            ...c,
                            roomNumber: e.target.value,
                          }))
                        }
                        placeholder="101"
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="db-field-lbl">
                        Loại phòng <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        className="db-inp"
                        value={roomForm.roomType}
                        onChange={(e) =>
                          setRoomForm((c) => ({
                            ...c,
                            roomType: e.target.value,
                          }))
                        }
                        placeholder="Deluxe"
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="db-field-lbl">Giá</label>
                      <input
                        type="number"
                        className="db-inp"
                        value={roomForm.price}
                        onChange={(e) =>
                          setRoomForm((c) => ({ ...c, price: e.target.value }))
                        }
                        placeholder="900000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="db-field-lbl">Trạng thái</label>
                    <select
                      className="db-inp select"
                      value={roomForm.isAvailable ? "true" : "false"}
                      onChange={(e) =>
                        setRoomForm((c) => ({
                          ...c,
                          isAvailable: e.target.value === "true",
                        }))
                      }
                    >
                      <option value="true">Còn trống</option>
                      <option value="false">Đã có khách</option>
                    </select>
                  </div>

                  <div>
                    <label className="db-field-lbl">Mô tả</label>
                    <textarea
                      className="db-inp textarea"
                      rows={3}
                      value={roomForm.description}
                      onChange={(e) =>
                        setRoomForm((c) => ({
                          ...c,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Mô tả ngắn về phòng"
                    />
                  </div>

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="db-field-lbl">Ảnh chính (URL)</label>
                      <input
                        className="db-inp"
                        value={roomForm.mainImageUrl}
                        onChange={(e) =>
                          setRoomForm((c) => ({
                            ...c,
                            mainImageUrl: e.target.value,
                          }))
                        }
                        placeholder="https://.../room-cover.jpg"
                      />
                    </div>
                    <div className="col-12">
                      <label className="db-field-lbl">Gallery ảnh</label>
                      <textarea
                        className="db-inp textarea"
                        rows={2}
                        value={roomForm.imageGallery}
                        onChange={(e) =>
                          setRoomForm((c) => ({
                            ...c,
                            imageGallery: e.target.value,
                          }))
                        }
                        placeholder="https://img1.jpg, https://img2.jpg"
                      />
                    </div>
                  </div>

                  {roomsError ? (
                    <div className="db-err">{roomsError}</div>
                  ) : null}
                </div>

                <div
                  className="table-responsive"
                  style={{
                    borderTop: "1px solid #f1f5f9",
                    paddingTop: ".25rem",
                  }}
                >
                  <table className="table db-tbl mb-0">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Phòng</th>
                        <th>Loại</th>
                        <th>Giá</th>
                        <th>Trạng thái</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {roomsLoading ? (
                        <tr>
                          <td colSpan={6} className="db-empty">
                            Đang tải dữ liệu...
                          </td>
                        </tr>
                      ) : rooms.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="db-empty">
                            <BedDouble
                              size={28}
                              style={{
                                opacity: 0.25,
                                display: "block",
                                margin: "0 auto .5rem",
                              }}
                            />
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: ".88rem",
                                marginBottom: "4px",
                              }}
                            >
                              Chưa có phòng nào
                            </div>
                            <div style={{ fontSize: ".76rem" }}>
                              Thêm phòng mới để quản lý.
                            </div>
                          </td>
                        </tr>
                      ) : (
                        rooms.map((room, idx) => (
                          <tr key={room.id}>
                            <td
                              style={{
                                color: "#94a3b8",
                                fontSize: ".78rem",
                                width: "40px",
                              }}
                            >
                              {idx + 1}
                            </td>
                            <td style={{ fontWeight: 700, color: "#0f172a" }}>
                              {room.roomNumber}
                            </td>
                            <td
                              style={{ color: "#64748b", fontSize: ".81rem" }}
                            >
                              {room.roomType}
                            </td>
                            <td
                              style={{ color: "#64748b", fontSize: ".81rem" }}
                            >
                              {room.price.toLocaleString("vi-VN")} đ
                            </td>
                            <td>
                              <span
                                className={`db-badge ${room.isAvailable ? "db-badge-active" : "db-badge-done"}`}
                              >
                                {room.isAvailable ? "Còn trống" : "Đã có khách"}
                              </span>
                            </td>
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  gap: "6px",
                                }}
                              >
                                <button
                                  className="db-ibtn db-ibtn-edit"
                                  type="button"
                                  onClick={() => openEditRoom(room)}
                                  title="Chỉnh sửa"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  className="db-ibtn db-ibtn-del"
                                  type="button"
                                  onClick={() => handleDeleteRoom(room.id)}
                                  title="Xóa"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="db-modal-foot">
                <button
                  type="button"
                  className="db-btn-ghost"
                  onClick={closeRoomManager}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="db-btn-primary"
                  disabled={savingRoom}
                >
                  {savingRoom
                    ? "Đang lưu..."
                    : editingRoomId
                      ? "Cập nhật phòng"
                      : "Thêm phòng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* ══ HOTEL MODAL ══ */}
      {hotelModalOpen ? (
        <div
          className="db-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeHotelModal();
          }}
        >
          <div className="db-modal">
            <div className="db-modal-hd">
              <div>
                <div
                  style={{
                    fontSize: ".6rem",
                    fontWeight: 800,
                    letterSpacing: ".16em",
                    textTransform: "uppercase",
                    color: "rgba(96,184,245,.75)",
                    marginBottom: "5px",
                  }}
                >
                  Quản lý khách sạn
                </div>
                <div
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 800,
                    color: "#fff",
                  }}
                >
                  {editingHotelId ? "Cập nhật khách sạn" : "Thêm khách sạn mới"}
                </div>
              </div>
              <button
                onClick={closeHotelModal}
                style={{
                  background: "rgba(255,255,255,.1)",
                  border: "1px solid rgba(255,255,255,.15)",
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "rgba(255,255,255,.7)",
                  flexShrink: 0,
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleHotelSubmit} style={{ display: "contents" }}>
              <div
                className="db-modal-body"
                style={{ display: "grid", gap: ".9rem" }}
              >
                <div>
                  <label className="db-field-lbl">
                    Tên khách sạn <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    className="db-inp"
                    value={hotelForm.name}
                    onChange={(e) =>
                      setHotelForm((c) => ({ ...c, name: e.target.value }))
                    }
                    placeholder="CATKAA Hotel"
                    required
                  />
                </div>
                <div>
                  <label className="db-field-lbl">
                    Địa chỉ <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    className="db-inp"
                    value={hotelForm.address}
                    onChange={(e) =>
                      setHotelForm((c) => ({ ...c, address: e.target.value }))
                    }
                    placeholder="12 Nguyễn Huệ, Quận 1, TP.HCM"
                    required
                  />
                </div>
                <div>
                  <label className="db-field-lbl">Mô tả</label>
                  <textarea
                    className="db-inp textarea"
                    rows={3}
                    value={hotelForm.description}
                    onChange={(e) =>
                      setHotelForm((c) => ({
                        ...c,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Mô tả ngắn về khách sạn"
                  />
                </div>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="db-field-lbl">Ảnh chính (URL)</label>
                    <input
                      className="db-inp"
                      value={hotelForm.mainImageUrl}
                      onChange={(e) =>
                        setHotelForm((c) => ({
                          ...c,
                          mainImageUrl: e.target.value,
                        }))
                      }
                      placeholder="https://.../hotel-cover.jpg"
                    />
                  </div>
                  <div className="col-12">
                    <label className="db-field-lbl">
                      Gallery ảnh (cách nhau bằng dấu phẩy)
                    </label>
                    <textarea
                      className="db-inp textarea"
                      rows={2}
                      value={hotelForm.imageGallery}
                      onChange={(e) =>
                        setHotelForm((c) => ({
                          ...c,
                          imageGallery: e.target.value,
                        }))
                      }
                      placeholder="https://img1.jpg, https://img2.jpg"
                    />
                  </div>
                </div>
                {hotelsError ? (
                  <div className="db-err">{hotelsError}</div>
                ) : null}
              </div>

              <div className="db-modal-foot">
                <button
                  type="button"
                  className="db-btn-ghost"
                  onClick={closeHotelModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="db-btn-primary"
                  disabled={savingHotel}
                >
                  {savingHotel
                    ? "Đang lưu..."
                    : editingHotelId
                      ? "Cập nhật"
                      : "Thêm khách sạn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* ══ USER MODAL ══ */}
      {userModalOpen ? (
        <div
          className="db-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeUserModal();
          }}
        >
          <div className="db-modal">
            <div className="db-modal-hd">
              <div>
                <div
                  style={{
                    fontSize: ".6rem",
                    fontWeight: 800,
                    letterSpacing: ".16em",
                    textTransform: "uppercase",
                    color: "rgba(96,184,245,.75)",
                    marginBottom: "5px",
                  }}
                >
                  Quản lý tài khoản
                </div>
                <div
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 800,
                    color: "#fff",
                  }}
                >
                  {editingUserId ? "Cập nhật tài khoản" : "Tạo tài khoản mới"}
                </div>
              </div>
              <button
                onClick={closeUserModal}
                style={{
                  background: "rgba(255,255,255,.1)",
                  border: "1px solid rgba(255,255,255,.15)",
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "rgba(255,255,255,.7)",
                  flexShrink: 0,
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUserSubmit} style={{ display: "contents" }}>
              <div
                className="db-modal-body"
                style={{ display: "grid", gap: ".9rem" }}
              >
                <div>
                  <label className="db-field-lbl">
                    Tên đăng nhập <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    className="db-inp"
                    value={userForm.username}
                    onChange={(e) =>
                      setUserForm((c) => ({ ...c, username: e.target.value }))
                    }
                    placeholder="ten.dangnhap"
                    required
                  />
                </div>
                <div>
                  <label className="db-field-lbl">
                    {editingUserId ? "Mật khẩu mới" : "Mật khẩu"}{" "}
                    {!editingUserId ? (
                      <span style={{ color: "#ef4444" }}>*</span>
                    ) : (
                      <span
                        style={{
                          color: "#94a3b8",
                          fontWeight: 400,
                          textTransform: "none",
                          letterSpacing: 0,
                        }}
                      >
                        (để trống nếu không đổi)
                      </span>
                    )}
                  </label>
                  <input
                    type="password"
                    className="db-inp"
                    value={userForm.password}
                    onChange={(e) =>
                      setUserForm((c) => ({ ...c, password: e.target.value }))
                    }
                    placeholder={
                      editingUserId ? "Để trống nếu không đổi" : "Nhập mật khẩu"
                    }
                    required={!editingUserId}
                  />
                </div>
                <div>
                  <label className="db-field-lbl">Email</label>
                  <input
                    type="email"
                    className="db-inp"
                    value={userForm.email}
                    onChange={(e) =>
                      setUserForm((c) => ({ ...c, email: e.target.value }))
                    }
                    placeholder="email@catkaa.com"
                  />
                </div>
                <div>
                  <label className="db-field-lbl">Vai trò</label>
                  <select
                    className="db-inp select"
                    value={userForm.role}
                    onChange={(e) =>
                      setUserForm((c) => ({ ...c, role: e.target.value }))
                    }
                    disabled={isHost}
                  >
                    {isHost ? (
                      <option value="Guest">Khách hàng</option>
                    ) : (
                      <>
                        <option value="Host">Chủ khách sạn</option>
                        <option value="Admin">Quản trị viên</option>
                      </>
                    )}
                  </select>
                </div>
                {usersError ? <div className="db-err">{usersError}</div> : null}
              </div>

              <div className="db-modal-foot">
                <button
                  type="button"
                  className="db-btn-ghost"
                  onClick={closeUserModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="db-btn-primary"
                  disabled={savingUser}
                >
                  {savingUser
                    ? "Đang lưu..."
                    : editingUserId
                      ? "Cập nhật"
                      : "Tạo tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* ══ HOTEL DETAIL MODAL ══ */}
      {viewHotel ? (
        <div
          className="db-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewHotel(null);
          }}
        >
          <div className="db-modal" style={{ maxWidth: "540px" }}>
            <div className="db-modal-hd">
              <div>
                <div
                  style={{
                    fontSize: ".6rem",
                    fontWeight: 800,
                    letterSpacing: ".16em",
                    textTransform: "uppercase",
                    color: "rgba(96,184,245,.75)",
                    marginBottom: "5px",
                  }}
                >
                  Chi tiết khách sạn
                </div>
                <div
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 800,
                    color: "#fff",
                  }}
                >
                  {viewHotel.name}
                </div>
              </div>
              <button
                onClick={() => setViewHotel(null)}
                style={{
                  background: "rgba(255,255,255,.1)",
                  border: "1px solid rgba(255,255,255,.15)",
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "rgba(255,255,255,.7)",
                  flexShrink: 0,
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="db-modal-body" style={{ display: "grid", gap: 0 }}>
              <div className="db-info-row">
                <span
                  className="db-field-lbl"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".35rem",
                  }}
                >
                  <Building2 size={11} /> Tên khách sạn
                </span>
                <span className="db-info-val">{viewHotel.name}</span>
              </div>
              <div className="db-info-row">
                <span
                  className="db-field-lbl"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".35rem",
                  }}
                >
                  <MapPin size={11} /> Địa chỉ
                </span>
                <span className="db-info-val">{viewHotel.address}</span>
              </div>
              {viewHotel.description ? (
                <div className="db-info-row">
                  <span className="db-field-lbl">Mô tả</span>
                  <span className="db-info-val" style={{ color: "#64748b" }}>
                    {viewHotel.description}
                  </span>
                </div>
              ) : null}
              <div className="db-info-row">
                <span className="db-field-lbl">
                  <BedDouble
                    size={11}
                    style={{ display: "inline", marginRight: "4px" }}
                  />
                  Số phòng
                </span>
                <span className="db-count" style={{ width: "fit-content" }}>
                  {rooms.filter((r) => r.hotelId === viewHotel.id).length} phòng
                </span>
              </div>
              {viewHotel.mainImageUrl ? (
                <div className="db-info-row">
                  <span
                    className="db-field-lbl"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".35rem",
                    }}
                  >
                    <ImageIcon size={11} /> Ảnh chính
                  </span>
                  <img
                    src={viewHotel.mainImageUrl}
                    alt="hotel"
                    style={{
                      width: "100%",
                      height: "160px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      marginTop: "4px",
                    }}
                  />
                </div>
              ) : null}
              {viewHotel.imageGallery && viewHotel.imageGallery.length > 0 ? (
                <div className="db-info-row">
                  <span className="db-field-lbl">
                    Gallery ({viewHotel.imageGallery.length} ảnh)
                  </span>
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      flexWrap: "wrap",
                      marginTop: "4px",
                    }}
                  >
                    {viewHotel.imageGallery.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`gallery-${i}`}
                        style={{
                          width: "72px",
                          height: "52px",
                          objectFit: "cover",
                          borderRadius: "7px",
                          border: "1px solid #e2e8f0",
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="db-modal-foot">
              <button
                type="button"
                className="db-btn-ghost"
                onClick={() => setViewHotel(null)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="db-btn-primary"
                onClick={() => {
                  const h = viewHotel;
                  setViewHotel(null);
                  openEditHotel(h);
                }}
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ══ ROOM DETAIL MODAL ══ */}
      {viewRoom ? (
        <div
          className="db-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewRoom(null);
          }}
        >
          <div className="db-modal" style={{ maxWidth: "480px" }}>
            <div className="db-modal-hd">
              <div>
                <div
                  style={{
                    fontSize: ".6rem",
                    fontWeight: 800,
                    letterSpacing: ".16em",
                    textTransform: "uppercase",
                    color: "rgba(96,184,245,.75)",
                    marginBottom: "5px",
                  }}
                >
                  Chi tiết phòng
                </div>
                <div
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 800,
                    color: "#fff",
                  }}
                >
                  Phòng {viewRoom.roomNumber}
                </div>
              </div>
              <button
                onClick={() => setViewRoom(null)}
                style={{
                  background: "rgba(255,255,255,.1)",
                  border: "1px solid rgba(255,255,255,.15)",
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "rgba(255,255,255,.7)",
                  flexShrink: 0,
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="db-modal-body" style={{ display: "grid", gap: 0 }}>
              <div className="db-info-row">
                <span className="db-field-lbl">Số phòng</span>
                <span
                  className="db-info-val"
                  style={{
                    fontWeight: 800,
                    fontSize: "1rem",
                    color: "#1686cb",
                  }}
                >
                  {viewRoom.roomNumber}
                </span>
              </div>
              <div className="db-info-row">
                <span className="db-field-lbl">
                  <Building2
                    size={11}
                    style={{ display: "inline", marginRight: "4px" }}
                  />
                  Khách sạn
                </span>
                <span className="db-info-val">
                  {getHotelNameById(viewRoom.hotelId)}
                </span>
              </div>
              <div className="db-info-row">
                <span className="db-field-lbl">Loại phòng</span>
                <span className="db-info-val">{viewRoom.roomType}</span>
              </div>
              <div className="db-info-row">
                <span className="db-field-lbl">Giá / đêm</span>
                <span
                  className="db-info-val"
                  style={{ color: "#059669", fontWeight: 700 }}
                >
                  {viewRoom.price.toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="db-info-row">
                <span className="db-field-lbl">Trạng thái</span>
                <span
                  className={`db-badge ${viewRoom.isAvailable ? "db-badge-active" : "db-badge-done"}`}
                >
                  {viewRoom.isAvailable ? "Còn trống" : "Đã có khách"}
                </span>
              </div>
              {viewRoom.description ? (
                <div className="db-info-row">
                  <span className="db-field-lbl">Mô tả</span>
                  <span className="db-info-val" style={{ color: "#64748b" }}>
                    {viewRoom.description}
                  </span>
                </div>
              ) : null}
              {viewRoom.mainImageUrl ? (
                <div className="db-info-row">
                  <span
                    className="db-field-lbl"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".35rem",
                    }}
                  >
                    <ImageIcon size={11} /> Ảnh chính
                  </span>
                  <img
                    src={viewRoom.mainImageUrl}
                    alt="room"
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      marginTop: "4px",
                    }}
                  />
                </div>
              ) : null}
              {viewRoom.imageGallery && viewRoom.imageGallery.length > 0 ? (
                <div className="db-info-row">
                  <span className="db-field-lbl">
                    Gallery ({viewRoom.imageGallery.length} ảnh)
                  </span>
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      flexWrap: "wrap",
                      marginTop: "4px",
                    }}
                  >
                    {viewRoom.imageGallery.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`gallery-${i}`}
                        style={{
                          width: "72px",
                          height: "52px",
                          objectFit: "cover",
                          borderRadius: "7px",
                          border: "1px solid #e2e8f0",
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="db-modal-foot">
              <button
                type="button"
                className="db-btn-ghost"
                onClick={() => setViewRoom(null)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="db-btn-primary"
                onClick={() => {
                  const r = viewRoom;
                  setViewRoom(null);
                  const rh = hotels.find((h) => h.id === r.hotelId);
                  if (rh) openRoomManager(rh);
                }}
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ══ USER DETAIL MODAL ══ */}
      {viewUser ? (
        <div
          className="db-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewUser(null);
          }}
        >
          <div className="db-modal" style={{ maxWidth: "440px" }}>
            <div className="db-modal-hd">
              <div>
                <div
                  style={{
                    fontSize: ".6rem",
                    fontWeight: 800,
                    letterSpacing: ".16em",
                    textTransform: "uppercase",
                    color: "rgba(96,184,245,.75)",
                    marginBottom: "5px",
                  }}
                >
                  Chi tiết tài khoản
                </div>
                <div
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 800,
                    color: "#fff",
                  }}
                >
                  {viewUser.username}
                </div>
              </div>
              <button
                onClick={() => setViewUser(null)}
                style={{
                  background: "rgba(255,255,255,.1)",
                  border: "1px solid rgba(255,255,255,.15)",
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "rgba(255,255,255,.7)",
                  flexShrink: 0,
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="db-modal-body" style={{ display: "grid", gap: 0 }}>
              <div
                className="db-info-row"
                style={{
                  justifyContent: "center",
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "1rem",
                  marginBottom: ".25rem",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg,#ede9fe,#ddd6fe)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    color: "#6d28d9",
                    margin: "0 auto .5rem",
                  }}
                >
                  {viewUser.username.charAt(0).toUpperCase()}
                </div>
                <span
                  className={`db-badge ${viewUser.role === "Admin" ? "db-badge-admin" : "db-badge-host"}`}
                  style={{
                    display: "block",
                    width: "fit-content",
                    margin: "0 auto",
                  }}
                >
                  {getRoleLabel(viewUser.role)}
                </span>
              </div>
              <div className="db-info-row">
                <span className="db-field-lbl">Tên đăng nhập</span>
                <span className="db-info-val" style={{ fontWeight: 700 }}>
                  {viewUser.username}
                </span>
              </div>
              <div className="db-info-row">
                <span
                  className="db-field-lbl"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".35rem",
                  }}
                >
                  <Mail size={11} /> Email
                </span>
                <span className="db-info-val">
                  {viewUser.email || (
                    <span style={{ color: "#94a3b8" }}>Chưa cập nhật</span>
                  )}
                </span>
              </div>
              <div className="db-info-row">
                <span
                  className="db-field-lbl"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".35rem",
                  }}
                >
                  <ShieldCheck size={11} /> Vai trò
                </span>
                <span className="db-info-val">
                  {getRoleLabel(viewUser.role)}
                </span>
              </div>
              {viewUser?.role !== "Guest" && (
                <div className="db-info-row">
                  <span
                    className="db-field-lbl"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".35rem",
                    }}
                  >
                    <Building2 size={11} /> Khách sạn phụ trách
                  </span>
                </div>
              )}
              {viewUser?.role !== "Guest" &&
              viewUser?.hotels &&
              viewUser.hotels.length > 0 ? (
                <div style={{ marginTop: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setExpandedUserHotels(!expandedUserHotels)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "#f8fafc",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "#f1f5f9";
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "#94a3b8";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 2px 8px rgba(0, 0, 0, 0.06)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "#f8fafc";
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "#cbd5e1";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "none";
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <div
                        style={{
                          fontSize: ".95rem",
                          fontWeight: 600,
                          color: "#0f172a",
                          marginBottom: "4px",
                        }}
                      >
                        {viewUser.hotels[0].name}
                      </div>
                      <div
                        style={{
                          fontSize: ".8rem",
                          color: "#64748b",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        📍 {viewUser.hotels[0].address}
                      </div>
                      {viewUser.hotels.length > 1 && (
                        <div
                          style={{
                            fontSize: ".75rem",
                            color: "#60b8f5",
                            marginTop: "6px",
                            fontWeight: 500,
                          }}
                        >
                          +{viewUser.hotels.length - 1} khách sạn khác
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "1.2rem",
                        color: "#64748b",
                        transition: "transform 0.3s ease",
                        transform: expandedUserHotels
                          ? "rotate(180deg)"
                          : "rotate(0)",
                      }}
                    >
                      ▼
                    </span>
                  </button>

                  {expandedUserHotels && viewUser.hotels.length > 1 && (
                    <div
                      style={{
                        marginTop: "8px",
                        padding: "12px",
                        background: "#f8fafc",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        animation: "slideDown 0.3s ease",
                      }}
                    >
                      {viewUser.hotels.slice(1).map((hotel, idx) => (
                        <div
                          key={idx + 1}
                          style={{
                            padding: "10px",
                            background: "#fff",
                            borderRadius: "6px",
                            border: "1px solid #e2e8f0",
                            cursor: "default",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            (
                              e.currentTarget as HTMLDivElement
                            ).style.background = "#f1f5f9";
                            (
                              e.currentTarget as HTMLDivElement
                            ).style.borderColor = "#cbd5e1";
                          }}
                          onMouseLeave={(e) => {
                            (
                              e.currentTarget as HTMLDivElement
                            ).style.background = "#fff";
                            (
                              e.currentTarget as HTMLDivElement
                            ).style.borderColor = "#e2e8f0";
                          }}
                        >
                          <div
                            style={{
                              fontSize: ".9rem",
                              fontWeight: 600,
                              color: "#0f172a",
                              marginBottom: "3px",
                            }}
                          >
                            {hotel.name}
                          </div>
                          <div
                            style={{
                              fontSize: ".8rem",
                              color: "#64748b",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            📍 {hotel.address}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : viewUser?.role !== "Guest" ? (
                <div
                  style={{
                    marginTop: "8px",
                    padding: "12px",
                    background: "#f1f5f9",
                    borderRadius: "6px",
                    fontSize: ".9rem",
                    color: "#64748b",
                    textAlign: "center",
                  }}
                >
                  Chưa gắn khách sạn nào
                </div>
              ) : null}
            </div>
            <div className="db-modal-foot">
              <button
                type="button"
                className="db-btn-ghost"
                onClick={() => setViewUser(null)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="db-btn-primary"
                onClick={() => {
                  const u = viewUser;
                  setViewUser(null);
                  openEditUser(u);
                }}
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default OwnerDashboard;
