import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';
import { InitialLoader } from '../components/initial-loader';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        <Providers>
          {children}
          <InitialLoader />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
