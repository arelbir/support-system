'use client';

import React, { useEffect, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { defaultTheme } from './theme-config';
import i18next from 'i18next';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';

// i18n
import '../i18n';

// Create a client
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  // Isomorphic rendering için
  const [mounted, setMounted] = useState(false);

  // Ensure i18n ve tema başlatılması client-side'da gerçekleşsin
  useEffect(() => {
    setMounted(true);
    // i18next için localStorage'dan dil tercihi okunması
    const storedLang = localStorage.getItem('i18nextLng');
    if (storedLang) {
      i18next.changeLanguage(storedLang);
    } else {
      // Varsayılan dil olarak Türkçe ayarla (sunucu ile uyumlu olması için)
      i18next.changeLanguage('tr');
    }
  }, []);

  // İlk render sunucu tarafında gerçekleştiği ve hidrasyon hatalarını önlemek için
  // mounted false ise içeriği gösterme
  if (!mounted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme={defaultTheme}
        enableSystem={false}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
