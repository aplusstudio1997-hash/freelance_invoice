# So1o Freelancer

หลังบ้านฟรีแลนซ์ของคุณ — ระบบจัดการเอกสาร รายรับ-รายจ่าย ภาษี ลูกค้า Subscriptions และ Suppliers สำหรับฟรีแลนซ์ในไทย

## ✨ ฟีเจอร์

- **Landing page** + ระบบสมัคร/เข้าสู่ระบบ (อีเมล + Google OAuth)
- **Dashboard** — เป้ารายได้, สถานะการเก็บเงิน, AI Quick Price Check, กิจกรรมล่าสุด
- **Finance & Tax**:
  - เอกสาร 3 ประเภท (ใบเสนอราคา / ใบแจ้งหนี้ / ใบเสร็จ) + PDF คมชัดภาษาไทย
  - รายรับ + บันทึก WHT 3% / VAT
  - รายจ่าย + 10 หมวด + breakdown
  - คำนวณภาษีรายปี (ภงด.90/91) เรท 2567 + ค่าลดหย่อน 10 รายการ
  - Export CSV
- **Clients CRM** — ลูกค้า + ประวัติเอกสารต่อราย + เลือกใช้ในเอกสารใหม่
- **Subscriptions Tracker** — รายเดือน/รายปี + แจ้งเตือนก่อนต่ออายุ
- **Suppliers Hub** — supplier + ไฟล์ตัวอย่างงาน (Storage)
- **My Data** — โปรไฟล์ที่แสดงบนเอกสาร
- **Admin Panel** — ดูผู้ใช้, ความคิดเห็น, สถิติระบบ (ต้องตั้ง role=admin ใน DB)

## 🚀 เริ่มใช้

```bash
npm install
cp .env.example .env.local
# แก้ NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

## 🗄️ Supabase Setup

1. สร้าง project ที่ [supabase.com](https://supabase.com)
2. SQL Editor → รัน `supabase/schema.sql` ทั้งไฟล์
3. Authentication → Providers → เปิด Email + Google (ใส่ Client ID / Secret)
4. ใส่ URL + ANON_KEY ใน `.env.local`

## 👤 ตั้ง Admin

หลังจากผู้ใช้สมัครแล้ว รันใน SQL Editor:
```sql
update public.profiles
set role = 'admin'
where user_id = 'USER_UUID_HERE';
```
หา `user_id` ได้จาก Supabase Dashboard → Authentication → Users

## 📦 Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Supabase** — Auth + PostgreSQL + Storage + RLS
- **lucide-react** — icons
- **html2pdf.js / jspdf** — PDF
- Font: **Sarabun** (Google Fonts)

## 🗂️ Routes

```
/                         Landing page
/auth                     เข้าสู่ระบบ / สมัครสมาชิก
/app                      → /app/dashboard
/app/dashboard            ภาพรวม
/app/finance              → /app/finance/documents
/app/finance/documents    สร้างเอกสาร
/app/finance/income       บันทึกรายรับ
/app/finance/expense      บันทึกรายจ่าย
/app/finance/tax          คำนวณภาษีรายปี
/app/clients              Clients CRM
/app/subscriptions        Subscriptions Tracker
/app/suppliers            Suppliers Hub
/app/my-data              ข้อมูลโปรไฟล์บนเอกสาร
/app/settings             ตั้งค่าทั่วไป + ออกจากระบบ
/app/admin                Admin overview (admin only)
/app/admin/users          รายชื่อผู้ใช้
/app/admin/feedback       ความคิดเห็น
/print                    PDF preview
```

## 📊 Schema (Supabase)

11 tables + 1 storage bucket:
- `profiles` (+ role: user/admin)
- `clients`
- `documents` (linked to clients)
- `incomes`
- `expenses`
- `revenue_goals`
- `subscriptions`
- `suppliers` (with `files` JSONB)
- `feedback`
- `activity_log`
- `active_sessions` (heartbeat)
- Storage bucket: `supplier-files`

ทุกตารางมี **RLS** เปิด: เจ้าของข้อมูลอ่าน/เขียนของตัวเองได้, admin อ่านทุกอันได้

## 🔐 Privacy

- ข้อมูลทุกอย่างเก็บใน Supabase ของคุณเอง
- RLS ป้องกัน user เห็นข้อมูลของคนอื่น
- ไฟล์ supplier ใช้ signed URL (1 ชั่วโมง)
- Logout → ข้อมูลใน localStorage ถูกล้าง

## License

MIT
