# Lesson 15: Internationalization (i18n) in Next.js App Router

## 🎯 Learning Objectives

After this lesson, students will:

- Clearly understand the concepts of **Internationalization (i18n)** and **Localization (l10n)** in web development.
- Know how to configure i18n in Next.js App Router and understand multi-language routing.
- Know how to create and manage **translation** files for multiple languages.
- Understand how to **format numbers, dates, and currencies** according to language/locale.
- Implement **language detection** and create a **language switcher** for users to easily switch languages.
- Implement basic Right-To-Left (RTL) language support.
- Know how to use popular libraries like **next-intl** or **react-i18next** to handle i18n in Next.js App Router.

## 📝 Detailed Content

### 1. Basic Concepts: Internationalization (i18n) & Localization (l10n)

- **Internationalization (i18n)**: The process of preparing an application to support multiple languages and regional formats without needing to rewrite the source code. i18n is the foundational step for multi-language support.

- **Localization (l10n)**: The process of translating content and formatting dates, numbers, currencies, and cultural elements to suit a specific region, based on an i18n foundation.

> Example: If you build a website in Vietnamese and want to expand it to English and Korean, you must first perform i18n to structure the data, interface, and routing for multiple languages. Then, l10n is the actual translation of text and changing of date formats.

### 2. i18n in Next.js App Router: Why and How?

- Next.js supports i18n routing, meaning URLs can contain language codes like `/en`, `/vi`, `/ko`, etc.
- Configuring i18n helps automatically handle multi-language routing, improves SEO, and optimizes the user experience.
- There are several i18n strategies:

  - **Translation-based**: All text is translated, and the UI switches languages.
  - **Localization-based**: Number, date, and currency formats also change according to the language.

### 3. Configuration Steps for i18n in Next.js App Router

#### a) Configuring `next.config.js`

```ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ["en", "vi", "ko"], // List of supported languages
    defaultLocale: "en", // Default language
    localeDetection: true, // Enable/disable automatic browser language detection
  },
};

module.exports = nextConfig;
```

- `locales`: Each language corresponds to a code (ISO codes like 'en', 'vi', 'ko').
- `defaultLocale`: The fallback language if one cannot be determined.
- `localeDetection`: If enabled, Next.js automatically detects the browser language to redirect the user.

### 4. Managing Translation Files

- Usually, there is a folder like `locales/` containing JSON files:

```
/locales
  /en
    common.json
  /vi
    common.json
  /ko
    common.json
```

- Example `locales/en/common.json`:

```json
{
  "welcome": "Welcome to our website!",
  "login": "Login",
  "logout": "Logout"
}
```

- Example `locales/vi/common.json`:

```json
{
  "welcome": "Chào mừng đến với trang web của chúng tôi!",
  "login": "Đăng nhập",
  "logout": "Đăng xuất"
}
```

> **Explanation**: Each JSON file corresponds to a language and contains key-value pairs used for UI translation. When the app loads a page, it retrieves the corresponding text based on the language.

### 5. Using i18n Libraries: `next-intl` or `react-i18next`

- **next-intl**: A library optimized for Next.js App Router, supporting both server and client components.
- **react-i18next**: A popular and easy-to-use i18n library, suitable for React in general.

> In this lesson, we use `next-intl` as an example:

#### Installation

```bash
npm install next-intl
```

#### Create an `i18n.ts` file to load translation files

```ts
import { NextIntlClientProvider } from "next-intl";

export async function loadLocale(locale: string) {
  try {
    return (await import(`../locales/${locale}/common.json`)).default;
  } catch {
    return (await import(`../locales/en/common.json`)).default; // fallback
  }
}
```

#### Usage in the layout

```tsx
// app/[locale]/layout.tsx

import { NextIntlClientProvider } from "next-intl";
import { loadLocale } from "@/lib/i18n";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await loadLocale(params.locale);

  return (
    <html lang={params.locale}>
      <body>
        <NextIntlClientProvider locale={params.locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### 6. Language Routing with App Router

- Next.js App Router supports dynamic segment routing, so we can create a structure like:

```
app/
  [locale]/
    page.tsx  // Main page for the language
    layout.tsx
```

- Thus, URLs will look like:
  `/en`, `/vi`, `/ko`, etc.

- `params.locale` can be retrieved from the URL.

### 7. Creating a **LanguageSwitcher** Component

- Allows users to manually select and switch languages.

- Example:

```tsx
"use client";

import { useRouter, usePathname } from "next/navigation";

const locales = ["en", "vi", "ko"];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const locale = e.target.value;
    // Switch to the new language while keeping the pathname
    router.push(`/${locale}${pathname.replace(/^\/(en|vi|ko)/, "")}`);
  }

  return (
    <select onChange={onChange} defaultValue={pathname.split("/")[1]}>
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {loc.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
```

### 8. Formatting Numbers, Dates, and Currencies by Language

- JavaScript has a standard API: `Intl` (Internationalization API)

- Example:

```ts
const date = new Date();

const formattedDate = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "full",
}).format(date);
console.log(formattedDate); // Example: "thứ hai, ngày 4 tháng 8 năm 2025"

const formattedNumber = new Intl.NumberFormat("en-US").format(1234567.89);
console.log(formattedNumber); // "1,234,567.89"

const formattedCurrency = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
}).format(1000000);
console.log(formattedCurrency); // "₩1,000,000"
```

- It can be used within a React component:

```tsx
import { useLocale } from "next-intl";

export function DateComponent() {
  const locale = useLocale();
  const now = new Date();

  return (
    <div>
      {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(now)}
    </div>
  );
}
```

### 9. Right-to-Left (RTL) Language Support

- Languages like Arabic and Hebrew require a right-to-left layout.

- In Next.js, we can change the `dir` attribute on the `<html>` or `<body>` tag:

```tsx
<html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
  ...
