# 💰 CashFlow Tracker

Aplikasi tracking arus kas keuangan pribadi dengan **sistem login**, dashboard interaktif, analisis AI (Gemini), dan Supabase sebagai backend.

## ✨ Fitur

| Fitur               | Keterangan                                           |
| ------------------- | ---------------------------------------------------- |
| 🔐 Login & Register | Autentikasi email + password via Supabase Auth       |
| 📊 Dashboard        | Chart arus kas harian / mingguan / bulanan / tahunan |
| 💸 Transaksi        | Catat pendapatan, pengeluaran, investasi             |
| 📁 Kategori         | 26 kategori default + tambah kategori custom         |
| 🤖 AI Insight       | Analisis & saran keuangan dengan Google Gemini       |
| 📥 Export CSV       | Unduh laporan per periode                            |
| 🔒 Data Privat      | RLS Supabase — data tiap user terpisah              |

---

## 🚀 Setup (3 Langkah)

### Langkah 1 — Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Masuk ke **SQL Editor** → paste seluruh isi `supabase/schema.sql` → **Run**
3. Aktifkan email auth: **Authentication → Providers → Email** (sudah aktif default)
4. Salin dari **Settings → API**:
   - `Project URL`
   - `anon public` key

### Langkah 2 — Gemini API Key

1. Buka [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Klik **Create API Key** → salin

### Langkah 3 — Jalankan

```bash
# Install dependencies
npm install

# Salin & isi environment variables
cp .env.example .env.local
# Edit .env.local dengan nilai dari Langkah 1 & 2

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) → Daftar akun → Mulai catat!

---

## 🌐 Deploy ke Vercel

```bash
# Via CLI
npm i -g vercel
vercel
```

Atau via GitHub:

1. Push ke GitHub
2. Import di [vercel.com](https://vercel.com)
3. Tambahkan 3 **Environment Variables** (sama dengan `.env.local`)
4. Deploy ✅

---

## 📂 Struktur File

```
cashflow-tracker/
├── app/
│   ├── login/page.tsx          ← Halaman login
│   ├── register/page.tsx       ← Halaman daftar
│   ├── page.tsx                ← Dashboard
│   ├── transactions/page.tsx   ← Daftar transaksi
│   ├── investments/page.tsx    ← Portfolio investasi
│   ├── categories/page.tsx     ← Kelola kategori
│   └── api/                   ← REST API routes
├── components/
│   ├── dashboard/             ← Chart, cards, AI panel
│   ├── layout/Sidebar.tsx     ← Navigasi + logout
│   └── modals/                ← Form transaksi & kategori
├── lib/
│   ├── supabase-browser.ts    ← Supabase client-side
│   ├── supabase-server.ts     ← Supabase server-side (SSR)
│   ├── gemini.ts              ← Gemini AI
│   └── utils.ts               ← Helper functions
├── middleware.ts               ← Proteksi route (auth guard)
├── supabase/schema.sql         ← ← Jalankan ini di Supabase!
└── .env.example
```

---

## 🔐 Alur Autentikasi

```
Buka app
   ↓
middleware.ts cek sesi
   ↓
Belum login → /login
   ↓
Login / Daftar
   ↓
Supabase Auth (JWT disimpan di cookie)
   ↓
Dashboard (data hanya milik user sendiri via RLS)
   ↓
Sidebar → tombol "Keluar" → kembali ke /login
```

---

## 🛡️ Keamanan Data

- **Row Level Security (RLS)** aktif di semua tabel
- Setiap transaksi & kategori custom terikat ke `user_id`
- Kategori default (`is_default = true`) bisa dibaca semua user
- Tidak ada user yang bisa melihat data user lain

---

## 📊 Kategori Default

### Pendapatan (6)

Gaji · Tunjangan · Uang Perjalanan Dinas · Bonus · Freelance · Pendapatan Lainnya

### Pengeluaran (12)

Listrik · Air · Persembahan · Makanan & Minuman · Jajan · Barang · Transportasi · Akomodasi · Kesehatan · Pendidikan · Hiburan · Pengeluaran Lainnya

### Investasi (8)

Saham Luar Negeri · Saham Indonesia · Reksa Dana · Emas · Pengetahuan · Kripto · Deposito · Investasi Lainnya

---

## 🤖 AI Insight (Gemini)

Klik **Generate Insight** di dashboard untuk analisis:

- Pola & proporsi pengeluaran per kategori
- Skor kesehatan keuangan (0–100)
- Tingkat tabungan & investasi
- Saran actionable yang spesifik
- Tren 3 bulan terakhir
