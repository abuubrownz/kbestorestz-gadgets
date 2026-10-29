export type Category = {
  slug: string;
  name: string;
  blurb: string;
  items: number;
};

export const categories: Category[] = [
  { slug: "smartphones", name: "Smartphones", blurb: "Flagships & everyday phones", items: 148 },
  { slug: "laptops", name: "Laptops", blurb: "Work, study and creator machines", items: 92 },
  { slug: "tablets", name: "Tablets", blurb: "iPad, Galaxy Tab & pen-ready", items: 44 },
  { slug: "accessories", name: "Accessories", blurb: "Audio, power, storage & cases", items: 310 },
  { slug: "gaming", name: "Gaming", blurb: "Consoles, handhelds & gear", items: 67 },
  { slug: "smart-home", name: "Smart Home", blurb: "Cameras, hubs & wearables", items: 85 },
];

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  stock: number;
  warranty: string;
  badge?: string;
  tagline: string;
  specs: { label: string; value: string }[];
  colorFrom: string;
  colorTo: string;
};

export const brands = ["Apple", "Samsung", "Dell", "HP", "Lenovo", "Sony", "Anker", "Xiaomi"];

export const products: Product[] = [
  {
    id: "iphone-15-pro",
    name: "iPhone 15 Pro 256GB",
    brand: "Apple",
    category: "smartphones",
    price: 2850000,
    compareAt: 3050000,
    rating: 4.9,
    reviews: 214,
    stock: 12,
    warranty: "12 months KBestoreTZ warranty",
    badge: "Best seller",
    tagline: "Titanium build, A17 Pro performance and a pro-grade camera system.",
    specs: [
      { label: "Display", value: "6.1\" Super Retina XDR, 120Hz" },
      { label: "Chip", value: "A17 Pro" },
      { label: "Camera", value: "48MP main + 12MP ultra wide" },
      { label: "Battery", value: "Up to 23h video playback" },
      { label: "Storage", value: "256GB" },
    ],
    colorFrom: "#3b4252",
    colorTo: "#0c0f14",
  },
  {
    id: "galaxy-s24-ultra",
    name: "Galaxy S24 Ultra 512GB",
    brand: "Samsung",
    category: "smartphones",
    price: 3190000,
    rating: 4.8,
    reviews: 176,
    stock: 7,
    warranty: "12 months manufacturer warranty",
    badge: "New",
    tagline: "Built-in S Pen, 200MP camera and Galaxy AI tools.",
    specs: [
      { label: "Display", value: "6.8\" QHD+ Dynamic AMOLED 2X" },
      { label: "Chip", value: "Snapdragon 8 Gen 3" },
      { label: "Camera", value: "200MP quad system" },
      { label: "Battery", value: "5000mAh, 45W" },
      { label: "Storage", value: "512GB" },
    ],
    colorFrom: "#1f3b5c",
    colorTo: "#0a1220",
  },
  {
    id: "macbook-air-m3",
    name: "MacBook Air 13\" M3",
    brand: "Apple",
    category: "laptops",
    price: 3450000,
    compareAt: 3650000,
    rating: 4.9,
    reviews: 132,
    stock: 5,
    warranty: "12 months + free setup",
    tagline: "Fanless, 18-hour battery and silent all-day performance.",
    specs: [
      { label: "Chip", value: "Apple M3, 8-core CPU" },
      { label: "Memory", value: "16GB unified" },
      { label: "Storage", value: "512GB SSD" },
      { label: "Display", value: "13.6\" Liquid Retina" },
      { label: "Weight", value: "1.24 kg" },
    ],
    colorFrom: "#4b5563",
    colorTo: "#111827",
  },
  {
    id: "dell-xps-15",
    name: "Dell XPS 15 Creator",
    brand: "Dell",
    category: "laptops",
    price: 4120000,
    rating: 4.7,
    reviews: 88,
    stock: 3,
    warranty: "24 months on-site warranty",
    badge: "Pro pick",
    tagline: "RTX graphics and a colour-accurate OLED panel for creators.",
    specs: [
      { label: "CPU", value: "Intel Core Ultra 7" },
      { label: "GPU", value: "NVIDIA RTX 4050" },
      { label: "Memory", value: "32GB DDR5" },
      { label: "Storage", value: "1TB SSD" },
      { label: "Display", value: "15.6\" 3.5K OLED" },
    ],
    colorFrom: "#334155",
    colorTo: "#0b1120",
  },
  {
    id: "ipad-air-11",
    name: "iPad Air 11\" Wi-Fi",
    brand: "Apple",
    category: "tablets",
    price: 1780000,
    rating: 4.8,
    reviews: 64,
    stock: 18,
    warranty: "12 months warranty",
    tagline: "M2 speed with Apple Pencil Pro support for notes and design.",
    specs: [
      { label: "Chip", value: "Apple M2" },
      { label: "Display", value: "11\" Liquid Retina" },
      { label: "Storage", value: "128GB" },
      { label: "Camera", value: "12MP wide" },
      { label: "Battery", value: "Up to 10h" },
    ],
    colorFrom: "#2f4858",
    colorTo: "#101820",
  },
  {
    id: "galaxy-tab-s9",
    name: "Galaxy Tab S9 FE",
    brand: "Samsung",
    category: "tablets",
    price: 1150000,
    rating: 4.6,
    reviews: 41,
    stock: 22,
    warranty: "12 months warranty",
    tagline: "Water resistant tablet with S Pen included in the box.",
    specs: [
      { label: "Display", value: "10.9\" 90Hz LCD" },
      { label: "Chip", value: "Exynos 1380" },
      { label: "Storage", value: "128GB + microSD" },
      { label: "Battery", value: "8000mAh" },
      { label: "Extras", value: "S Pen included" },
    ],
    colorFrom: "#274156",
    colorTo: "#0d1620",
  },
  {
    id: "sony-wh1000xm5",
    name: "Sony WH-1000XM5",
    brand: "Sony",
    category: "accessories",
    price: 890000,
    compareAt: 980000,
    rating: 4.9,
    reviews: 302,
    stock: 30,
    warranty: "12 months warranty",
    badge: "Top rated",
    tagline: "Industry-leading noise cancelling for flights and open offices.",
    specs: [
      { label: "Type", value: "Over-ear ANC" },
      { label: "Battery", value: "30h with ANC" },
      { label: "Charging", value: "USB-C, 3min quick charge" },
      { label: "Codec", value: "LDAC / AAC / SBC" },
      { label: "Weight", value: "250 g" },
    ],
    colorFrom: "#3f3f46",
    colorTo: "#111113",
  },
  {
    id: "anker-737-powerbank",
    name: "Anker 737 Power Bank 24K",
    brand: "Anker",
    category: "accessories",
    price: 320000,
    rating: 4.7,
    reviews: 158,
    stock: 54,
    warranty: "18 months warranty",
    tagline: "140W laptop-class charging with a smart status display.",
    specs: [
      { label: "Capacity", value: "24,000mAh" },
      { label: "Output", value: "140W max" },
      { label: "Ports", value: "2x USB-C, 1x USB-A" },
      { label: "Display", value: "Smart digital readout" },
      { label: "Weight", value: "630 g" },
    ],
    colorFrom: "#1f2937",
    colorTo: "#0b0f16",
  },
  {
    id: "ps5-slim",
    name: "PlayStation 5 Slim Disc",
    brand: "Sony",
    category: "gaming",
    price: 1890000,
    rating: 4.9,
    reviews: 219,
    stock: 9,
    warranty: "12 months warranty",
    badge: "Hot",
    tagline: "Ray-traced 4K gaming with the DualSense haptic controller.",
    specs: [
      { label: "Storage", value: "1TB SSD" },
      { label: "Output", value: "4K 120Hz / 8K ready" },
      { label: "Includes", value: "DualSense controller" },
      { label: "Drive", value: "Ultra HD Blu-ray" },
      { label: "Region", value: "PAL / EU" },
    ],
    colorFrom: "#1e3a8a",
    colorTo: "#0a1024",
  },
  {
    id: "rog-ally-x",
    name: "ROG Ally X Handheld",
    brand: "Lenovo",
    category: "gaming",
    price: 2240000,
    rating: 4.6,
    reviews: 47,
    stock: 4,
    warranty: "12 months warranty",
    tagline: "Full PC gaming in your hands with a 120Hz display.",
    specs: [
      { label: "Chip", value: "Ryzen Z1 Extreme" },
      { label: "Memory", value: "24GB LPDDR5" },
      { label: "Storage", value: "1TB SSD" },
      { label: "Display", value: "7\" 120Hz FHD" },
      { label: "Battery", value: "80Wh" },
    ],
    colorFrom: "#3b0764",
    colorTo: "#0d0618",
  },
  {
    id: "eufy-cam-3",
    name: "eufyCam 3 Security Kit",
    brand: "Xiaomi",
    category: "smart-home",
    price: 1290000,
    rating: 4.5,
    reviews: 73,
    stock: 16,
    warranty: "12 months warranty",
    tagline: "Solar-powered 4K cameras with local storage, no monthly fees.",
    specs: [
      { label: "Resolution", value: "4K UHD" },
      { label: "Power", value: "Integrated solar panel" },
      { label: "Storage", value: "16GB local hub" },
      { label: "Rating", value: "IP67 weatherproof" },
      { label: "Kit", value: "2 cameras + HomeBase" },
    ],
    colorFrom: "#155e75",
    colorTo: "#08131a",
  },
  {
    id: "watch-series-9",
    name: "Apple Watch Series 9",
    brand: "Apple",
    category: "smart-home",
    price: 1240000,
    compareAt: 1350000,
    rating: 4.8,
    reviews: 121,
    stock: 11,
    warranty: "12 months warranty",
    tagline: "Health tracking, ECG and crash detection on your wrist.",
    specs: [
      { label: "Case", value: "45mm aluminium" },
      { label: "Chip", value: "S9 SiP" },
      { label: "Health", value: "ECG, SpO2, temperature" },
      { label: "Battery", value: "18h typical" },
      { label: "Water", value: "50m resistant" },
    ],
    colorFrom: "#0f766e",
    colorTo: "#07130f",
  },
];

