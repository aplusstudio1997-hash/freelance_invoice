# Google Apps Script Setup

## ขั้นตอนตั้งค่า

### 1. สร้าง Google Sheet
สร้าง Google Sheet ใหม่ 1 ไฟล์ ตั้งชื่อตามใจชอบ (เช่น `FreelanceSolo Data`)

ภายในไฟล์มี 3 sheets:

#### Sheet 1: `ข้อเสนอแนะ`
| A | B | C | D |
|---|---|---|---|
| timestamp | email | คะแนน | ข้อเสนอแนะ |

#### Sheet 2: `ใบเสนอราคา`
นับจำนวนใบที่ถูกสร้าง (ไม่เก็บข้อมูลส่วนตัวของผู้ใช้)

| A | B |
|---|---|
| timestamp | clientId |

#### Sheet 3: `Active`
นับผู้ใช้งานปัจจุบัน (active ภายใน 5 นาที)

| A | B |
|---|---|
| clientId | lastSeen |

### 2. สร้าง Google Apps Script

1. เปิด Google Sheet ที่สร้าง
2. เมนู **Extensions → Apps Script**
3. ลบโค้ดเก่าออกทั้งหมด แล้ว paste โค้ดด้านล่างเข้าไป
4. กดบันทึก (Ctrl+S) ตั้งชื่อโปรเจ็กต์ตามใจชอบ

### 3. Deploy เป็น Web App

1. กดปุ่ม **Deploy → New deployment**
2. คลิกไอคอนเฟือง → เลือก **Web app**
3. ตั้งค่า:
   - **Description**: FreelanceSolo API
   - **Execute as**: `Me (your-email@gmail.com)`
   - **Who has access**: `Anyone`  ← สำคัญมาก!
4. กด **Deploy**
5. กด **Authorize access** → อนุญาต permissions
6. คัดลอก **Web app URL** ที่ได้

### 4. ใส่ URL ในเว็บ

สร้างไฟล์ `.env.local` ที่ root ของโปรเจ็กต์:

```
NEXT_PUBLIC_GAS_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

หรือใน Vercel ให้ไป **Settings → Environment Variables** แล้วเพิ่ม `NEXT_PUBLIC_GAS_URL`

## โค้ด Apps Script

```javascript
const SHEET_FEEDBACK = "ข้อเสนอแนะ";
const SHEET_QUOTE = "ใบเสนอราคา";
const SHEET_ACTIVE = "Active";
const ACTIVE_WINDOW_MS = 5 * 60 * 1000;

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const type = body.type;
    const payload = body.payload || {};

    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (type === "feedback") {
      const sheet = getOrCreateSheet(ss, SHEET_FEEDBACK, [
        "timestamp",
        "email",
        "คะแนน",
        "ข้อเสนอแนะ",
      ]);
      sheet.appendRow([
        new Date(),
        payload.email || "",
        Number(payload.rating) || 0,
        payload.message || "",
      ]);
    } else if (type === "quote") {
      const sheet = getOrCreateSheet(ss, SHEET_QUOTE, ["timestamp", "clientId"]);
      sheet.appendRow([new Date(), payload.clientId || ""]);
      upsertActive(ss, payload.clientId || "");
    } else if (type === "ping") {
      upsertActive(ss, payload.clientId || "");
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || "";

    if (action === "stats") {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const quoteSheet = getOrCreateSheet(ss, SHEET_QUOTE, [
        "timestamp",
        "clientId",
      ]);
      const activeSheet = getOrCreateSheet(ss, SHEET_ACTIVE, [
        "clientId",
        "lastSeen",
      ]);

      const totalQuotes = Math.max(0, quoteSheet.getLastRow() - 1);
      const activeUsers = countActive(activeSheet);

      return json({ ok: true, totalQuotes: totalQuotes, activeUsers: activeUsers });
    }

    return json({ ok: true, message: "FreelanceSolo API is running" });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function upsertActive(ss, clientId) {
  if (!clientId) return;
  const sheet = getOrCreateSheet(ss, SHEET_ACTIVE, ["clientId", "lastSeen"]);
  const lastRow = sheet.getLastRow();
  const now = new Date();

  if (lastRow <= 1) {
    sheet.appendRow([clientId, now]);
    return;
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === clientId) {
      sheet.getRange(i + 2, 2).setValue(now);
      return;
    }
  }
  sheet.appendRow([clientId, now]);
}

function countActive(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 0;
  const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  const cutoff = Date.now() - ACTIVE_WINDOW_MS;
  let count = 0;
  for (let i = 0; i < data.length; i++) {
    const ts = data[i][1];
    if (ts instanceof Date && ts.getTime() >= cutoff) count++;
  }
  return count;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}
```

## หมายเหตุ

- เว็บใช้ `mode: "no-cors"` ตอน POST → ไม่อ่าน response ได้ แต่ข้อมูลส่งถึง GAS
- GET ใช้ CORS ปกติเพื่อดึง stats (GAS อนุญาต CORS สำหรับ doGet)
- การ ping active ทำทุก 1 นาที + ตอนกดสร้างใบ
- Active user นับภายใน 5 นาทีล่าสุด (ตั้งใน `ACTIVE_WINDOW_MS`)
- **ไม่มีการเก็บข้อมูลส่วนตัวของลูกค้า/ผู้ใช้** — sheet "ใบเสนอราคา" เก็บแค่ timestamp + clientId
- ถ้าแก้โค้ด GAS แล้ว ต้อง **Deploy → Manage deployments → ดินสอ ✏️ → New version → Deploy** (ไม่ใช่ New deployment)
- หลังแก้ versions ใหม่ URL ยังเหมือนเดิม
- ถ้า GAS ตอบช้า/ล่ม → เว็บยังทำงานได้ปกติ (fire-and-forget + badge ซ่อนอัตโนมัติ)
