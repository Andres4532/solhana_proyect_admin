import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "../src/contexts/AuthContext"
import { NavigationProvider } from "../src/contexts/NavigationContext"
import { CategoriesProvider } from "../src/contexts/CategoriesContext"
import { ProductSyncProvider } from "../src/contexts/ProductSyncContext"
import { Toaster } from "react-hot-toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Business Dashboard",
  description: "Manage your business operations efficiently",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <NavigationProvider>
            <CategoriesProvider>
              <ProductSyncProvider>
                {children}
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                    color: '#fff',
                  },
                }}
              />
              </ProductSyncProvider>
            </CategoriesProvider>
          </NavigationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
