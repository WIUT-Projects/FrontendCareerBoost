import { LogIn, UserPlus, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  reason?: string;
}

export function AuthModal({ open, onClose, reason }: AuthModalProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  const handleRegister = () => {
    onClose();
    navigate('/register');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="items-center text-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="font-display text-xl">
            {t('blog.authModalTitle')}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-center">
            {reason ?? t('blog.authModalReason')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-2">
          <Button className="w-full h-11 gap-3" onClick={handleLogin}>
            <LogIn className="h-5 w-5" />
            {t('blog.signIn')}
          </Button>
          <Button variant="outline" className="w-full h-11 gap-3" onClick={handleRegister}>
            <UserPlus className="h-5 w-5" />
            {t('blog.register')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
