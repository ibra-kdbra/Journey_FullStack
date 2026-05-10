import { Footer, Layout } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import type { Metadata } from 'next'
import Link from 'next/link'
import "@/styles/docs.css";
import { CustomNavbar } from "../../components/common/custom-navbar";
import { ReadingProgressBar } from "@/components/docs/reading-progress-bar";

export const metadata: Metadata = {
  metadataBase: new URL('https://vievlog.com'),
  title: {
    template: "%s - Emi Docs",
    default: "Emi Documentation",
  },
  description: "Emi Documentation with Nextra",
  applicationName: "Emi Docs",
};

interface DocsLayoutProps {
  children: React.ReactNode
}

const CURRENT_YEAR = new Date().getFullYear()

export default async function DocsLayout({ children }: DocsLayoutProps) {
  const pageMap = await getPageMap()

  const excludePages = ['posts', 'auth', 'profile', 'games', 'image-editor', 'video-generator', 'korean']

  const filteredPageMap = pageMap
    .filter((item: any) => !excludePages.includes(item.name.toLowerCase()))
    .map((item: any, index: number) => ({
      ...item,
      key: item.route || item.name || `page-${index}`
    }))

  return (
    <>
      <ReadingProgressBar />
      <Layout
        navbar={<CustomNavbar />}
        footer={<Footer>MIT {CURRENT_YEAR} © Emi.</Footer>}
        sidebar={{ defaultMenuCollapseLevel: 1 }}
        pageMap={filteredPageMap}
        feedback={{ content: null }}
        editLink={null}
      >
        <div data-pagefind-body>
          {children}
        </div>
      </Layout>
    </>
  )
}
