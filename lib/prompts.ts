export interface PromptData {
  business: string;
  design: string;
  style: string;
  target: string;
  slogan: string;
}

export const PROMPT_CATEGORIES: Record<string, { label: string; icon: string; prompts: PromptData[] }> = {
  logo: {
    label: "โลโก้",
    icon: "🎨",
    prompts: [
      {
        business: "Craft & Soul (บริษัทการตลาดดิจิทัล)",
        design: "โลโก้และเครื่องหมายอัตลักษณ์",
        style: "คลาสสิคที่ทันสมัย",
        target: "ผู้บริหารธุรกิจ",
        slogan: "\"สัญญาว่าครั้งนี้จะต่างออกไป\"",
      },
      {
        business: "Mossy Kitchen (ร้านอาหารสุขภาพ)",
        design: "โลโก้ร้าน + sub-brand 3 เมนู",
        style: "Organic, Earth-tone, Handdrawn",
        target: "วัยทำงาน 25-40 ใส่ใจสุขภาพ",
        slogan: "\"กินดี อยู่ดี ง่ายๆ\"",
      },
      {
        business: "Kintsugi Studio (สตูดิโอเซรามิก)",
        design: "โลโก้ + wordmark + pattern",
        style: "Japanese Minimal, Monochrome",
        target: "นักสะสมงานฝีมือ",
        slogan: "\"รอยร้าวคือเสน่ห์\"",
      },
      {
        business: "Neon Ramen (ร้านราเมน late-night)",
        design: "โลโก้ + ป้ายร้าน neon mockup",
        style: "Cyberpunk, Y2K, Vibrant",
        target: "วัยรุ่น 18-28",
        slogan: "\"ซดร้อนๆ หลังเที่ยงคืน\"",
      },
      {
        business: "Silver Paw Vet (โรงพยาบาลสัตว์)",
        design: "โลโก้ + ไอคอน service",
        style: "Friendly, Rounded, Soft pastel",
        target: "เจ้าของสัตว์เลี้ยง",
        slogan: "\"ดูแลเหมือนลูก\"",
      },
    ],
  },
  web: {
    label: "เว็บไซต์",
    icon: "💻",
    prompts: [
      {
        business: "Bloom & Grow (คอร์สสอนทำสวน)",
        design: "Landing page + ระบบสมัครเรียน",
        style: "Soft botanical, Green tones",
        target: "คนเมืองอายุ 30+",
        slogan: "\"เริ่มต้นสวนของคุณวันนี้\"",
      },
      {
        business: "Nomad Ledger (แอปบัญชีฟรีแลนซ์)",
        design: "Marketing site 5 หน้า + pricing",
        style: "Clean SaaS, Dark mode",
        target: "ฟรีแลนซ์ + solopreneur",
        slogan: "\"จัดการเงินง่ายเหมือนพิมพ์ข้อความ\"",
      },
      {
        business: "Atlas Trekking (ทัวร์เทรคกิ้งเนปาล)",
        design: "เว็บ booking + gallery + blog",
        style: "Editorial, Cinematic photo",
        target: "นักเดินทางสาย adventure",
        slogan: "\"สูงอีก ไกลอีก ใกล้ตัวเองอีก\"",
      },
      {
        business: "Little Bean Preschool (โรงเรียนอนุบาล)",
        design: "เว็บโรงเรียน + ฟอร์มสมัคร",
        style: "Playful, Crayon texture, Pastel",
        target: "ผู้ปกครอง 28-40",
        slogan: "\"ที่ซึ่งเด็กๆ เป็นตัวเอง\"",
      },
    ],
  },
  packaging: {
    label: "Packaging",
    icon: "📦",
    prompts: [
      {
        business: "Dao Craft Soap (สบู่สมุนไพร handmade)",
        design: "กล่อง + ฉลาก 6 กลิ่น + ถุงกระดาษ",
        style: "Vintage apothecary, Kraft paper",
        target: "นักท่องเที่ยว + ของฝาก",
        slogan: "\"ของขวัญจากธรรมชาติ\"",
      },
      {
        business: "Mochi Mori (ขนมโมจิ artisan)",
        design: "กล่อง 6 ชิ้น + กล่อง 12 ชิ้น + สติ๊กเกอร์",
        style: "Wagashi-inspired, Pastel minimal",
        target: "ซื้อเป็นของฝาก premium",
        slogan: "\"คำเล็กๆ ที่เปลี่ยนวัน\"",
      },
      {
        business: "Ember Coffee Roaster",
        design: "ถุงกาแฟ 3 บลอน + กล่อง subscription",
        style: "Modern specialty, Bold typography",
        target: "คอกาแฟสายคั่วเดียว",
        slogan: "\"กาแฟที่สมควรแก่เวลาของคุณ\"",
      },
      {
        business: "Verdant Skincare (organic)",
        design: "ขวด + กล่อง 5 SKU + refill pouch",
        style: "Eco-luxe, Recycled materials",
        target: "ผู้หญิง 30+ รักษ์โลก",
        slogan: "\"ผิวที่ดีคือผิวที่ปลอดภัย\"",
      },
    ],
  },
  social: {
    label: "Social Media",
    icon: "📱",
    prompts: [
      {
        business: "Pique Fitness (คลาสออกกำลังกายหญิง)",
        design: "IG post 20 ชิ้น + reels template 5 แบบ",
        style: "Bold, Energetic, High contrast",
        target: "ผู้หญิง 25-35",
        slogan: "\"แข็งแรงในแบบของเธอ\"",
      },
      {
        business: "Calm Desk (แอป meditation)",
        design: "TikTok content 30 วัน + motion template",
        style: "Calm, Gradient, Slow motion",
        target: "คนเครียดในเมือง",
        slogan: "\"หายใจ แล้วเริ่มใหม่\"",
      },
      {
        business: "Sourdough Sisters (ขนมปัง SD)",
        design: "IG feed 1 เดือน + highlight covers",
        style: "Warm, Film grain, Analog",
        target: "foodie สายเบเกอรี่",
        slogan: "\"รอ 48 ชั่วโมง เพื่อคำที่ใช่\"",
      },
    ],
  },
  video: {
    label: "Video Editing",
    icon: "🎬",
    prompts: [
      {
        business: "ช่อง YouTube รีวิว AI tools",
        design: "ตัดต่อ 10 คลิป + intro/outro + thumbnail",
        style: "Tech vlog, Punchy edit, B-roll",
        target: "สาย productivity/tech",
        slogan: "\"ใช้ AI ให้คุ้มทุกนาที\"",
      },
      {
        business: "Wedding Film Studio",
        design: "ตัดต่อ highlight 5 นาที + teaser 1 นาที",
        style: "Cinematic, Soft tones, Emotional",
        target: "คู่บ่าวสาว 28-38",
        slogan: "\"วันที่คุณอยากจำไปตลอดชีวิต\"",
      },
      {
        business: "Corporate training videos",
        design: "ตัดต่อ 8 EP + motion graphics + ซับ",
        style: "Clean corporate, Brand consistent",
        target: "พนักงานออฟฟิศ",
        slogan: "\"Skill up ใน 10 นาที\"",
      },
    ],
  },
  illustration: {
    label: "Illustration",
    icon: "✏️",
    prompts: [
      {
        business: "หนังสือเด็กเรื่อง \"เด็กชายกับพระจันทร์\"",
        design: "Illustration 24 หน้า + cover + character",
        style: "Watercolor, Dreamy, Warm palette",
        target: "เด็ก 4-8 ขวบ + ผู้ปกครอง",
        slogan: "\"ทุกคืนมีเรื่องเล่า\"",
      },
      {
        business: "Editorial นิตยสารแฟชั่น",
        design: "ภาพประกอบ 6 ภาพ + spot illustrations",
        style: "Bold editorial, Fashion-forward",
        target: "ผู้อ่านวัย 25-40",
        slogan: "\"สไตล์ไม่มีกฎเกณฑ์\"",
      },
    ],
  },
  app: {
    label: "UI/UX App",
    icon: "📲",
    prompts: [
      {
        business: "Splitz (แอปแบ่งบิลเพื่อน)",
        design: "UI 15 หน้าจอ + design system",
        style: "Playful, Gradient, Gen-Z",
        target: "วัยรุ่น นักศึกษา",
        slogan: "\"แบ่งบิล ไม่แบ่งเพื่อน\"",
      },
      {
        business: "HeartBeat (แอปสุขภาพจิต)",
        design: "UI 20 หน้าจอ + onboarding flow",
        style: "Calm, Accessible, Inclusive",
        target: "คนอายุ 18+ ต้องการพื้นที่ปลอดภัย",
        slogan: "\"ที่ที่คุณเป็นคุณได้\"",
      },
      {
        business: "Queue Bangkok (จองคิวร้าน)",
        design: "UI 12 หน้าจอ + admin panel",
        style: "Thai-modern, Friendly icons",
        target: "คนกรุงเทพ 25-45",
        slogan: "\"ไม่ต้องรอนานอีกต่อไป\"",
      },
    ],
  },
  print: {
    label: "สิ่งพิมพ์",
    icon: "📰",
    prompts: [
      {
        business: "Annual Report มูลนิธิสิ่งแวดล้อม",
        design: "รายงาน 48 หน้า + infographic 12 ชิ้น",
        style: "Editorial, Green accent, Data-rich",
        target: "ผู้สนับสนุน + สื่อ",
        slogan: "\"ทุกต้นไม้มีเรื่องเล่า\"",
      },
      {
        business: "แคตตาล็อกเฟอร์นิเจอร์ minimalist",
        design: "แคตตาล็อก 60 หน้า + price list",
        style: "Scandi, White space, Typography-led",
        target: "เจ้าของบ้าน 30+",
        slogan: "\"น้อย แต่ใช่\"",
      },
    ],
  },
};

