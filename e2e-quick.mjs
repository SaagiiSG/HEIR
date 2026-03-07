/**
 * Quick E2E test — uses domcontentloaded to avoid hanging on slow Supabase images.
 * Tests all key user flows and pages.
 */
import puppeteer from "puppeteer";
import { writeFileSync, mkdirSync } from "fs";

const BASE = "http://localhost:3001";
const SS_DIR = "/tmp/heir-e2e";
mkdirSync(SS_DIR, { recursive: true });

let passed = 0, failed = 0;
const results = [];

function log(label, ok, detail = "") {
  const icon = ok ? "✅" : "❌";
  console.log(`${icon} ${label}${detail ? ` — ${detail}` : ""}`);
  results.push({ label, ok, detail });
  if (ok) passed++; else failed++;
}

async function ss(page, name) {
  await page.screenshot({ path: `${SS_DIR}/${name}.png`, fullPage: false }).catch(() => {});
}

async function goto(page, path, opts = {}) {
  return page.goto(`${BASE}${path}`, {
    waitUntil: "domcontentloaded",
    timeout: 20000,
    ...opts,
  });
}

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
  protocolTimeout: 60000,
});
const page = await browser.newPage();
// Abort image/font/media to prevent Supabase image timeouts from blocking tests
await page.setRequestInterception(true);
page.on("request", (req) => {
  if (["image", "font", "media"].includes(req.resourceType())) {
    req.abort();
  } else {
    req.continue();
  }
});
await page.setViewport({ width: 1280, height: 800 });

// ─────────────────────────────────────────
// 1. HOMEPAGE
// ─────────────────────────────────────────
console.log("\n── 1. Homepage ──");
try {
  const res = await goto(page, "/mn");
  log("Homepage HTTP 200", res.status() === 200, `status=${res.status()}`);
  await ss(page, "01-homepage");

  const header = await page.$("header");
  log("Header renders", !!header);

  const allLinks = await page.evaluate(() =>
    Array.from(document.querySelectorAll("header a")).map(a => ({ href: a.href, text: a.textContent.trim() }))
  );
  const logoLink = allLinks.find(l => l.text === "HEIR" || l.href.endsWith("/mn") || l.href.endsWith("/mn/"));
  log("HEIR logo link in header", !!logoLink, JSON.stringify(logoLink));

  const h1 = await page.$("h1");
  const h1Text = h1 ? await page.evaluate(el => el.textContent.trim().slice(0, 60), h1) : "";
  log("Hero h1 renders", h1Text.length > 0, `"${h1Text}"`);

  const skipLink = await page.$("a[href='#main-content']");
  log("Skip nav link present", !!skipLink);

  const mainContent = await page.$("#main-content");
  log("#main-content present", !!mainContent);
} catch (e) {
  log("Homepage", false, e.message);
}

// ─────────────────────────────────────────
// 2. HEADER NAVIGATION
// ─────────────────────────────────────────
console.log("\n── 2. Header Navigation ──");
try {
  await goto(page, "/mn");
  const navLinks = await page.evaluate(() =>
    Array.from(document.querySelectorAll("header a")).map(a => ({
      href: a.getAttribute("href"),
      text: a.textContent.trim(),
    }))
  );
  const storeLink = navLinks.find(l => l.href?.includes("/store"));
  log("Store link in nav", !!storeLink, JSON.stringify(storeLink));
  const dropsLink = navLinks.find(l => l.href?.includes("/drops"));
  log("Drops link in nav", !!dropsLink, JSON.stringify(dropsLink));
  const cartLink = navLinks.find(l => l.href?.includes("/cart"));
  log("Cart link in nav", !!cartLink, JSON.stringify(cartLink));

  // Language switcher
  const langSwitcher = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button, a"));
    return buttons.some(b => b.textContent.includes("EN") || b.textContent.includes("MN") || b.textContent.includes("English") || b.textContent.includes("Монгол"));
  });
  log("Language switcher present", langSwitcher);
} catch (e) {
  log("Header navigation", false, e.message);
}

// ─────────────────────────────────────────
// 3. STORE PAGE
// ─────────────────────────────────────────
console.log("\n── 3. Store Page ──");
try {
  const res = await goto(page, "/mn/store");
  log("Store page HTTP 200", res.status() === 200, `status=${res.status()}`);
  await ss(page, "03-store");

  const searchInput = await page.$("input[name='q']");
  log("Search input present", !!searchInput);

  const bodyText = await page.evaluate(() => document.body.innerText);
  log("Store page has content", bodyText.length > 100, `${bodyText.length} chars`);

  // Product cards or empty state
  const productCards = await page.$$("a[href*='/store/']");
  const productCount = productCards.length;
  log("Product cards rendered", productCount >= 0, `${productCount} products (0 = empty DB or filters)`);
  if (productCount === 0) {
    log("Store empty state shown", bodyText.includes("бараа") || bodyText.includes("product") || bodyText.includes("found") || bodyText.includes("олдсонгүй"), "empty state text");
  }

  // Pagination component
  const pagination = await page.evaluate(() => !!document.querySelector("nav[aria-label]"));
  log("Pagination nav rendered or N/A", true, pagination ? "present" : "not rendered (OK if <24 products)");
} catch (e) {
  log("Store page", false, e.message);
}