export const formatTZS = (value: number) =>
  `TZS ${new Intl.NumberFormat("en-US").format(Math.round(value))}`;

export const productById = (id: string) => products.find((p) => p.id === id);

/* ---------------------------------- Repairs --------------------------------- */

export const repairStages = [
  "Submitted",
  "Received",
  "Diagnosis",
  "Quotation",
  "Approved",
  "Repairing",
  "Testing",
  "Completed",
  "Collected",
] as const;

export type RepairStage = (typeof repairStages)[number];

export const repairServices = [
  {
    title: "Phone repair",
    detail: "Screen, board-level and water damage repair for iPhone, Samsung, Tecno & more.",
    from: 35000,
    turnaround: "Same day",
  },
  {
    title: "Laptop repair",
    detail: "Hinges, keyboards, charging ports, thermal service and motherboard work.",
    from: 60000,
    turnaround: "24–72 hours",
  },
  {
    title: "Software installation",
    detail: "Windows, macOS, Office, antivirus, data migration and full device setup.",
    from: 25000,
    turnaround: "2 hours",
  },
  {
    title: "Screen replacement",
    detail: "Original and OEM-grade panels fitted with a 90-day workmanship guarantee.",
    from: 90000,
    turnaround: "Same day",
  },
  {
    title: "Battery replacement",
    detail: "Genuine cells with health testing before and after installation.",
    from: 45000,
    turnaround: "45 minutes",
  },
];

