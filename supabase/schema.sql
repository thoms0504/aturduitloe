-- =============================================
-- CashFlow Tracker — Supabase Schema (dengan Auth)
-- Jalankan seluruh file ini di Supabase SQL Editor
-- =============================================

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  type       VARCHAR(20)  NOT NULL CHECK (type IN ('income','expense','investment')),
  icon       VARCHAR(10)  DEFAULT '💰',
  color      VARCHAR(20)  DEFAULT '#6B7280',
  is_default BOOLEAN      DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS transactions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount      DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  type        VARCHAR(20)   NOT NULL CHECK (type IN ('income','expense','investment')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  notes       TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_transactions_user    ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date    ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type    ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_cat     ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_type      ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_user      ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_default   ON categories(is_default);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- CATEGORIES policies
-- Semua user bisa baca kategori default
CREATE POLICY "categories_read_default"
  ON categories FOR SELECT
  USING (is_default = true);

-- User hanya bisa baca/tulis kategori miliknya sendiri
CREATE POLICY "categories_read_own"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "categories_insert_own"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "categories_update_own"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "categories_delete_own"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- TRANSACTIONS policies
-- User hanya bisa akses transaksi miliknya
CREATE POLICY "transactions_read_own"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert_own"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_update_own"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "transactions_delete_own"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- DEFAULT CATEGORIES (user_id = NULL = global)
-- =============================================

-- INCOME
INSERT INTO categories (name, type, icon, color, is_default) VALUES
  ('Gaji',                  'income', '💼', '#10B981', true),
  ('Tunjangan',             'income', '🎁', '#059669', true),
  ('Uang Perjalanan Dinas', 'income', '✈️', '#34D399', true),
  ('Bonus',                 'income', '🏆', '#6EE7B7', true),
  ('Freelance',             'income', '💻', '#A7F3D0', true),
  ('Pendapatan Lainnya',    'income', '💰', '#4ADE80', true);

-- EXPENSE
INSERT INTO categories (name, type, icon, color, is_default) VALUES
  ('Listrik',             'expense', '⚡', '#F59E0B', true),
  ('Air',                 'expense', '💧', '#3B82F6', true),
  ('Persembahan',         'expense', '⛪', '#8B5CF6', true),
  ('Makanan & Minuman',   'expense', '🍽️', '#EF4444', true),
  ('Jajan',               'expense', '🍜', '#F97316', true),
  ('Barang',              'expense', '🛒', '#EC4899', true),
  ('Transportasi',        'expense', '🚗', '#14B8A6', true),
  ('Akomodasi',           'expense', '🏠', '#6366F1', true),
  ('Kesehatan',           'expense', '🏥', '#F43F5E', true),
  ('Pendidikan',          'expense', '📖', '#0EA5E9', true),
  ('Hiburan',             'expense', '🎬', '#A855F7', true),
  ('Pengeluaran Lainnya', 'expense', '📋', '#9CA3AF', true);

-- INVESTMENT
INSERT INTO categories (name, type, icon, color, is_default) VALUES
  ('Saham Luar Negeri', 'investment', '📈', '#F59E0B', true),
  ('Saham Indonesia',   'investment', '📊', '#EAB308', true),
  ('Reksa Dana',        'investment', '💹', '#84CC16', true),
  ('Emas',              'investment', '🥇', '#FCD34D', true),
  ('Pengetahuan',       'investment', '📚', '#818CF8', true),
  ('Kripto',            'investment', '₿',  '#F97316', true),
  ('Deposito',          'investment', '🏦', '#06B6D4', true),
  ('Investasi Lainnya', 'investment', '💎', '#D946EF', true);
