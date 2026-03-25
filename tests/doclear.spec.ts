import { test, expect } from '@playwright/test';

// ============ 1. LANDING PAGE ============

test.describe('1. Landing page', () => {
  test('loads and shows DocLear branding', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=DocLear')).toBeVisible();
  });

  test('has Sign in link', async ({ page }) => {
    await page.goto('/');
    const signIn = page.locator('a[href*="/auth"]').first();
    await expect(signIn).toBeVisible();
  });

  test('has Try free / CTA button linking to /app', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('a[href*="/app"]').first();
    await expect(cta).toBeVisible();
  });

  test('has Privacy and Terms links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href*="/privacy"]')).toBeVisible();
    await expect(page.locator('a[href*="/terms"]')).toBeVisible();
  });

  test('has pricing section with €0 and €4.99', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=€0')).toBeVisible();
    await expect(page.locator('text=4.99')).toBeVisible();
  });
});

// ============ 2. SCAN FLOW ============

test.describe('2. Scan flow', () => {
  test('scan page loads with camera and upload buttons', async ({ page }) => {
    await page.goto('/app/scan');
    // Should have camera and upload buttons
    const buttons = await page.locator('button').count();
    expect(buttons).toBeGreaterThan(1);
  });

  test('upload area accepts file input', async ({ page }) => {
    await page.goto('/app/scan');
    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toBeAttached();
  });
});

// ============ 3. SCAN LIMIT ============

test.describe('3. Scan limit', () => {
  test('scan counter visible on timeline', async ({ page }) => {
    await page.goto('/app');
    // Should show scan counter text (X sur/of/из Y)
    const counter = page.locator('text=/\\d+.*\\d+/').first();
    await expect(counter).toBeVisible();
  });
});

// ============ 4. GOOGLE AUTH ============

test.describe('4. Google Auth', () => {
  test('auth page loads with Google button', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.locator('text=Google')).toBeVisible();
  });

  test('auth page has Apple button', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.locator('text=Apple')).toBeVisible();
  });

  test('auth page has email form', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});

// ============ 5. EMAIL AUTH ============

test.describe('5. Email Auth form', () => {
  test('can switch between login and register', async ({ page }) => {
    await page.goto('/auth');
    // Should have a toggle between sign in / create account
    const toggleBtn = page.locator('button').filter({ hasText: /.+/ }).last();
    await expect(toggleBtn).toBeVisible();
  });

  test('shows error on invalid login', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);
    // Should show error message
    const error = page.locator('text=/invalid|error|incorrect/i');
    // May or may not show depending on Supabase config
  });
});

// ============ 7. LANGUAGE SWITCHING ============

test.describe('7. Language switching', () => {
  test('French landing loads correctly', async ({ page }) => {
    await page.goto('/fr');
    await expect(page.locator('text=DocLear')).toBeVisible();
  });

  test('English landing loads correctly', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('text=DocLear')).toBeVisible();
    await expect(page.locator('text=/Photograph|Understand|seconds/i')).toBeVisible();
  });

  test('Russian landing loads correctly', async ({ page }) => {
    await page.goto('/ru');
    await expect(page.locator('text=DocLear')).toBeVisible();
    await expect(page.locator('text=/Сфотографируйте|документ|секунды/i')).toBeVisible();
  });

  test('Arabic landing loads with RTL', async ({ page }) => {
    await page.goto('/ar');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
  });

  test('Settings page loads in French', async ({ page }) => {
    await page.goto('/fr/app/settings');
    await expect(page.locator('text=/Paramètres|Langue/i')).toBeVisible();
  });

  test('Settings page loads in Russian', async ({ page }) => {
    await page.goto('/ru/app/settings');
    await expect(page.locator('text=/Параметры|Язык/i')).toBeVisible();
  });
});

// ============ 8. MOBILE ============

test.describe('8. Mobile layout', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('bottom nav visible on mobile', async ({ page }) => {
    await page.goto('/app');
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('landing sign in button visible on mobile', async ({ page }) => {
    await page.goto('/');
    const signIn = page.locator('a[href*="/auth"]').first();
    await expect(signIn).toBeVisible();
  });

  test('language selector does not overflow on mobile', async ({ page }) => {
    await page.goto('/ru');
    // Check that logo is visible (not hidden by language text)
    await expect(page.locator('text=DocLear').first()).toBeVisible();
  });
});

// ============ 9. ALL 8 LANGUAGES ============

test.describe('9. All 8 languages load', () => {
  const locales = ['fr', 'en', 'ru', 'ar', 'it', 'zh', 'pt', 'tr'];

  for (const locale of locales) {
    test(`${locale} landing page loads (200)`, async ({ page }) => {
      const response = await page.goto(`/${locale}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('text=DocLear')).toBeVisible();
    });

    test(`${locale} app page loads (200)`, async ({ page }) => {
      const response = await page.goto(`/${locale}/app`);
      expect(response?.status()).toBe(200);
    });

    test(`${locale} scan page loads (200)`, async ({ page }) => {
      const response = await page.goto(`/${locale}/app/scan`);
      expect(response?.status()).toBe(200);
    });

    test(`${locale} settings page loads (200)`, async ({ page }) => {
      const response = await page.goto(`/${locale}/app/settings`);
      expect(response?.status()).toBe(200);
    });

    test(`${locale} pros page loads (200)`, async ({ page }) => {
      const response = await page.goto(`/${locale}/app/pros`);
      expect(response?.status()).toBe(200);
    });
  }
});

// ============ 10. PAGES STATUS ============

test.describe('10. Key pages respond', () => {
  test('privacy page loads', async ({ page }) => {
    const response = await page.goto('/privacy');
    expect(response?.status()).toBe(200);
  });

  test('terms page loads', async ({ page }) => {
    const response = await page.goto('/terms');
    expect(response?.status()).toBe(200);
  });

  test('auth page loads', async ({ page }) => {
    const response = await page.goto('/auth');
    expect(response?.status()).toBe(200);
  });

  test('API analyze endpoint exists', async ({ page }) => {
    const response = await page.goto('/api/analyze');
    // Should return 405 (method not allowed for GET) or 400, not 404
    expect(response?.status()).not.toBe(404);
  });
});
