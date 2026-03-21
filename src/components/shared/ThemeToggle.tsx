import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle({ variant = 'ghost' }: { variant?: 'ghost' | 'outline' }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button variant={variant} size="icon" onClick={toggleTheme} title={theme === 'light' ? 'Dark mode' : 'Light mode'}>
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
}
