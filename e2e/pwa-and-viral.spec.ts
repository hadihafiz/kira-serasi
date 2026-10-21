import { test, expect } from "@playwright/test";

test.describe("PWA, SEO & Viral Sharing automated verification", () => {
  test("1. Manifest & icons are reachable and valid", async ({ request }) => {
    // Check web manifest
    const manifestRes = await request.get("/manifest.webmanifest");
    expect(manifestRes.status()).toBe(200);
    const manifest = await manifestRes.json();
    expect(manifest.short_name).toBe("Kira Serasi");
    expect(manifest.display).toBe("standalone");
    expect(manifest.background_color).toBe("#fffdf4");

    // Check main icon
    const iconRes = await request.get("/icon.svg");
    expect(iconRes.status()).toBe(200);

    // Check service worker file
    const swRes = await request.get("/sw.js");
    expect(swRes.status()).toBe(200);
  });

  test("2. SEO & indexing endpoints (robots.txt & sitemap.xml)", async ({ request }) => {
    const robotsRes = await request.get("/robots.txt");
    expect(robotsRes.status()).toBe(200);
    const robotsTxt = await robotsRes.text();
    expect(robotsTxt).toContain("Allow: /");
    expect(robotsTxt).toContain("sitemap.xml");

    const sitemapRes = await request.get("/sitemap.xml");
    expect(sitemapRes.status()).toBe(200);
    const sitemapXml = await sitemapRes.text();
    expect(sitemapXml).toContain("<urlset");
  });

  test("3. OpenGraph and mobile app metadata in HTML", async ({ page }) => {
    await page.goto("/");

    // Verify OpenGraph tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
    expect(ogTitle).toContain("Kira Serasi");

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(ogImage).toContain("/api/og");

    // Verify Twitter card
    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute("content");
    expect(twitterCard).toBe("summary_large_image");

    // Verify Mobile Web App Capable
    const mobileCapable = await page.locator('meta[name="mobile-web-app-capable"]').getAttribute("content");
    expect(mobileCapable).toBe("yes");
  });

  test("4. Full gameplay, calculation flow, and share triggers", async ({ page }) => {
    await page.goto("/");

    // Fill names
    const inputs = page.locator("input.line-input");
    await expect(inputs).toHaveCount(2);

    await inputs.nth(0).fill("Ahmad");
    await inputs.nth(1).fill("Siti Nurhaliza");

    // Submit form
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Verify calculation appears
    await expect(page.locator("text=Ahmad")).toBeVisible();
    await expect(page.locator("text=Siti Nurhaliza")).toBeVisible();

    // Tap to skip animation and immediately reach score
    const skipBtn = page.locator("button:has-text('ketik untuk langkau'), button:has-text('tap to skip')");
    if (await skipBtn.isVisible()) {
      await skipBtn.click();
    }

    // Verify final score badge renders
    await expect(page.locator("text=63%")).toBeVisible({ timeout: 10000 });

    // Verify share action buttons
    await expect(page.locator("button:has-text('WhatsApp')")).toBeVisible();
    await expect(page.locator("button:has-text('Salin pautan'), button:has-text('Copy link')")).toBeVisible();
    await expect(page.locator("a:has-text('Muat turun Story'), a:has-text('Download Story')")).toBeVisible();
  });

  test("5. Dynamic Edge Open Graph image generation", async ({ request }) => {
    const ogRes = await request.get("/api/og?a=Ahmad&b=Siti%20Nurhaliza");
    expect(ogRes.status()).toBe(200);
    expect(ogRes.headers()["content-type"]).toBe("image/png");
    expect(ogRes.headers()["cache-control"]).toContain("public, immutable, no-transform, max-age=31536000");

    // Check Story format (9:16)
    const storyRes = await request.get("/api/og?a=Ahmad&b=Siti%20Nurhaliza&f=story");
    expect(storyRes.status()).toBe(200);
    expect(storyRes.headers()["content-type"]).toBe("image/png");
  });
});
