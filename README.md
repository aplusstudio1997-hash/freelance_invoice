# FreelanceSolo 🧡

โปรแกรมช่วยคำนวณราคาและทำใบเสนอราคาออนไลน์อย่างง่าย สำหรับฟรีแลนซ์

สร้างด้วย **Next.js 14 + TypeScript + Tailwind CSS** — ไม่ต้องใช้ backend, บันทึกข้อมูลใน browser (localStorage)

---

## ✨ ฟีเจอร์

- 📋 ฟอร์มกรอกข้อมูลลูกค้า + โครงการ แบบ 4 คอลัมน์
- 💰 คำนวณราคาเรียลไทม์
  - ค่าความซับซ้อน (ลูกค้ายาก +15%, เปลี่ยนใจบ่อย +10%)
  - บริการเพิ่มเติม (ไฟล์ต้นฉบับ, สิทธิ์พาณิชย์, งานด่วน)
  - ต้นทุนแฝง, ค่าแก้ไขส่วนเกิน, ส่วนลด, หักภาษี 3%
- 📅 ไทม์ไลน์โครงการ + คำนวณอัตรารายชั่วโมงอัตโนมัติ
- 💳 เงื่อนไขชำระเงิน 30% / 50% / 70% / จ่ายเต็ม
- 📄 ดาวน์โหลดใบเสนอราคาเป็น PDF (html2canvas + jsPDF)
- 🎲 สุ่มโจทย์ฝึกคิดราคา (10 โจทย์)
- ❤️ คลายเครียด — คำคมฟรีแลนซ์ + Breathing Exercise 4-7-8
- 💾 บันทึกดราฟต์อัตโนมัติใน localStorage (ไม่ต้อง login)

---

## 🚀 การติดตั้งและรันบนเครื่อง

```bash
# ติดตั้ง dependencies
npm install

# รันโหมด dev
npm run dev

# เปิด http://localhost:3000
```

## 🏗️ Build สำหรับ production

```bash
npm run build
npm start
```

---

## ☁️ Deploy ไป Vercel + GitHub

### วิธีที่ 1: ผ่าน GitHub (แนะนำ)

1. **สร้าง repo ใน GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: FreelanceSolo"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/freelance-solo.git
   git push -u origin main
   ```

2. **Deploy ไป Vercel**
   - ไปที่ [vercel.com/new](https://vercel.com/new)
   - Import repo จาก GitHub
   - กด **Deploy** — ไม่ต้องตั้ง environment variable ใดๆ
   - เสร็จ! Vercel จะ auto-deploy ทุกครั้งที่ push ขึ้น GitHub

### วิธีที่ 2: Vercel CLI

```bash
npm i -g vercel
vercel
```

---

## 📁 โครงสร้างโปรเจกต์

```
freelance-solo/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # หน้าหลัก
├── components/
│   ├── SettingsPanel.tsx     # คอลัมน์ 1: ลูกค้า + ตั้งค่า
│   ├── ServicesPanel.tsx     # คอลัมน์ 2: จัดการบริการ
│   ├── TimelinePanel.tsx     # คอลัมน์ 3: ไทม์ไลน์ + rate/ชม.
│   ├── QuotePreview.tsx      # คอลัมน์ 4: preview + PDF
│   ├── RandomPromptModal.tsx # สุ่มโจทย์
│   └── StressReliefModal.tsx # คลายเครียด + breathing
├── lib/
│   ├── types.ts              # TypeScript types
│   ├── storage.ts            # localStorage + session
│   ├── calc.ts               # logic คำนวณราคา
│   └── prompts.ts            # ข้อมูลโจทย์ + คำคม
└── package.json
```

---

## 🎨 Customize

### เปลี่ยนสี Brand
แก้ในไฟล์ `tailwind.config.js` — ตอนนี้ใช้ `brand` palette (ส้ม)

### เพิ่มโจทย์สุ่ม / คำคม
แก้ในไฟล์ `lib/prompts.ts`

### เปลี่ยนชื่อเตรียมโดย (ใน PDF)
แก้ default ใน `lib/types.ts` ที่ `preparedBy`

---

## 📝 License

MIT — ใช้ได้ทั้งส่วนตัวและเชิงพาณิชย์

## 🙏 Credits

- Design inspired by [blacksmithtools.my.canva.site](https://blacksmithtools.my.canva.site)
- Icons โดย [lucide-react](https://lucide.dev)