export const deviceTypes = [
  { id: "iphone", label: "iPhone", hint: "iPhone 8 → 16 Pro Max" },
  { id: "samsung", label: "Samsung", hint: "Galaxy A, S and Z series" },
  { id: "laptop", label: "Laptop", hint: "Apple, Dell, HP, Lenovo" },
  { id: "tablet", label: "Tablet", hint: "iPad, Galaxy Tab, Lenovo" },
  { id: "other-phone", label: "Other phone", hint: "Tecno, Infinix, Xiaomi" },
  { id: "console", label: "Console", hint: "PS5, Xbox, handhelds" },
];

export const problemTypes = [
  { id: "screen", label: "Screen damage", hint: "Cracks, dead pixels, touch faults" },
  { id: "battery", label: "Battery issue", hint: "Drains fast, swelling, shutdowns" },
  { id: "software", label: "Software problem", hint: "Boot loops, OS, data recovery" },
  { id: "charging", label: "Charging problem", hint: "Port, cable or IC faults" },
  { id: "water", label: "Water damage", hint: "Liquid exposure, corrosion" },
  { id: "audio", label: "Audio / camera", hint: "Speaker, mic or lens faults" },
];

export type Repair = {
  ticket: string;
  customer: string;
  phone: string;
  device: string;
  problem: string;
  stage: RepairStage;
  technician: string;
  priority: "Standard" | "Express" | "Critical";
  quote: number;
  createdAt: string;
  notes: { at: string; author: string; text: string }[];
  parts: { name: string; qty: number; cost: number }[];
};

