import { Dish, Article, Branch, ReservationFormData } from '../types';
import { DISHES } from '../data/dishes';
import { ARTICLES } from '../data/news';
import { BRANCHES } from '../data/branches';
import { supabase, isSupabaseConfigured } from './supabase';

export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface AdminReservation {
  id: string; // Booking Code (e.g. PTBH-2026-8812)
  fullName: string;
  phone: string;
  email: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  branchId: string;
  branchName: string;
  notes: string;
  status: ReservationStatus;
  createdAt: string;
  isWalkIn?: boolean;
}

export interface AdminDish extends Dish {
  isAvailable: boolean;
}

export interface AdminInquiry {
  id: string;
  type: 'inquiry' | 'recruitment';
  fullName: string;
  phone: string;
  email?: string;
  position?: string;
  message?: string;
  status: 'new' | 'contacted' | 'resolved';
  createdAt: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  type: 'login_success' | 'login_failed' | 'password_changed' | 'pin_changed' | 'dish_status_toggled' | 'reservation_status_changed' | 'lockout_triggered';
  details: string;
  device: string;
}

export interface AdminSecurityConfig {
  username: string;
  passwordHash: string;
  pinCode: string;
  sessionTimeoutMinutes: number;
  failedAttempts: number;
  lockedUntil: number | null;
  maintenanceMode: boolean;
}

export interface AdminStoreData {
  reservations: AdminReservation[];
  dishes: AdminDish[];
  articles: Article[];
  branches: Branch[];
  inquiries: AdminInquiry[];
  securityConfig: AdminSecurityConfig;
  securityLogs: SecurityLog[];
}

const STORAGE_KEY = 'pho_thin_bo_ho_admin_data_v1';
const AUTH_SESSION_KEY = 'pho_thin_bo_ho_admin_session_v1';

// Initial fallback mock data
const INITIAL_RESERVATIONS: AdminReservation[] = [
  {
    id: 'PTBH-2026-8812',
    fullName: 'Nguyễn Hoàng Long',
    phone: '0912345678',
    email: 'hoanglong.ng@gmail.com',
    reservationDate: new Date().toISOString().split('T')[0],
    reservationTime: '11:30',
    partySize: 4,
    branchId: 'cs1-dinh-tien-hoang',
    branchName: 'CS1 - 61 Đinh Tiên Hoàng (Gốc)',
    notes: 'Bàn ngồi nhìn ra Hồ Gươm, gọi trước 4 bát phở Tái Chín đặc sản.',
    status: 'pending',
    createdAt: '10:15 - Hôm nay',
  },
  {
    id: 'PTBH-2026-7521',
    fullName: 'Trần Thuỳ Dung',
    phone: '0988776655',
    email: 'thuydung.tran@outlook.com',
    reservationDate: new Date().toISOString().split('T')[0],
    reservationTime: '12:00',
    partySize: 6,
    branchId: 'cs2-le-van-huu',
    branchName: 'CS2 - 1 Lê Văn Hưu',
    notes: 'Gia đình có người cao tuổi, cần chỗ ngồi thoáng tầng 1.',
    status: 'confirmed',
    createdAt: '09:40 - Hôm nay',
  },
  {
    id: 'PTBH-2026-6430',
    fullName: 'David Sterling (USA)',
    phone: '0934112233',
    email: 'david.traveler@gmail.com',
    reservationDate: new Date().toISOString().split('T')[0],
    reservationTime: '18:30',
    partySize: 2,
    branchId: 'cs1-dinh-tien-hoang',
    branchName: 'CS1 - 61 Đinh Tiên Hoàng (Gốc)',
    notes: 'Tourists wanting to try authentic US-DPRK summit pho recipe.',
    status: 'confirmed',
    createdAt: '08:20 - Hôm nay',
  },
  {
    id: 'PTBH-2026-5129',
    fullName: 'Vũ Minh Anh',
    phone: '0903456789',
    email: 'minhanh.vu@techcorp.vn',
    reservationDate: new Date().toISOString().split('T')[0],
    reservationTime: '08:00',
    partySize: 3,
    branchId: 'cs3-hang-tre',
    branchName: 'CS3 - 1 Hàng Tre',
    notes: 'Khách đối tác ăn sáng nhanh trước giờ họp.',
    status: 'completed',
    createdAt: '07:15 - Hôm nay',
  },
];

