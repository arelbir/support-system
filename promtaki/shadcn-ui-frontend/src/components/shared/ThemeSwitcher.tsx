'use client';

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Hidrasyon hatalarını önlemek için bileşen mount olduktan sonra içeriği göster
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      title={t(theme === 'dark' ? 'theme.toggleLight' : 'theme.toggleDark')}
      className="text-muted-foreground"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  );
}
