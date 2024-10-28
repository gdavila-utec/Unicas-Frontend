// app/layout.tsx
import { ThemeProvider } from '@/components/theme-provider';
import { AuthHydration } from '@/components/AuthHydration';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='es'>
      <body className=''>
        <ThemeProvider
          attribute='class'
          defaultTheme='light'
          enableSystem
          disableTransitionOnChange
        >
          <AuthHydration>
            <main>{children}</main>
            <Toaster />
          </AuthHydration>
        </ThemeProvider>
      </body>
    </html>
  );
}