const INITIAL_INQUIRIES: AdminInquiry[] = [
  {
    id: 'INQ-101',
    type: 'inquiry',
    fullName: 'Bà Nguyễn Thị Mai',
    phone: '0912998877',
    email: 'mainguyen@gmail.com',
    message: 'Gia đình muốn đặt tiệc mừng thọ 25 người vào sáng Chủ Nhật tại cơ sở Hàng Tre, quán có set bàn dài không?',
    status: 'new',
    createdAt: '10:30 - Hôm nay',
  },
  {
    id: 'INQ-102',
    type: 'recruitment',
    fullName: 'Lê Tuấn Hưng',
    phone: '0978123456',
    email: 'tuanhung.le@gmail.com',
    position: 'Nhân viên Phục vụ ca Sáng (6h - 14h)',
    message: 'Sinh viên năm 2 ĐH Bách Khoa, có kinh nghiệm phục vụ nhà hàng 1 năm, nhanh nhẹn, tiếng Anh giao tiếp tốt.',
    status: 'new',
    createdAt: 'Hôm qua',
  },
];

// Helper to safely execute Supabase async queries
async function runAsync(action: () => PromiseLike<any>) {
  try {
    const res = await action();
    if (res && res.error) {
      console.warn('Supabase operation notice:', res.error.message);
    }
  } catch (err) {
    console.warn('Supabase operation warning:', err);
  }
}

class AdminStoreService {
  private data: AdminStoreData;

  constructor() {
    this.data = this.loadLocalData();
    this.initSupabaseSync();
  }