export const repairs: Repair[] = [
  {
    ticket: "KB-RP-48219",
    customer: "Amina Mushi",
    phone: "+255 712 445 902",
    device: "iPhone 13 Pro",
    problem: "Screen damage — cracked panel, touch dead on right edge",
    stage: "Repairing",
    technician: "Joseph Mwenda",
    priority: "Express",
    quote: 285000,
    createdAt: "2026-08-03",
    notes: [
      { at: "Aug 3, 10:12", author: "Front desk", text: "Device received, passcode captured, cosmetic condition logged." },
      { at: "Aug 3, 14:40", author: "Joseph Mwenda", text: "Digitizer failure confirmed. Board and FaceID module healthy." },
      { at: "Aug 4, 09:05", author: "Joseph Mwenda", text: "OEM panel fitted, calibrating True Tone." },
    ],
    parts: [{ name: "iPhone 13 Pro OEM display", qty: 1, cost: 230000 }],
  },
  {
    ticket: "KB-RP-48204",
    customer: "Baraka Nyoni",
    phone: "+255 754 118 220",
    device: "MacBook Pro 14\" 2021",
    problem: "Charging problem — no power delivery on either port",
    stage: "Quotation",
    technician: "Fatma Salum",
    priority: "Standard",
    quote: 410000,
    createdAt: "2026-08-02",
    notes: [
      { at: "Aug 2, 16:20", author: "Fatma Salum", text: "USB-C daughterboard shorted. Logic board passes diagnostics." },
    ],
    parts: [{ name: "USB-C I/O board", qty: 1, cost: 320000 }],
  },
  {
    ticket: "KB-RP-48187",
    customer: "Neema Kileo",
    phone: "+255 786 003 771",
    device: "Galaxy S22",
    problem: "Battery issue — 61% health, random shutdowns",
    stage: "Testing",
    technician: "Joseph Mwenda",
    priority: "Standard",
    quote: 96000,
    createdAt: "2026-08-01",
    notes: [
      { at: "Aug 1, 11:02", author: "Joseph Mwenda", text: "Battery swollen, replaced with genuine cell." },
      { at: "Aug 1, 15:30", author: "Joseph Mwenda", text: "Running 6-hour discharge cycle test." },
    ],
    parts: [{ name: "Galaxy S22 battery", qty: 1, cost: 62000 }],
  },
  {
    ticket: "KB-RP-48166",
    customer: "Hassan Juma",
    phone: "+255 719 552 640",
    device: "HP EliteBook 840",
    problem: "Software problem — Windows boot loop after update",
    stage: "Completed",
    technician: "Fatma Salum",
    priority: "Express",
    quote: 65000,
    createdAt: "2026-07-30",
    notes: [
      { at: "Jul 30, 09:15", author: "Fatma Salum", text: "Data backed up to encrypted store before reinstall." },
      { at: "Jul 31, 12:00", author: "Fatma Salum", text: "Clean Windows 11 install, drivers and Office restored." },
    ],
    parts: [],
  },
  {
    ticket: "KB-RP-48150",
    customer: "Grace Mbwana",
    phone: "+255 763 900 145",
    device: "iPad Air 4",
    problem: "Water damage — device exposed to rain, no display",
    stage: "Diagnosis",
    technician: "Elias Kimaro",
    priority: "Critical",
    quote: 0,
    createdAt: "2026-08-05",
    notes: [{ at: "Aug 5, 08:40", author: "Elias Kimaro", text: "Ultrasonic clean scheduled, corrosion on display FPC." }],
    parts: [],
  },
];

export const technicians = [
  { name: "Joseph Mwenda", speciality: "Micro-soldering, iPhone", active: 6, completed: 142, load: 78 },
  { name: "Fatma Salum", speciality: "Laptops, data recovery", active: 4, completed: 118, load: 55 },
  { name: "Elias Kimaro", speciality: "Tablets, water damage", active: 5, completed: 96, load: 64 },
  { name: "Zawadi Peter", speciality: "Software & setup", active: 3, completed: 173, load: 41 },
];

/* ---------------------------------- Orders ---------------------------------- */

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered";

export type Order = {
  id: string;
  date: string;
  customer: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: OrderStatus;
  channel: "Online" | "Walk-in" | "Corporate";
};

export const orders: Order[] = [
  {
    id: "KB-ORD-90412",
    date: "2026-08-05",
    customer: "Amina Mushi",
    items: [{ name: "iPhone 15 Pro 256GB", qty: 1, price: 2850000 }],
    total: 2850000,
    status: "Processing",
    channel: "Online",
  },
  {
    id: "KB-ORD-90405",
    date: "2026-08-04",
    customer: "Tanzania Ports Authority",
    items: [
      { name: "Dell XPS 15 Creator", qty: 4, price: 4120000 },
      { name: "Anker 737 Power Bank 24K", qty: 4, price: 320000 },
    ],
    total: 17760000,
    status: "Shipped",
    channel: "Corporate",
  },
  {
    id: "KB-ORD-90398",
    date: "2026-08-03",
    customer: "Baraka Nyoni",
    items: [{ name: "Sony WH-1000XM5", qty: 1, price: 890000 }],
    total: 890000,
    status: "Delivered",
    channel: "Online",
  },
  {
    id: "KB-ORD-90381",
    date: "2026-08-02",
    customer: "Neema Kileo",
    items: [{ name: "Galaxy Tab S9 FE", qty: 1, price: 1150000 }],
    total: 1150000,
    status: "Pending",
    channel: "Online",
  },
  {
    id: "KB-ORD-90370",
    date: "2026-08-01",
    customer: "Hassan Juma",
    items: [{ name: "PlayStation 5 Slim Disc", qty: 1, price: 1890000 }],
    total: 1890000,
    status: "Delivered",
    channel: "Walk-in",
  },
];