export const CHAOS_CONDITIONS = [
  { icon: "🔤", text: "ต้องใช้ฟอนต์สไตล์ Serif เท่านั้น" },
  { icon: "🔠", text: "ต้องใช้แบบตัวพิมพ์ใหญ่เท่านั้น" },
  { icon: "✨", text: "ใช้วัสดุ Glitter หรือ Metallic เท่านั้น" },
  { icon: "🎨", text: "ใช้ได้แค่ 2 สี เท่านั้น" },
  { icon: "⭕", text: "ห้ามใช้รูปทรงสี่เหลี่ยม" },
  { icon: "🌈", text: "ต้องมีไล่เฉดสี (gradient)" },
  { icon: "⏰", text: "ต้องเสร็จภายใน 30 นาที" },
  { icon: "🚫", text: "ห้ามใช้สีดำและสีขาว" },
  { icon: "🎭", text: "ต้องดู retro 80s" },
  { icon: "🔥", text: "ต้องมี mascot หรือ character" },
  { icon: "📐", text: "ใช้ได้แค่เส้นตรง ห้ามโค้ง" },
  { icon: "🌀", text: "ต้องหมุนได้ 360° อ่านออกทุกมุม" },
  { icon: "🇹🇭", text: "ต้องมี element วัฒนธรรมไทยอย่างน้อย 1 อย่าง" },
  { icon: "🎲", text: "สุ่มเลือกสีหลักจากรอบตัวตอนนี้" },
  { icon: "🖍", text: "วาดด้วยมือ ห้ามใช้ vector tool" },
  { icon: "💀", text: "ลูกค้าแก้ได้แค่ 1 ครั้ง" },
  { icon: "🎯", text: "ต้องเล่าเรื่องได้ภายใน 7 วินาที" },
  { icon: "🔲", text: "ใช้ grid 8x8 เท่านั้น" },
];

