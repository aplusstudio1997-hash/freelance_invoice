# FreelanceSolo 🧡 v1.1

โปรแกรมช่วยคำนวณราคาและทำใบเสนอราคาออนไลน์อย่างง่าย สำหรับฟรีแลนซ์

สร้างด้วย **Next.js 14 + TypeScript + Tailwind CSS** — ไม่ต้องใช้ backend, บันทึกข้อมูลใน browser (localStorage)

---

## ✨ ฟีเจอร์

- 📋 ฟอร์มกรอกข้อมูลลูกค้า + โครงการ แบบ 4 คอลัมน์
- 💰 คำนวณราคาเรียลไทม์
  - ค่าความซับซ้อน (ลูกค้ายาก +15%, เปลี่ยนใจบ่อย +10%)
  - บริการเพิ่มเติม (ไฟล์ต้นฉบับ +20%, สิทธิ์พาณิชย์ +30%, งานด่วน +25%)
  - ต้นทุนแฝง, ค่าแก้ไขส่วนเกิน, ส่วนลด, หักภาษี 3%
- 📅 ไทม์ไลน์โครงการ + คำนวณอัตรารายชั่วโมงอัตโนมัติ
- 💳 เงื่อนไขชำระเงิน 30% / 50% / 70% / จ่ายเต็ม
- 📄 **บันทึก PDF คมชัด** ผ่านหน้า print dedicated → `window.print()` → Save as PDF
  - ตัวอักษรไทยคมชัด (Sarabun)
  - คัดลอกข้อความจาก PDF ได้
  - Vector PDF ไฟล์เล็ก
- 🎲 สุ่มโจทย์ฝึกคิดราคา (10 โจทย์)
- ❤️ คลายเครียด — คำคมฟรีแลนซ์ + Breathing Exercise 4-7-8 แบบ animation
- 💾 บันทึกดราฟต์อัตโนมัติใน localStorage (ไม่ต้อง login)

---

## 🚀 การติดตั้งและรัน

```bash
npm install
npm run dev
# เปิด http://localhost:3000
```

## 🏗️ Build

```bash
npm run build
npm start
```

---

## ☁️ Deploy ไป Vercel + GitHub

**ไม่ต้องตั้งค่าอะไรเลย** ไม่มี env var

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/freelance-solo.git
git push -u origin main
```

ไปที่ [vercel.com/new](https://vercel.com/new) → Import repo → Deploy

---

## 📁 โครงสร้างโปรเจกต์

```
freelance-solo/
├── app/
│   ├── globals.css
│   ├── layout.tsx            # โหลด Sarabun font
│   ├── page.tsx              # หน้าหลัก
│   └── print/
│       └── page.tsx          # หน้า print A4 (เปิดอัตโนมัติเมื่อกด Save PDF)
├── components/
│   ├── SettingsPanel.tsx
│   ├── ServicesPanel.tsx
│   ├── TimelinePanel.tsx
│   ├── QuotePreview.tsx
│   ├── RandomPromptModal.tsx
│   └── StressReliefModal.tsx
├── lib/
│   ├── types.ts
│   ├── storage.ts
│   ├── calc.ts
│   └── prompts.ts
└── package.json
```

---

## 💡 วิธีใช้ PDF

1. กรอกข้อมูลให้ครบในหน้าหลัก
2. กดปุ่ม **"บันทึกเป็น PDF"** ในคอลัมน์ขวา
3. หน้าต่างใหม่เปิด + กล่อง print เด้งอัตโนมัติ
4. เลือก **"Save as PDF"** เป็นปลายทาง → บันทึก

**เคล็ดลับ:** ใน Chrome กด "More settings" → ปิด "Headers and footers" → PDF จะสะอาด ไม่มี URL/เลขหน้าขึ้นขอบ

---

## 📝 Changelog

### v1.1
- เปลี่ยนวิธีสร้าง PDF จาก html2canvas → `window.print()` → ภาษาไทยคมชัด คัดลอกได้
- เพิ่มหน้า `/print` สำหรับ layout A4 เต็มหน้า
- โหลด Sarabun font จาก Google Fonts
- แก้ overflow badge "ใบเสนอราคา" ใน preview
- ลด dependencies (ตัด html2canvas, jspdf)

### v1.0
- เวอร์ชันแรก

---

## 📝 License

MIT
