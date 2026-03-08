export interface NewInSlot {
  productId: string | null;
  productName_en: string;
  productName_mn: string;
  productPrice: number; // MNT integer — actual sale price
  productCompareAtPrice?: number | null; // crossed-out original price
  productImageUrl: string;
  productSlug: string;
  colorSwatches: string[]; // hex values
}

export interface CollectionSlot {
  slug: string;         // URL slug → /collections/[slug]
  label_en: string;
  label_mn: string;
  imageUrl: string;     // uploaded to Storage
  productIds: string[]; // ordered curated product IDs
}

export interface FeaturedReview {
  reviewId: string;
  reviewerName: string;
  rating: number;
  title?: string;
  content: string;
  productName_en: string;
  productName_mn: string;
}

export interface FaqItem {
  id: string;
  question_en: string;
  question_mn: string;
  answer_en: string;
  answer_mn: string;
}

export interface ReviewScreenshot {
  id: string;
  imageUrl: string;
  caption?: string;
}

export interface LandingPageConfig {
  hero: {
    imageUrl: string;
    imageAlt: string;
    heading_en: string;
    heading_mn: string;
    subtitle_en: string;
    subtitle_mn: string;
    cta_en: string;
    cta_mn: string;
  };
  newIn: NewInSlot[]; // always 6 elements
  exclusive: NewInSlot[]; // always 4 elements — Heir Exclusive section
  collections: CollectionSlot[]; // always 8 elements
  featuredReviews: FeaturedReview[]; // up to 6 curated reviews
  reviewScreenshots: ReviewScreenshot[]; // up to 12 customer review screenshots
  faq: FaqItem[];
  _version: number;
}

const PLACEHOLDER_SWATCH = "#c8b89a";

