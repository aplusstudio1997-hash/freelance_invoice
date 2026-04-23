# Google Apps Script Setup

## ขั้นตอนตั้งค่า

### 1. สร้าง Google Sheet
สร้าง Google Sheet ใหม่ 1 ไฟล์ ตั้งชื่อตามใจชอบ (เช่น `FreelanceSolo Data`)

ภายในไฟล์มี 2 sheets:

#### Sheet 1: `ข้อเสนอแนะ`
| A | B | C | D |
|---|---|---|---|
| timestamp | email | คะแนน | ข้อเสนอแนะ |

#### Sheet 2: `ใบเสนอราคา`
| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| timestamp | เลขที่ | ชื่อโครงการ | ลูกค้า | เบอร์ | email | วันเริ่ม | วันจบ | ยอดก่อนภาษี | VAT 7% | ส่วนลด | หัก 3% | รวมสุทธิ | มัดจำ | เงื่อนไขการชำระ | เตรียมโดย |

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
6. คัดลอก **Web app URL** ที่ได้ (รูปแบบ `https://script.google.com/macros/s/AKfycb.../exec`)

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

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const type = body.type;
    const payload = body.payload;

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
      const sheet = getOrCreateSheet(ss, SHEET_QUOTE, [
        "timestamp",
        "เลขที่",
        "ชื่อโครงการ",
        "ลูกค้า",
        "เบอร์",
        "email",
        "วันเริ่ม",
        "วันจบ",
        "ยอดก่อนภาษี",
        "VAT 7%",
        "ส่วนลด",
        "หัก 3%",
        "รวมสุทธิ",
        "มัดจำ",
        "เงื่อนไขการชำระ",
        "เตรียมโดย",
      ]);
      sheet.appendRow([
        new Date(),
        payload.quoteNumber || "",
        payload.projectName || "",
        payload.customerName || "",
        payload.customerPhone || "",
        payload.customerEmail || "",
        payload.startDate || "",
        payload.endDate || "",
        Number(payload.preDiscount) || 0,
        Number(payload.vatAmount) || 0,
        Number(payload.discountValue) || 0,
        Number(payload.taxDeduction) || 0,
        Number(payload.total) || 0,
        Number(payload.deposit) || 0,
        payload.paymentCondition || "",
        payload.preparedBy || "",
      ]);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, message: "FreelanceSolo API is running" })
  ).setMimeType(ContentService.MimeType.JSON);
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

- เว็บใช้ `mode: "no-cors"` ตอน fetch — ไม่สามารถอ่าน response ได้ แต่ข้อมูลจะส่งถึง GAS แน่นอน
- ถ้าแก้โค้ด GAS แล้ว ต้อง **Deploy → Manage deployments → ดินสอ ✏️ → New version → Deploy** (ไม่ใช่ New deployment)
- หลังแก้ versions ใหม่ URL ยังเหมือนเดิม
- ถ้า GAS ตอบช้า/ล่ม → เว็บยังทำงานได้ปกติ (fire-and-forget)