export const FORTUNES = [
  "⚠️ ระวังเคราะห์ร้าย! จะมีการขอแก้ \"นิดเดียว\" ที่ลากยาวไปยันดี 3",
  "✨ วันนี้ดีมาก! ลูกค้าอนุมัติดราฟต์แรกโดยไม่แก้อะไรเลย (โกหก)",
  "🌈 อุปสรรคเยอะ แต่ผ่านได้ ถ้าส่งไฟล์ให้ครบตั้งแต่ครั้งแรก",
  "💀 พบสัญญาณ \"ทำให้มันป๊อปกว่านี้\" ในอีก 2 วัน โปรดระวัง",
  "🎯 งานด่วนจะเข้าหลังเที่ยงคืน ตั้งสติให้ดี ไม่ต้องตอบ",
  "☕ ถ้าข้ามมื้อเที่ยง ลูกค้าจะทักมาแก้งานทันที กฎข้อที่ 47",
  "🔮 ดวงการเงินดี! ลูกค้าคนใหม่มีงบและรีวิวที่น่ารักรออยู่",
  "😱 ระวัง! ลูกค้าจะพูด \"ให้สร้างสรรค์เต็มที่\" แล้วแก้ทุกอย่าง",
  "🎨 วันนี้เหมาะกับการรีเซ็ต Figma แล้วเริ่มใหม่จาก layer 1",
  "🌟 ดวงกาแฟแรง! ดื่มได้ 3 แก้วแต่ยังไม่เมา",
  "💪 วันนี้งานจะ flow! ใครทักมาอย่าเปิดแชต",
  "🚨 อย่าส่งงาน PDF ไฟล์ 1 ถ้าไม่อยากแก้ 9 รอบ",
  "🌧 ช่วงนี้ลูกค้าเก่ากลับมาแก้งานที่ส่งไปปีก่อน รับมืออย่างสงบ",
  "🐢 ถึงจะช้า แต่ทุกอย่างจะดี ถ้ามีสัญญาและมัดจำ",
  "🎰 สุ่มเจอลูกค้าดี มีโอกาสได้งานใหม่จากการบอกต่อ",
  "🔥 อย่ารับงานหลัง 2 ทุ่ม มันจะลามไปทั้งสัปดาห์",
  "💎 วันนี้ราคาที่เสนอไปจะถูกยอมรับทันที เชื่อมั่นในคุณค่าตัวเอง",
  "😤 จะมีคนถาม \"ทำฟรีให้หน่อยได้มั้ย\" ตอบอย่างใจเย็น แล้วเดินหนี",
  "📅 เดดไลน์จะถูกเลื่อนเข้ามา 2 วัน ตามปกติ เตรียมกาแฟ",
  "🎪 ลูกค้าจะส่ง reference 47 แบบ มีทั้งหมดที่ตีกันเอง",
];