export const DEFAULT_CONFIG: LandingPageConfig = {
  hero: {
    imageUrl: "https://placehold.co/600x800/1a1a2e/ffffff?text=HEIR",
    imageAlt: "HEIR — Mongolian Men's Fashion",
    heading_en: "New Collection from\nMongolian Men's Fashion",
    heading_mn: "Монгол эрэгтэй загварын\nшинэ цуглуулга",
    subtitle_en: "Spring / Summer 2026",
    subtitle_mn: "Хавар / Зун 2026",
    cta_en: "Shop Now",
    cta_mn: "Дэлгүүр үзэх",
  },
  newIn: [
    { productId: null, productName_en: "Coming Soon", productName_mn: "Удахгүй нэмэгдэнэ", productPrice: 0, productImageUrl: "https://placehold.co/400x400/f5f5f5/f5f5f5", productSlug: "", colorSwatches: [PLACEHOLDER_SWATCH] },
    { productId: null, productName_en: "Coming Soon", productName_mn: "Удахгүй нэмэгдэнэ", productPrice: 0, productImageUrl: "https://placehold.co/400x400/f5f5f5/f5f5f5", productSlug: "", colorSwatches: [PLACEHOLDER_SWATCH] },
    { productId: null, productName_en: "Coming Soon", productName_mn: "Удахгүй нэмэгдэнэ", productPrice: 0, productImageUrl: "https://placehold.co/400x400/f5f5f5/f5f5f5", productSlug: "", colorSwatches: [PLACEHOLDER_SWATCH] },
    { productId: null, productName_en: "Coming Soon", productName_mn: "Удахгүй нэмэгдэнэ", productPrice: 0, productImageUrl: "https://placehold.co/400x400/f5f5f5/f5f5f5", productSlug: "", colorSwatches: [PLACEHOLDER_SWATCH] },
    { productId: null, productName_en: "Coming Soon", productName_mn: "Удахгүй нэмэгдэнэ", productPrice: 0, productImageUrl: "https://placehold.co/400x400/f5f5f5/f5f5f5", productSlug: "", colorSwatches: [PLACEHOLDER_SWATCH] },
    { productId: null, productName_en: "Coming Soon", productName_mn: "Удахгүй нэмэгдэнэ", productPrice: 0, productImageUrl: "https://placehold.co/400x400/f5f5f5/f5f5f5", productSlug: "", colorSwatches: [PLACEHOLDER_SWATCH] },
  ],
  collections: [
    { slug: "heir-ss26", label_en: "HEIR SS26", label_mn: "HEIR ХЗ26", imageUrl: "https://placehold.co/400x400/f0ebe4/f0ebe4", productIds: [] },
    { slug: "mongolian-cashmere", label_en: "Mongolian Cashmere", label_mn: "Монгол Кашмир", imageUrl: "https://placehold.co/400x400/d4c9a8/d4c9a8", productIds: [] },
    { slug: "technical-outerwear", label_en: "Technical Outerwear", label_mn: "Техник гадуур хувцас", imageUrl: "https://placehold.co/400x400/1a1a2e/1a1a2e", productIds: [] },
    { slug: "heritage-wool", label_en: "Heritage Wool", label_mn: "Уламжлалт ноос", imageUrl: "https://placehold.co/400x400/e8c4c4/e8c4c4", productIds: [] },
    { slug: "core-collection", label_en: "Core Collection", label_mn: "Үндсэн цуглуулга", imageUrl: "https://placehold.co/400x400/e0d5c7/e0d5c7", productIds: [] },
    { slug: "nomad-series", label_en: "Nomad Series", label_mn: "Нүүдэлчний цуврал", imageUrl: "https://placehold.co/400x400/5a3e8a/5a3e8a", productIds: [] },
    { slug: "sustainable-basics", label_en: "Sustainable Basics", label_mn: "Тогтвортой үндсэн", imageUrl: "https://placehold.co/400x400/6b4e9e/6b4e9e", productIds: [] },
    { slug: "limited-edition", label_en: "Limited Edition", label_mn: "Хязгаарлагдмал", imageUrl: "https://placehold.co/400x400/8a9e7a/8a9e7a", productIds: [] },
  ],
  exclusive: [
    { productId: null, productName_en: "Coming Soon", productName_mn: "Удахгүй нэмэгдэнэ", productPrice: 0, productImageUrl: "https://placehold.co/400x400/f5f5f5/f5f5f5", productSlug: "", colorSwatches: [PLACEHOLDER_SWATCH] },
    { productId: null, productName_en: "Coming Soon", productName_mn: "Удахгүй нэмэгдэнэ", productPrice: 0, productImageUrl: "https://placehold.co/400x400/f5f5f5/f5f5f5", productSlug: "", colorSwatches: [PLACEHOLDER_SWATCH] },
    { productId: null, productName_en: "Coming Soon", productName_mn: "Удахгүй нэмэгдэнэ", productPrice: 0, productImageUrl: "https://placehold.co/400x400/f5f5f5/f5f5f5", productSlug: "", colorSwatches: [PLACEHOLDER_SWATCH] },
    { productId: null, productName_en: "Coming Soon", productName_mn: "Удахгүй нэмэгдэнэ", productPrice: 0, productImageUrl: "https://placehold.co/400x400/f5f5f5/f5f5f5", productSlug: "", colorSwatches: [PLACEHOLDER_SWATCH] },
  ],
  featuredReviews: [],
  reviewScreenshots: [],
  faq: [
    { id: "q1", question_en: "What shipping options are available?", question_mn: "Хүргэлтийн ямар сонголтууд байдаг вэ?", answer_en: "We offer standard delivery (3–5 business days) and express delivery (1–2 business days) within Ulaanbaatar. Nationwide shipping is available for select regions.", answer_mn: "Улаанбаатар хотод стандарт хүргэлт (3–5 ажлын өдөр) болон экспресс хүргэлт (1–2 ажлын өдөр) боломжтой. Зарим бүс нутагт улсын хэмжээний хүргэлт бас хийдэг." },
    { id: "q2", question_en: "How long does delivery take?", question_mn: "Хүргэлт хэр хугацаанд ирдэг вэ?", answer_en: "Orders within Ulaanbaatar are typically delivered within 1–3 business days. Nationwide deliveries may take 3–7 business days depending on location.", answer_mn: "Улаанбаатар доторх захиалга 1–3 ажлын өдрийн дотор хүргэгддэг. Орон нутгийн хүргэлт байршлаас хамааран 3–7 ажлын өдөр болдог." },
    { id: "q3", question_en: "What is your return policy?", question_mn: "Буцаалтын нөхцөл ямар байдаг вэ?", answer_en: "We accept returns within 14 days of delivery for unworn, unwashed items in their original condition with tags attached.", answer_mn: "Хүргэлтийн өдрөөс хойш 14 хоногийн дотор, өмсөгдөөгүй, угаагдаагүй, шошгоо бүрэн анхны байдлаар буцааж болно." },
    { id: "q4", question_en: "What payment methods do you accept?", question_mn: "Ямар төлбөрийн аргыг хүлээн авдаг вэ?", answer_en: "We accept QPay, Khan Bank, Golomt Bank transfers, and major international cards. All transactions are processed securely.", answer_mn: "QPay, Хаан банк, Голомт банкны шилжүүлэг болон олон улсын банкны картаар төлбөр хийх боломжтой." },
    { id: "q5", question_en: "How do I find my size?", question_mn: "Өөрт тохирох хэмжээгээ яаж сонгох вэ?", answer_en: "Each product page includes a detailed size guide with measurements in centimeters. If you're between sizes, we recommend sizing up.", answer_mn: "Бүтээгдэхүүний хуудас бүрт сантиметрээр хэмжсэн дэлгэрэнгүй хэмжээний хүснэгт байдаг. Хэрэв та хоёр хэмжээний хооронд байвал томыг нь сонгохыг зөвлөдөг." },
    { id: "q6", question_en: "What is your approach to sustainability?", question_mn: "Тогтвортой байдалд хандах хандлага ямар байдаг вэ?", answer_en: "We source premium natural fibers — cashmere, wool, and cotton — from ethical Mongolian producers. Our packaging is fully recyclable.", answer_mn: "Бид Монголын ёс зүйтэй үйлдвэрлэгчдээс кашмир, ноос, хөвөн зэрэг өндөр чанарын байгалийн эслэгийг авдаг. Манай сав баглаа боодол бүрэн дахивлагддаг." },
  ],
  _version: 1,
};

export function slugify(text: string): string {
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return cleaned || `product-${Date.now()}`;
}