/* --------------------------------- Analytics -------------------------------- */

export const salesTrend = [
  { month: "Feb", sales: 148, repairs: 62 },
  { month: "Mar", sales: 172, repairs: 71 },
  { month: "Apr", sales: 165, repairs: 88 },
  { month: "May", sales: 204, repairs: 96 },
  { month: "Jun", sales: 236, repairs: 110 },
  { month: "Jul", sales: 268, repairs: 132 },
  { month: "Aug", sales: 291, repairs: 147 },
];

export const categoryPerformance = [
  { name: "Smartphones", value: 38 },
  { name: "Laptops", value: 27 },
  { name: "Accessories", value: 15 },
  { name: "Gaming", value: 11 },
  { name: "Tablets", value: 9 },
];

export const customerGrowth = [
  { month: "Feb", customers: 1240 },
  { month: "Mar", customers: 1418 },
  { month: "Apr", customers: 1602 },
  { month: "May", customers: 1855 },
  { month: "Jun", customers: 2140 },
  { month: "Jul", customers: 2492 },
  { month: "Aug", customers: 2861 },
];

export const inventory = [
  { sku: "KB-SM-0142", name: "iPhone 15 Pro 256GB", type: "Product", stock: 12, reorder: 6, supplier: "Redington EA" },
  { sku: "KB-SM-0187", name: "Galaxy S24 Ultra 512GB", type: "Product", stock: 7, reorder: 8, supplier: "Samsung TZ" },
  { sku: "KB-LP-0231", name: "Dell XPS 15 Creator", type: "Product", stock: 3, reorder: 5, supplier: "Dell Partner EA" },
  { sku: "KB-PT-1109", name: "iPhone 13 Pro OEM display", type: "Spare part", stock: 4, reorder: 10, supplier: "Shenzhen Parts Co" },
  { sku: "KB-PT-1142", name: "Galaxy S22 battery", type: "Spare part", stock: 21, reorder: 10, supplier: "Shenzhen Parts Co" },
  { sku: "KB-PT-1188", name: "MacBook USB-C I/O board", type: "Spare part", stock: 2, reorder: 6, supplier: "iFixit Wholesale" },
];

export const customersCrm = [
  { name: "Amina Mushi", tier: "Gold", orders: 9, repairs: 3, spend: 8420000, last: "Aug 5, 2026" },
  { name: "Tanzania Ports Authority", tier: "Corporate", orders: 24, repairs: 12, spend: 96400000, last: "Aug 4, 2026" },
  { name: "Baraka Nyoni", tier: "Silver", orders: 5, repairs: 2, spend: 3110000, last: "Aug 3, 2026" },
  { name: "Neema Kileo", tier: "Silver", orders: 4, repairs: 1, spend: 2280000, last: "Aug 2, 2026" },
  { name: "Hassan Juma", tier: "Bronze", orders: 2, repairs: 1, spend: 1955000, last: "Aug 1, 2026" },
];

export const reviews = [
  {
    name: "Amina Mushi",
    role: "Product designer, Dar es Salaam",
    text: "They replaced my iPhone screen in under two hours and sent me tracking updates the whole time. It felt like an Apple Store experience, in Kariakoo.",
    rating: 5,
  },
  {
    name: "Ephraim Lyimo",
    role: "IT manager, Arusha",
    text: "We now buy all staff laptops from KBestoreTZ. Invoicing, warranty and repair turnaround are handled on one dashboard.",
    rating: 5,
  },
  {
    name: "Grace Mbwana",
    role: "Student, Mwanza",
    text: "Genuine accessories at fair prices and honest advice. My tablet was diagnosed for free before I approved the quote.",
    rating: 4,
  },
];

export const locations = [
  { city: "Dar es Salaam", detail: "Savei Complex — flagship store & repair lab" },
  { city: "Arusha", detail: "Sales & express repair" },
  { city: "Mwanza", detail: "Sales & pickup point" },
];