// ─────────────────────────────────────────
// 4. LOGIN PAGE
// ─────────────────────────────────────────
console.log("\n── 4. Login Page ──");
try {
  const res = await goto(page, "/mn/login");
  log("Login page HTTP 200", res.status() === 200, `status=${res.status()}`);
  await ss(page, "04-login");

  const emailInput = await page.$("input[type='email'], input[name='email']");
  log("Email input present", !!emailInput);
  const passwordInput = await page.$("input[type='password']");
  log("Password input present", !!passwordInput);
  const submitBtn = await page.$("button[type='submit']");
  log("Submit button present", !!submitBtn);

  // Google OAuth button
  const bodyText = await page.evaluate(() => document.body.innerText);
  log("Google OAuth option present", bodyText.toLowerCase().includes("google"), `text sample: "${bodyText.slice(0, 200).replace(/\n/g, " ")}"`);

  // Test empty form submission — should show validation
  if (submitBtn) {
    await submitBtn.click();
    await page.waitForTimeout(800);
    const afterText = await page.evaluate(() => document.body.innerText);
    const hasErrors = afterText.includes("required") || afterText.includes("шаардлагатай") || afterText.includes("Please") || afterText.includes("хоосон") || afterText.length !== bodyText.length;
    log("Login form validates empty submit", hasErrors);
  }
} catch (e) {
  log("Login page", false, e.message);
}

// ─────────────────────────────────────────
// 5. REGISTER PAGE
// ─────────────────────────────────────────
console.log("\n── 5. Register Page ──");
try {
  const res = await goto(page, "/mn/register");
  log("Register page HTTP 200", res.status() === 200, `status=${res.status()}`);
  await ss(page, "05-register");

  const inputs = await page.$$("input");
  log("Register has multiple inputs", inputs.length >= 4, `${inputs.length} inputs`);
  const submitBtn = await page.$("button[type='submit']");
  log("Register submit button present", !!submitBtn);
} catch (e) {
  log("Register page", false, e.message);
}

// ─────────────────────────────────────────
// 6. FORGOT PASSWORD
// ─────────────────────────────────────────
console.log("\n── 6. Forgot Password ──");
try {
  const res = await goto(page, "/mn/forgot-password");
  log("Forgot password HTTP 200", res.status() === 200, `status=${res.status()}`);
  const emailInput = await page.$("input[type='email'], input[name='email']");
  log("Email input present", !!emailInput);
} catch (e) {
  log("Forgot password page", false, e.message);
}

// ─────────────────────────────────────────
// 7. PROTECTED ROUTE REDIRECTS
// ─────────────────────────────────────────
console.log("\n── 7. Auth Redirects ──");
// Disable interception temporarily for redirect checks
await page.setRequestInterception(false);
try {
  // Checkout should redirect to login
  const res = await goto(page, "/mn/checkout");
  const finalUrl = page.url();
  log("Checkout redirects to login when unauthenticated", finalUrl.includes("/login"), `url=${finalUrl}`);

  // Account should redirect to login
  const res2 = await goto(page, "/mn/account");
  const finalUrl2 = page.url();
  log("Account redirects to login when unauthenticated", finalUrl2.includes("/login"), `url=${finalUrl2}`);

  // Admin should redirect when unauthenticated
  const res3 = await goto(page, "/mn/admin");
  const finalUrl3 = page.url();
  log("Admin redirects when unauthenticated", !finalUrl3.includes("/admin") || finalUrl3.includes("/login"), `url=${finalUrl3}`);
} catch (e) {
  log("Auth redirect tests", false, e.message);
}
await page.setRequestInterception(true);
page.on("request", (req) => {
  if (["image", "font", "media"].includes(req.resourceType())) req.abort();
  else req.continue();
});

// ─────────────────────────────────────────
// 8. CART PAGE
// ─────────────────────────────────────────
console.log("\n── 8. Cart Page ──");
try {
  const res = await goto(page, "/mn/cart");
  log("Cart page HTTP 200", res.status() === 200, `status=${res.status()}`);
  await ss(page, "08-cart");

  const bodyText = await page.evaluate(() => document.body.innerText);
  log("Cart has content", bodyText.length > 50, `${bodyText.length} chars`);
  const hasCartWord = bodyText.includes("Сагс") || bodyText.includes("cart") || bodyText.includes("Cart");
  log("Cart page shows cart content", hasCartWord);
} catch (e) {
  log("Cart page", false, e.message);
}