  private loadLocalData(): AdminStoreData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.dishes || parsed.dishes.length === 0) {
          parsed.dishes = DISHES.map((d) => ({ ...d, isAvailable: true }));
        }
        if (!parsed.branches || parsed.branches.length === 0) {
          parsed.branches = BRANCHES;
        }
        if (!parsed.articles || parsed.articles.length === 0) {
          parsed.articles = ARTICLES;
        }
        return parsed;
      }
    } catch {
      // Fallback
    }

    const initialData: AdminStoreData = {
      reservations: INITIAL_RESERVATIONS,
      dishes: DISHES.map((d) => ({ ...d, isAvailable: true })),
      articles: ARTICLES,
      branches: BRANCHES,
      inquiries: INITIAL_INQUIRIES,
      securityConfig: {
        username: 'admin_phothin',
        passwordHash: 'PhoThin1955@BoHo',
        pinCode: '195570',
        sessionTimeoutMinutes: 15,
        failedAttempts: 0,
        lockedUntil: null,
        maintenanceMode: false,
      },
      securityLogs: [
        {
          id: 'log-1',
          timestamp: new Date().toLocaleTimeString('vi-VN') + ' - Khởi tạo hệ thống',
          type: 'login_success',
          details: 'Khởi tạo tường lửa bảo mật Phở Thìn Bờ Hồ & kết nối Supabase Cloud',
          device: 'System Gateway / Node Protected',
        },
      ],
    };

    this.saveLocalData(initialData);
    return initialData;
  }

  private saveLocalData(data: AdminStoreData) {
    this.data = data;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new Event('phothin_store_updated'));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  // --- SUPABASE SYNC & REALTIME ---
  public async initSupabaseSync() {
    if (!isSupabaseConfigured) return;

    try {
      await this.syncAllFromSupabase();
      this.subscribeRealtime();
    } catch (e) {
      console.warn('Supabase sync skipped, will use local data until setup is complete:', e);
    }
  }

  public async syncAllFromSupabase(): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      // 1. Fetch Dishes
      const { data: dishesData, error: dishesErr } = await supabase
        .from('dishes')
        .select('*')
        .order('display_order', { ascending: true });

      if (!dishesErr && dishesData && dishesData.length > 0) {
        this.data.dishes = dishesData.map((d: any) => ({
          id: d.id,
          name: d.name,
          category: d.category,
          price: Number(d.price),
          formattedPrice: d.formatted_price || d.price.toLocaleString('vi-VN'),
          image: d.image,
          shortDescription: d.short_description,
          fullDescription: d.full_description,
          ingredients: d.ingredients,
          preparationNote: d.preparation_note,
          isSignature: Boolean(d.is_signature),
          isFeatured: Boolean(d.is_featured),
          isAvailable: d.is_available !== false,
        }));
      }

      // 2. Fetch Branches
      const { data: branchesData, error: branchErr } = await supabase
        .from('branches')
        .select('*')
        .order('display_order', { ascending: true });

      if (!branchErr && branchesData && branchesData.length > 0) {
        this.data.branches = branchesData.map((b: any) => ({
          id: b.id,
          code: b.code,
          name: b.name,
          address: b.address,
          district: b.district,
          phone: b.phone,
          openingHours: b.opening_hours,
          morningSlot: b.morning_slot,
          afternoonSlot: b.afternoon_slot,
          mapEmbedUrl: b.map_embed_url,
          googleMapsLink: b.google_maps_link,
          highlight: b.highlight,
          isOriginal: Boolean(b.is_original),
        }));
      }

      // 3. Fetch Articles
      const { data: articlesData, error: artErr } = await supabase
        .from('articles')
        .select('*')
        .order('display_order', { ascending: true });

      if (!artErr && articlesData && articlesData.length > 0) {
        this.data.articles = articlesData.map((a: any) => ({
          id: a.id,
          title: a.title,
          excerpt: a.excerpt,
          content: a.content,
          date: a.date_display,
          readTime: a.read_time,
          category: a.category,
          image: a.image,
          author: a.author,
          isHeroArticle: Boolean(a.is_hero),
        }));
      }

      // 4. Fetch Reservations (Admin / Authenticated)
      const { data: resData, error: resErr } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!resErr && resData) {
        this.data.reservations = resData.map((r: any) => ({
          id: r.booking_code || r.id,
          fullName: r.full_name,
          phone: r.phone,
          email: r.email || '',
          reservationDate: r.reservation_date,
          reservationTime: r.reservation_time,
          partySize: r.party_size,
          branchId: r.branch_id,
          branchName: r.branch_name || 'Chi nhánh Phở Thìn Bờ Hồ',
          notes: r.notes || '',
          status: r.status as ReservationStatus,
          createdAt: new Date(r.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(r.created_at).toLocaleDateString('vi-VN'),
          isWalkIn: Boolean(r.is_walk_in),
        }));
      }

      // 5. Fetch Inquiries
      const { data: inqData, error: inqErr } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!inqErr && inqData) {
        this.data.inquiries = inqData.map((i: any) => ({
          id: i.inquiry_code || i.id,
          type: i.type,
          fullName: i.full_name,
          phone: i.phone,
          email: i.email,
          position: i.position,
          message: i.message,
          status: i.status,
          createdAt: new Date(i.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(i.created_at).toLocaleDateString('vi-VN'),
        }));
      }

      this.saveLocalData(this.data);
      return true;
    } catch (e) {
      console.error('Error fetching data from Supabase:', e);
      return false;
    }
  }

  private subscribeRealtime() {
    try {
      supabase
        .channel('phothin_realtime_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'reservations' },
          () => {
            this.syncAllFromSupabase();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'dishes' },
          () => {
            this.syncAllFromSupabase();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'inquiries' },
          () => {
            this.syncAllFromSupabase();
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription error:', e);
    }
  }

  // --- PUBLIC GETTERS ---
  public getData(): AdminStoreData {
    return this.data;
  }

  public getDishes(): AdminDish[] {
    return this.data.dishes;
  }

  public getReservations(): AdminReservation[] {
    return this.data.reservations;
  }

  public getArticles(): Article[] {
    return this.data.articles;
  }

  public getBranches(): Branch[] {
    return this.data.branches;
  }

  public getInquiries(): AdminInquiry[] {
    return this.data.inquiries;
  }

  public getSecurityLogs(): SecurityLog[] {
    return this.data.securityLogs;
  }

  public getSecurityConfig(): AdminSecurityConfig {
    return this.data.securityConfig;
  }

  // --- SECURITY / AUTH METHODS ---
  public isLocked(): { locked: boolean; remainingSeconds: number } {
    const { lockedUntil } = this.data.securityConfig;
    if (!lockedUntil) return { locked: false, remainingSeconds: 0 };
    const now = Date.now();
    if (now < lockedUntil) {
      const remainingSeconds = Math.ceil((lockedUntil - now) / 1000);
      return { locked: true, remainingSeconds };
    }
    this.data.securityConfig.lockedUntil = null;
    this.data.securityConfig.failedAttempts = 0;
    this.saveLocalData(this.data);
    return { locked: false, remainingSeconds: 0 };
  }

  public recordFailedAttempt(device: string): { locked: boolean; attemptsLeft: number } {
    const config = this.data.securityConfig;
    config.failedAttempts += 1;
    let locked = false;

    if (config.failedAttempts >= 5) {
      config.lockedUntil = Date.now() + 60 * 1000;
      locked = true;
      this.addLog('lockout_triggered', 'Tạm khóa 60 giây do nhập sai thông tin 5 lần liên tiếp', device);
    } else {
      this.addLog('login_failed', `Đăng nhập thất bại (Lần ${config.failedAttempts}/5)`, device);
    }

    this.saveLocalData(this.data);
    return {
      locked,
      attemptsLeft: Math.max(0, 5 - config.failedAttempts),
    };
  }

  public authenticate(username: string, pass: string, pin: string, device: string): boolean {
    const lockStatus = this.isLocked();
    if (lockStatus.locked) {
      return false;
    }

    const config = this.data.securityConfig;
    const isUserValid = username.trim().toLowerCase() === config.username.trim().toLowerCase();
    const isPassValid = pass === config.passwordHash;
    const isPinValid = pin.trim() === config.pinCode.trim();

    if (isUserValid && isPassValid && isPinValid) {
      config.failedAttempts = 0;
      config.lockedUntil = null;
      this.addLog('login_success', `Đăng nhập quản trị thành công qua phiên bảo mật Supabase`, device);
      this.saveLocalData(this.data);

      const sessionExpiry = Date.now() + config.sessionTimeoutMinutes * 60 * 1000;
      sessionStorage.setItem(
        AUTH_SESSION_KEY,
        JSON.stringify({
          token: 'auth_' + Math.random().toString(36).substring(2),
          expiresAt: sessionExpiry,
          username: config.username,
        })
      );

      // Async trigger Supabase resync for admin tables
      this.syncAllFromSupabase();
      return true;
    }

    this.recordFailedAttempt(device);
    return false;
  }

  public isAuthenticated(): boolean {
    try {
      const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (Date.now() > parsed.expiresAt) {
        sessionStorage.removeItem(AUTH_SESSION_KEY);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  public logout(): void {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    supabase.auth.signOut().catch(() => {});
    this.addLog('login_success', 'Quản trị viên đã đăng xuất an toàn khỏi hệ thống', 'Client Logout');
    this.saveLocalData(this.data);
  }

  public updateSecurityCredentials(newUsername?: string, newPassword?: string, newPin?: string, newTimeout?: number): boolean {
    if (newUsername && newUsername.trim()) {
      this.data.securityConfig.username = newUsername.trim();
    }
    if (newPassword && newPassword.trim()) {
      this.data.securityConfig.passwordHash = newPassword.trim();
      this.addLog('password_changed', 'Đã đổi Mật khẩu quản trị thành công', 'Admin Security Panel');
    }
    if (newPin && newPin.trim().length === 6) {
      this.data.securityConfig.pinCode = newPin.trim();
      this.addLog('pin_changed', 'Đã cập nhật mã PIN cấp 2 (6 số)', 'Admin Security Panel');
    }
    if (newTimeout && newTimeout >= 5) {
      this.data.securityConfig.sessionTimeoutMinutes = newTimeout;
    }
    this.saveLocalData(this.data);
    return true;
  }

  private addLog(type: SecurityLog['type'], details: string, device: string) {
    const newLog: SecurityLog = {
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
      type,
      details,
      device,
    };
    this.data.securityLogs.unshift(newLog);
    if (this.data.securityLogs.length > 50) {
      this.data.securityLogs.pop();
    }

    if (isSupabaseConfigured) {
      runAsync(() =>
        supabase.from('security_audit_logs').insert({
          type,
          details,
          device,
        })
      );
    }
  }

  // --- RESERVATION OPERATIONS ---
  public addReservationFromClient(formData: ReservationFormData, branch: Branch): AdminReservation {
    const code = `PTBH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: AdminReservation = {
      id: code,
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      reservationDate: formData.reservationDate,
      reservationTime: formData.reservationTime,
      partySize: Number(formData.partySize) || 2,
      branchId: branch.id,
      branchName: `${branch.code}: ${branch.name.vi}`,
      notes: formData.notes,
      status: 'pending',
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - Hôm nay',
    };

    this.data.reservations.unshift(newRecord);
    this.saveLocalData(this.data);

    if (isSupabaseConfigured) {
      runAsync(() =>
        supabase.from('reservations').insert({
          booking_code: code,
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          reservation_date: formData.reservationDate,
          reservation_time: formData.reservationTime,
          party_size: Number(formData.partySize) || 2,
          branch_id: branch.id,
          branch_name: `${branch.code}: ${branch.name.vi}`,
          notes: formData.notes,
          status: 'pending',
          is_walk_in: false,
        })
      );
    }

    return newRecord;
  }

  public createManualReservation(record: Omit<AdminReservation, 'id' | 'createdAt'>): AdminReservation {
    const code = `PTBH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: AdminReservation = {
      ...record,
      id: code,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - Đặt tại quầy',
      isWalkIn: true,
    };
    this.data.reservations.unshift(newRecord);
    this.saveLocalData(this.data);

    if (isSupabaseConfigured) {
      runAsync(() =>
        supabase.from('reservations').insert({
          booking_code: code,
          full_name: record.fullName,
          phone: record.phone,
          email: record.email,
          reservation_date: record.reservationDate,
          reservation_time: record.reservationTime,
          party_size: record.partySize,
          branch_id: record.branchId,
          branch_name: record.branchName,
          notes: record.notes,
          status: record.status,
          is_walk_in: true,
        })
      );
    }

    return newRecord;
  }

  public updateReservationStatus(id: string, status: ReservationStatus): boolean {
    const item = this.data.reservations.find((r) => r.id === id);
    if (item) {
      item.status = status;
      this.addLog(
        'reservation_status_changed',
        `Cập nhật đơn đặt bàn #${id} -> Trạng thái: ${status}`,
        'Admin Portal'
      );
      this.saveLocalData(this.data);

      if (isSupabaseConfigured) {
        runAsync(() =>
          supabase
            .from('reservations')
            .update({ status })
            .eq('booking_code', id)
        );
      }

      return true;
    }
    return false;
  }

  public deleteReservation(id: string): boolean {
    const index = this.data.reservations.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.data.reservations.splice(index, 1);
      this.saveLocalData(this.data);

      if (isSupabaseConfigured) {
        runAsync(() =>
          supabase
            .from('reservations')
            .delete()
            .eq('booking_code', id)
        );
      }

      return true;
    }
    return false;
  }

  // --- DISHES OPERATIONS ---
  public toggleDishAvailability(id: string): boolean {
    const dish = this.data.dishes.find((d) => d.id === id);
    if (dish) {
      dish.isAvailable = !dish.isAvailable;
      this.addLog(
        'dish_status_toggled',
        `Đổi trạng thái món ${dish.name.vi}: ${dish.isAvailable ? 'Còn hàng' : 'Tạm hết món'}`,
        'Admin Menu Manager'
      );
      this.saveLocalData(this.data);

      if (isSupabaseConfigured) {
        runAsync(() =>
          supabase
            .from('dishes')
            .update({ is_available: dish.isAvailable })
            .eq('id', id)
        );
      }

      return true;
    }
    return false;
  }

  public updateDish(updated: AdminDish): boolean {
    const index = this.data.dishes.findIndex((d) => d.id === updated.id);
    if (index !== -1) {
      this.data.dishes[index] = updated;
      this.saveLocalData(this.data);

      if (isSupabaseConfigured) {
        runAsync(() =>
          supabase
            .from('dishes')
            .update({
              name: updated.name,
              category: updated.category,
              price: updated.price,
              formatted_price: updated.formattedPrice,
              image: updated.image,
              short_description: updated.shortDescription,
              full_description: updated.fullDescription,
              ingredients: updated.ingredients,
              preparation_note: updated.preparationNote,
              is_signature: updated.isSignature,
              is_featured: updated.isFeatured,
              is_available: updated.isAvailable,
            })
            .eq('id', updated.id)
        );
      }

      return true;
    }
    return false;
  }

  public addDish(newDish: AdminDish): boolean {
    this.data.dishes.push(newDish);
    this.saveLocalData(this.data);

    if (isSupabaseConfigured) {
      runAsync(() =>
        supabase.from('dishes').insert({
          id: newDish.id,
          name: newDish.name,
          category: newDish.category,
          price: newDish.price,
          formatted_price: newDish.formattedPrice,
          image: newDish.image,
          short_description: newDish.shortDescription,
          full_description: newDish.fullDescription,
          ingredients: newDish.ingredients,
          preparation_note: newDish.preparationNote,
          is_signature: newDish.isSignature,
          is_featured: newDish.isFeatured,
          is_available: newDish.isAvailable,
        })
      );
    }

    return true;
  }

  public deleteDish(id: string): boolean {
    const index = this.data.dishes.findIndex((d) => d.id === id);
    if (index !== -1) {
      this.data.dishes.splice(index, 1);
      this.saveLocalData(this.data);

      if (isSupabaseConfigured) {
        runAsync(() => supabase.from('dishes').delete().eq('id', id));
      }

      return true;
    }
    return false;
  }

  // --- INQUIRIES & RECRUITMENT OPERATIONS ---
  public addInquiry(inquiry: Omit<AdminInquiry, 'id' | 'createdAt' | 'status'>): AdminInquiry {
    const code = 'INQ-' + Date.now().toString().slice(-4);
    const newInquiry: AdminInquiry = {
      ...inquiry,
      id: code,
      status: 'new',
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - Vừa gửi',
    };
    this.data.inquiries.unshift(newInquiry);
    this.saveLocalData(this.data);

    if (isSupabaseConfigured) {
      runAsync(() =>
        supabase.from('inquiries').insert({
          inquiry_code: code,
          type: inquiry.type,
          full_name: inquiry.fullName,
          phone: inquiry.phone,
          email: inquiry.email,
          position: inquiry.position,
          message: inquiry.message,
          status: 'new',
        })
      );
    }

    return newInquiry;
  }

  public updateInquiryStatus(id: string, status: AdminInquiry['status']): boolean {
    const item = this.data.inquiries.find((i) => i.id === id);
    if (item) {
      item.status = status;
      this.saveLocalData(this.data);

      if (isSupabaseConfigured) {
        runAsync(() =>
          supabase
            .from('inquiries')
            .update({ status })
            .eq('inquiry_code', id)
        );
      }

      return true;
    }
    return false;
  }

  // --- BRANCHES OPERATIONS ---
  public updateBranch(updated: Branch): boolean {
    const index = this.data.branches.findIndex((b) => b.id === updated.id);
    if (index !== -1) {
      this.data.branches[index] = updated;
      this.saveLocalData(this.data);

      if (isSupabaseConfigured) {
        runAsync(() =>
          supabase
            .from('branches')
            .update({
              code: updated.code,
              name: updated.name,
              address: updated.address,
              district: updated.district,
              phone: updated.phone,
              opening_hours: updated.openingHours,
              morning_slot: updated.morningSlot,
              afternoon_slot: updated.afternoonSlot,
              map_embed_url: updated.mapEmbedUrl,
              google_maps_link: updated.googleMapsLink,
              highlight: updated.highlight,
            })
            .eq('id', updated.id)
        );
      }

      return true;
    }
    return false;
  }

  // --- ARTICLES OPERATIONS ---
  public addArticle(newArticle: Article): boolean {
    this.data.articles.unshift(newArticle);
    this.saveLocalData(this.data);

    if (isSupabaseConfigured) {
      runAsync(() =>
        supabase.from('articles').insert({
          id: newArticle.id,
          title: newArticle.title,
          excerpt: newArticle.excerpt,
          content: newArticle.content,
          date_display: newArticle.date,
          read_time: newArticle.readTime,
          category: newArticle.category,
          image: newArticle.image,
          author: newArticle.author,
          is_hero: newArticle.isHeroArticle,
        })
      );
    }

    return true;
  }

  public updateArticle(updated: Article): boolean {
    const index = this.data.articles.findIndex((a) => a.id === updated.id);
    if (index !== -1) {
      this.data.articles[index] = updated;
      this.saveLocalData(this.data);

      if (isSupabaseConfigured) {
        runAsync(() =>
          supabase
            .from('articles')
            .update({
              title: updated.title,
              excerpt: updated.excerpt,
              content: updated.content,
              date_display: updated.date,
              read_time: updated.readTime,
              category: updated.category,
              image: updated.image,
              author: updated.author,
              is_hero: updated.isHeroArticle,
            })
            .eq('id', updated.id)
        );
      }

      return true;
    }
    return false;
  }

  public deleteArticle(id: string): boolean {
    const index = this.data.articles.findIndex((a) => a.id === id);
    if (index !== -1) {
      this.data.articles.splice(index, 1);
      this.saveLocalData(this.data);

      if (isSupabaseConfigured) {
        runAsync(() => supabase.from('articles').delete().eq('id', id));
      }

      return true;
    }
    return false;
  }
}

export const adminStore = new AdminStoreService();
