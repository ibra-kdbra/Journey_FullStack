import "./globals.css";
import { Inter } from "next/font/google";
import ClientLayout from "./ClientLayout";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trivia Master",
  description: "Become a Trivia Master with timed modes and more.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎓</text></svg>",
  },
};

export default function RootLayout({
  children,
  quiz,
}: {
  children: React.ReactNode;
  quiz: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="theme-switcher"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var dark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (dark) document.documentElement.className = 'dark';
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ClientLayout quiz={quiz}>{children}</ClientLayout>
      </body>
    </html>
  );
}