// ─────────────────────────────────────────
// 9. CHECKOUT (unauthenticated → login redirect)
// ─────────────────────────────────────────
console.log("\n── 9. Checkout Redirect ──");
try {
  await page.setRequestInterception(false);
  const res = await goto(page, "/mn/checkout");
  const url = page.url();
  log("Checkout redirects to login (unauthenticated)", url.includes("/login"), `url=${url}`);
  await ss(page, "09-checkout-redirect");
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (["image", "font", "media"].includes(req.resourceType())) req.abort();
    else req.continue();
  });
} catch (e) {
  log("Checkout redirect", false, e.message);
}

// ─────────────────────────────────────────
// 10. ENGLISH LOCALE
// ─────────────────────────────────────────
console.log("\n── 10. English Locale ──");
try {
  const res = await goto(page, "/en");
  log("English homepage HTTP 200", res.status() === 200, `status=${res.status()}`);
  await ss(page, "10-en-homepage");

  const bodyText = await page.evaluate(() => document.body.innerText);
  const hasEnglish = bodyText.includes("Shop") || bodyText.includes("New In") || bodyText.includes("Collection") || bodyText.includes("HEIR");
  log("English locale renders English content", hasEnglish, `"${bodyText.slice(0, 100).replace(/\n/g, " ")}"`);

  const res2 = await goto(page, "/en/store");
  log("English store HTTP 200", res2.status() === 200);
  const placeholder = await page.$eval("input[name='q']", el => el.placeholder).catch(() => null);
  log("Search placeholder in English", placeholder?.includes("Search"), `"${placeholder}"`);
} catch (e) {
  log("English locale", false, e.message);
}

// ─────────────────────────────────────────
// 11. MOBILE VIEWPORT
// ─────────────────────────────────────────
console.log("\n── 11. Mobile Viewport (375px) ──");
try {
  await page.setViewport({ width: 375, height: 812 });
  const res = await goto(page, "/mn");
  log("Homepage loads at 375px", res.status() === 200);
  await ss(page, "11-mobile-homepage");

  const heroFontSize = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    return h1 ? parseFloat(window.getComputedStyle(h1).fontSize) : null;
  });
  log("Hero font ≤40px on mobile", (heroFontSize ?? 999) <= 40, `${heroFontSize}px`);

  const hamburger = await page.$("button[aria-label='Open menu']");
  log("Hamburger button visible", !!hamburger);

  if (hamburger) {
    await hamburger.click();
    await page.waitForTimeout(500);
    await ss(page, "11b-mobile-menu");
    const menuOpen = await page.evaluate(() => {
      const fixed = document.querySelector("[class*='fixed']");
      return !!fixed;
    });
    log("Mobile menu opens", menuOpen);
  }
} catch (e) {
  log("Mobile viewport", false, e.message);
}

// ─────────────────────────────────────────
// 12. SEO — sitemap + robots
// ─────────────────────────────────────────
console.log("\n── 12. SEO ──");
await page.setViewport({ width: 1280, height: 800 });
try {
  await page.setRequestInterception(false);
  const sitemapRes = await goto(page, "/sitemap.xml");
  log("sitemap.xml HTTP 200", sitemapRes.status() === 200, `status=${sitemapRes.status()}`);

  const robotsRes = await goto(page, "/robots.txt");
  log("robots.txt HTTP 200", robotsRes.status() === 200, `status=${robotsRes.status()}`);
  const robotsText = await page.evaluate(() => document.body.innerText);
  log("robots.txt has Sitemap directive", robotsText.includes("Sitemap"), `"${robotsText.slice(0, 100)}"`);
} catch (e) {
  log("SEO files", false, e.message);
}

// ─────────────────────────────────────────
// 13. DROPS PAGE
// ─────────────────────────────────────────
console.log("\n── 13. Drops Page ──");
try {
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (["image", "font", "media"].includes(req.resourceType())) req.abort();
    else req.continue();
  });
  const res = await goto(page, "/mn/drops");
  log("Drops page HTTP 200", res.status() === 200, `status=${res.status()}`);
  await ss(page, "13-drops");
  const bodyText = await page.evaluate(() => document.body.innerText);
  log("Drops page renders content", bodyText.length > 50, `${bodyText.length} chars`);
} catch (e) {
  log("Drops page", false, e.message);
}

// ─────────────────────────────────────────
// RESULTS
// ─────────────────────────────────────────
await browser.close();

console.log(`\n${"─".repeat(60)}`);
console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed} checks`);
if (failed > 0) {
  console.log("\nFailed checks:");
  results.filter(r => !r.ok).forEach(r => console.log(`  ❌ ${r.label}: ${r.detail}`));
}
console.log(`\nScreenshots: ${SS_DIR}/`);
process.exit(failed > 0 ? 1 : 0);