</html>
```

- Tailwind CSS supports `dir="rtl"` to apply the appropriate styles.

### 10. Summary of the i18n Process in Next.js App Router

- Configure i18n in `next.config.js`.
- Create translation folders and files (`locales/[locale]/common.json`).
- Create multi-language routes with the `[locale]` dynamic folder.
- Load and provide translations in the layout (Server Component).
- Create a client component `LanguageSwitcher`.
- Use `next-intl` or `react-i18next` to look up and display translated text.
- Format dates, numbers, and currencies using the Intl API.
- Handle RTL if necessary.

## 🏆 Practice Exercise

### Task

Build a multi-language homepage (at least 2 languages: English and Vietnamese) with the following requirements:

1. Configure Next.js App Router to support i18n with `en` and `vi` languages.
2. Create a `common.json` translation file for each language with at least 3 strings:

   - "welcome"
   - "login"
   - "logout"

3. Create a homepage (`app/[locale]/page.tsx`) using `next-intl` to display the translated strings.
4. Create a **LanguageSwitcher** component for users to select and switch between the two languages.
5. Display the current date in the corresponding language format (using `Intl.DateTimeFormat`).
6. Ensure the URL updates correctly when switching languages (`/en` or `/vi`).

### Detailed Solution

#### 1. Configure `next.config.js`

```ts
module.exports = {
  i18n: {
    locales: ["en", "vi"],
    defaultLocale: "en",
    localeDetection: true,
  },
};
```

#### 2. Create the `locales` folder

```
/locales/en/common.json
{
  "welcome": "Welcome to our website!",
  "login": "Login",
  "logout": "Logout"
}

/locales/vi/common.json
{
  "welcome": "Chào mừng đến với trang web của chúng tôi!",
  "login": "Đăng nhập",
  "logout": "Đăng xuất"
}
```

#### 3. Create the `lib/i18n.ts` file

```ts
export async function loadLocale(locale: string) {
  try {
    return (await import(`../locales/${locale}/common.json`)).default;
  } catch {
    return (await import(`../locales/en/common.json`)).default;
  }
}
```

#### 4. Create the route folder `app/[locale]/page.tsx`

```tsx
import { useLocale, useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("common");
  const locale = useLocale();
  const now = new Date();

  const formattedDate = new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
  }).format(now);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">{t("welcome")}</h1>
      <p>{formattedDate}</p>
      <nav className="mt-4 space-x-4">
        <button>{t("login")}</button>
        <button>{t("logout")}</button>
      </nav>
    </main>
  );
}
```

#### 5. Create the `app/[locale]/layout.tsx` file to load messages

```tsx
import { NextIntlClientProvider } from "next-intl";
import { loadLocale } from "@/lib/i18n";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await loadLocale(params.locale);

  return (
    <html lang={params.locale}>
      <body>
        <NextIntlClientProvider locale={params.locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

#### 6. Create the client component **LanguageSwitcher.tsx**

```tsx
"use client";

import { useRouter, usePathname } from "next/navigation";

const locales = ["en", "vi"];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const locale = e.target.value;
    router.push(`/${locale}${pathname.replace(/^\/(en|vi)/, "")}`);
  }

  return (
    <select
      onChange={onChange}
      defaultValue={pathname.split("/")[1]}
      className="border p-1 rounded"
    >
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {loc.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
```

#### 7. Use `LanguageSwitcher` in the layout or page

```tsx
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function LocaleLayout({ children, params }) {
  // ... load messages

  return (
    <html lang={params.locale}>
      <body>
        <NextIntlClientProvider locale={params.locale} messages={messages}>
          <header className="p-4 border-b flex justify-end">
            <LanguageSwitcher />
          </header>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### Exercise Analysis

- Students practice each step from Next.js configuration, creating translation files, multi-language dynamic routing, to implementing a multi-language UI and date formatting.
- Through this exercise, students understand how to work with i18n in both server and client environments.
- Creating a LanguageSwitcher gives students practice in handling client-side navigation and URL management in App Router.

## 🔑 Key Points to Remember

- **Clear Concepts**: i18n is the preparation step; l10n is the actual translation and regional personalization.
- **Multi-language URL Structure**: Use the `[locale]` dynamic route in App Router for management.
- **JSON Translation Files**: Organize them clearly, making them easy to manage and keeping keys synchronized.
- **Using Libraries**: `next-intl` is well-suited for Next.js App Router, handling message loading and providing translation context.
- **Distinguish Server and Client Components in i18n**: Load messages on the server; use translation hooks on the client.
- **Locale-based Formatting**: Always use the `Intl` API for accuracy.
- **Handle Fallbacks**: If a translation file for a language doesn't exist, fallback to the default.
- **Language Detection**: Automatic browser language detection can be enabled in Next.js config.
- **RTL Support**: Set the `dir` attribute on the HTML tag to support right-to-left languages.
- **LanguageSwitcher**: Must change the URL correctly without losing page state.

## 📝 Homework

### Task

- Extend the practice exercise:

  1. Add the Korean language (`ko`) to the system and create its translation file.
  2. Implement currency formatting based on the language (e.g., USD for `en`, VND for `vi`, KRW for `ko`). Display a sample amount of 1,000,000 in the appropriate format.
  3. Add support for a mock RTL language (`ar`) and try setting `dir="rtl"` for the `app/ar/page.tsx` page.
  4. Create a language switcher dropdown menu with flag icons (you can use simple icons or national flag emojis).
  5. Research and take notes on how the `react-i18next` library can handle i18n in Next.js App Router, comparing its strengths and weaknesses with `next-intl`.

> This homework aims to familiarize students with extending i18n, handling various multi-language data types, and specific layout requirements.
