// hooks/use-toast.ts
import { useState } from 'react';

interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = ({ title, description, variant = 'default' }: ToastProps) => {
    // Simple implementation - you can enhance this
    const message = description ? `${title}: ${description}` : title;
    
    if (variant === 'destructive') {
      alert(`❌ ${message}`);
    } else {
      alert(`✅ ${message}`);
    }
  };

  return { toast };
};

export const toast = (props: ToastProps) => {
  const message = props.description ? `${props.title}: ${props.description}` : props.title;
  
  if (props.variant === 'destructive') {
    alert(`❌ ${message}`);
  } else {
    alert(`✅ ${message}`);
  }
};