export const EXCUSES = [
  "ไฟล์เสียตอน export ต้องรีทำ adjustment ทั้งหมด รอบใหม่",
  "ฮาร์ดดิสก์ของผมมี error เมื่อคืน กำลังพยายามกู้อยู่",
  "ลูกค้ายังไม่ส่ง final asset กลับมา รออยู่ 3 วันแล้ว",
  "ต้องรอ feedback จาก stakeholder 2 คนที่ยังไม่ว่าง",
  "มี dependency ที่ยังไม่พร้อม เลย block ขั้นตอนถัดไป",
  "โปรแกรมอัพเดตแล้วทำให้ไฟล์ corrupt ต้องไล่ fix ทีละ layer",
  "Internet ที่บ้านมีปัญหาอัพไฟล์ขนาดใหญ่ไม่ได้",
  "Version control ขัดกัน ต้อง merge branch ก่อน",
  "ต้องรอ licensing ของฟอนต์ อนุมัติก่อนใช้ commercial",
  "Printer test proof ยังไม่ตรง ต้องปรับ CMYK ใหม่",
  "Client brief ที่ส่งล่าสุดขัดกับ brief แรก กำลังเช็คว่าอันไหนล่าสุด",
  "ผม benchmark สีกับจอ 3 ยี่ห้อ เพื่อให้แน่ใจว่าตรง",
  "กำลัง refactor file structure ให้ maintainable ขึ้นครับ",
  "มีปัญหา compatibility ข้าม Adobe version ระหว่าง 2023 vs 2024",
  "Asset library ของบริษัทลูกค้ายังไม่ได้รับสิทธิ์เข้าถึง",
  "กำลังทำ usability test กับ target group ก่อน finalize",
  "ระบบ cloud sync ของ Figma ดีเลย์ อัพไฟล์ขึ้นไม่ได้",
  "Feedback loop ยังไม่ปิด มี stakeholder คนใหม่ join เมื่อวาน",
  "อยู่ในขั้นตอน QA และ cross-device testing อีกนิด",
  "ต้องรอ color consultant approve palette ก่อนเข้า phase 2",
  "AI rendering ยังประมวลผลอยู่ เมื่อเช้าเพิ่งเริ่ม batch",
  "ต้องกลับไปดู competitor analysis อีกรอบเพื่อให้ differentiate ชัดเจน",
];

const FILE_JUNK_TOKENS = [
  "FINAL", "final", "v1", "v2", "v3", "ใหม่", "ล่าสุด", "ใช้อันนี้", "จริงๆ",
  "อย่าลบ", "ห้ามเปิด", "backup", "BACKUP", "draft", "DRAFT", "copy", "temp",
  "TEST", "edit", "สุดท้าย", "อันใหม่", "fix", "FIXED", "real",
];

const FILE_EXTS = [".xd", ".fig", ".psd", ".ai", ".sketch", ".indd"];

export function generateHellFileName(): string {
  const base = ["Logo", "UI_Kit", "Brand", "Project", "Design", "Mockup"];
  const name = base[Math.floor(Math.random() * base.length)];
  const count = 4 + Math.floor(Math.random() * 5);
  const tokens: string[] = [];
  for (let i = 0; i < count; i++) {
    tokens.push(FILE_JUNK_TOKENS[Math.floor(Math.random() * FILE_JUNK_TOKENS.length)]);
  }
  const ext = FILE_EXTS[Math.floor(Math.random() * FILE_EXTS.length)];
  return `${name}_${tokens.join("_")}${ext}`;
}

export function generateProFileName(projectName: string, type: string): string {
  const clean = (projectName || "Project")
    .replace(/[^a-zA-Z0-9ก-๙]/g, "")
    .slice(0, 30) || "Project";
  const today = new Date();
  const ymd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const typeMap: Record<string, string> = {
    Logo: "Logo",
    Web: "Web",
    UI: "UIKit",
    Brand: "Brand",
    Print: "Print",
    Video: "Video",
    Packaging: "Packaging",
    Social: "Social",
  };
  const t = typeMap[type] || type;
  return `${clean}_${t}_v1_${ymd}`;
}

export const FILE_TYPES = [
  "Logo", "Web", "UI", "Brand", "Print", "Video", "Packaging", "Social",
];
