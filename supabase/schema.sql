-- ==============================================================================
-- PHỞ THÌN BỜ HỒ (HÀ NỘI 1955) - COMPLETE SUPABASE DATABASE SCHEMA
-- PostgreSQL + Row Level Security (RLS) + Realtime + Seed Data
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. BẢNG CƠ SỞ (BRANCHES) - 4 Cơ sở chính thức tại Hà Nội
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.branches (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name JSONB NOT NULL,
    address TEXT NOT NULL,
    district TEXT NOT NULL,
    phone TEXT NOT NULL,
    opening_hours TEXT NOT NULL,
    morning_slot TEXT NOT NULL,
    afternoon_slot TEXT NOT NULL,
    map_embed_url TEXT,
    google_maps_link TEXT,
    highlight JSONB NOT NULL,
    is_original BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. BẢNG MÓN ĂN & THỰC ĐƠN (DISHES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dishes (
    id TEXT PRIMARY KEY,
    name JSONB NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('pho', 'drinks', 'others')),
    price NUMERIC NOT NULL DEFAULT 0,
    formatted_price TEXT,
    image TEXT NOT NULL,
    short_description JSONB NOT NULL,
    full_description JSONB NOT NULL,
    ingredients JSONB NOT NULL,
    preparation_note JSONB,
    is_signature BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. BẢNG BÀI VIẾT & BẢNG TIN (ARTICLES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.articles (
    id TEXT PRIMARY KEY,
    title JSONB NOT NULL,
    excerpt JSONB NOT NULL,
    content JSONB NOT NULL,
    date_display TEXT NOT NULL,
    read_time TEXT DEFAULT '5 phút đọc',
    category JSONB NOT NULL,
    image TEXT NOT NULL,
    author TEXT DEFAULT 'Ban Truyền Thông Phở Thìn Bờ Hồ',
    is_hero BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. BẢNG ĐẶT BÀN (RESERVATIONS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    reservation_date DATE NOT NULL,
    reservation_time TEXT NOT NULL,
    party_size INT NOT NULL DEFAULT 2,
    branch_id TEXT REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE SET NULL,
    branch_name TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    is_walk_in BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. BẢNG TIN NHẮN KHÁCH HÀNG & ỨNG VIÊN TUYỂN DỤNG (INQUIRIES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('inquiry', 'recruitment')),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    position TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. BẢNG HỒ SƠ QUẢN TRỊ VIÊN (ADMIN PROFILES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'staff')),
    pin_code TEXT DEFAULT '195570',
    session_timeout_minutes INT DEFAULT 15,
    failed_attempts INT DEFAULT 0,
    locked_until TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. BẢNG NHẬT KÝ BẢO MẬT & VẬN HÀNH (SECURITY AUDIT LOGS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    type TEXT NOT NULL,
    details TEXT NOT NULL,
    device TEXT DEFAULT 'System'
);

-- ==============================================================================
-- KÍCH HOẠT ROW LEVEL SECURITY (RLS) CHO TOÀN BỘ 7 BẢNG
-- ==============================================================================
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- CHÍNH SÁCH RLS (POLICIES)
-- ------------------------------------------------------------------------------

-- [BRANCHES] - Mọi người đều được đọc; Chỉ admin được sửa
DROP POLICY IF EXISTS "Public branches read access" ON public.branches;
CREATE POLICY "Public branches read access" 
ON public.branches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin branches write access" ON public.branches;
CREATE POLICY "Admin branches write access" 
ON public.branches FOR ALL 
TO authenticated 
USING (true) WITH CHECK (true);

-- [DISHES] - Mọi người đều được đọc thực đơn; Chỉ admin được thêm/sửa/xoá/bật-tắt
DROP POLICY IF EXISTS "Public dishes read access" ON public.dishes;
CREATE POLICY "Public dishes read access" 
ON public.dishes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin dishes write access" ON public.dishes;
CREATE POLICY "Admin dishes write access" 
ON public.dishes FOR ALL 
TO authenticated 
USING (true) WITH CHECK (true);

-- [ARTICLES] - Mọi người đều đọc được bảng tin; Chỉ admin được biên tập
DROP POLICY IF EXISTS "Public articles read access" ON public.articles;
CREATE POLICY "Public articles read access" 
ON public.articles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin articles write access" ON public.articles;
CREATE POLICY "Admin articles write access" 
ON public.articles FOR ALL 
TO authenticated 
USING (true) WITH CHECK (true);

-- [RESERVATIONS] - Khách vãng lai (anon) được gửi đơn đặt; Admin toàn quyền xem và duyệt
DROP POLICY IF EXISTS "Public create reservation" ON public.reservations;
CREATE POLICY "Public create reservation" 
ON public.reservations FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage reservations" ON public.reservations;
CREATE POLICY "Admin manage reservations" 
ON public.reservations FOR ALL 
TO authenticated 
USING (true) WITH CHECK (true);

-- [INQUIRIES] - Khách và ứng viên gửi đơn tự do; Chỉ admin đọc và đổi trạng thái
DROP POLICY IF EXISTS "Public create inquiry" ON public.inquiries;
CREATE POLICY "Public create inquiry" 
ON public.inquiries FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage inquiries" ON public.inquiries;
CREATE POLICY "Admin manage inquiries" 
ON public.inquiries FOR ALL 
TO authenticated 
USING (true) WITH CHECK (true);

-- [ADMIN_PROFILES] - Chỉ tài khoản đã đăng nhập đọc/cập nhật hồ sơ của mình
DROP POLICY IF EXISTS "Admin manage own profile" ON public.admin_profiles;
CREATE POLICY "Admin manage own profile" 
ON public.admin_profiles FOR ALL 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- [SECURITY_AUDIT_LOGS] - Khách ghi nhận log sự kiện, Admin xem toàn bộ
DROP POLICY IF EXISTS "Public insert security log" ON public.security_audit_logs;
CREATE POLICY "Public insert security log" 
ON public.security_audit_logs FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin read security logs" ON public.security_audit_logs;
CREATE POLICY "Admin read security logs" 
ON public.security_audit_logs FOR SELECT 
TO authenticated 
USING (true);

-- ------------------------------------------------------------------------------
-- THIẾT LẬP REALTIME CHO CÁC BẢNG QUAN TRỌNG
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.dishes;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.inquiries;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;



