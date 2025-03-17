import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "@/components/providers"
import { EB_Garamond } from "next/font/google"
import { cn } from "@/utils"

import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const eb_garamond = EB_Garamond({
	subsets: ["latin"],
	variable: "--font-heading",
})

export const metadata: Metadata = {
	metadataBase: new URL('https://padabot.netlify.app'),
	title: "PadaBot - Real-time monitoring made easy!",
	description: "Customizable notifications, proactive monitoring, and easy setup. All in one place.",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
	openGraph: {
		title: "PadaBot - Real-time monitoring made easy!",
		description: "Customizable notifications, proactive monitoring, and easy setup. All in one place.",
		url: "https://padabot.netlify.app",
	}
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<ClerkProvider>
			<html lang="en" className={cn(inter.variable, eb_garamond.variable)}>
				<body className="min-h-[calc(100vh-1px)] flex flex-col font-sans bg-brand-50 text-brand-950 antialiased">
					<main className="relative flex flex-1 flex-col">
						<Providers>{children}</Providers>
					</main>
				</body>
			</html>
		</ClerkProvider>
	)
}
