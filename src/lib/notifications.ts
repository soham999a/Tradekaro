import toast from 'react-hot-toast';

export interface NotificationOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}

export class NotificationService {
  static success(message: string, options?: NotificationOptions) {
    return toast.success(message, {
      duration: options?.duration || 5000,
      style: {
        cursor: options?.dismissible !== false ? 'pointer' : 'default',
      },
    });
  }

  static error(message: string, options?: NotificationOptions) {
    return toast.error(message, {
      duration: options?.duration || 6000,
      style: {
        cursor: options?.dismissible !== false ? 'pointer' : 'default',
      },
    });
  }

  static info(message: string, options?: NotificationOptions) {
    return toast(message, {
      icon: 'ℹ️',
      duration: options?.duration || 4000,
      style: {
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        color: '#1d4ed8',
        cursor: options?.dismissible !== false ? 'pointer' : 'default',
      },
    });
  }

  static warning(message: string, options?: NotificationOptions) {
    return toast(message, {
      icon: '⚠️',
      duration: options?.duration || 5000,
      style: {
        background: '#fffbeb',
        border: '1px solid #fed7aa',
        color: '#d97706',
        cursor: options?.dismissible !== false ? 'pointer' : 'default',
      },
    });
  }

  static loading(message: string) {
    return toast.loading(message, {
      style: {
        cursor: 'default',
      },
    });
  }

  static custom(message: string, options: {
    icon?: string;
    style?: React.CSSProperties;
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
  }) {
    return toast(message, {
      icon: options.icon,
      duration: options.duration || 4000,
      style: {
        cursor: 'pointer',
        ...options.style,
      },
    });
  }

  static tradeSuccess(symbol: string, action: 'BUY' | 'SELL', quantity: number, price: number, isIndex?: boolean) {
    const unit = isIndex ? 'units' : 'shares';
    const message = `${action} order executed! ${quantity} ${unit} of ${symbol} at ₹${price.toFixed(2)}`;
    
    return this.success(message, {
      duration: 6000,
      action: {
        label: 'View Portfolio',
        onClick: () => {
          // This could navigate to portfolio
          console.log('Navigate to portfolio');
        }
      }
    });
  }

  static tradeError(message: string, suggestion?: string) {
    const fullMessage = suggestion ? `${message}\n💡 ${suggestion}` : message;
    return this.error(fullMessage, {
      duration: 7000,
    });
  }

  static indexLotSizeError(symbol: string, lotSize: number, currentQuantity: number) {
    const suggestedQuantity = Math.ceil(currentQuantity / lotSize) * lotSize;
    const message = `${symbol} requires lot size of ${lotSize}. Try ${suggestedQuantity} units instead.`;
    
    return this.warning(message, {
      duration: 6000,
    });
  }

  static marketClosed() {
    return this.info('Market is currently closed. Orders will be queued for next session.', {
      duration: 5000,
    });
  }

  static insufficientBalance(required: number, available: number, isMargin?: boolean) {
    const type = isMargin ? 'margin' : 'balance';
    const message = `Insufficient ${type}! Required: ₹${required.toLocaleString()}, Available: ₹${available.toLocaleString()}`;
    
    return this.error(message, {
      duration: 6000,
    });
  }

  static dismiss(toastId?: string) {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }

  static dismissAll() {
    toast.dismiss();
  }
}

// Export individual functions for convenience
export const {
  success,
  error,
  info,
  warning,
  loading,
  custom,
  tradeSuccess,
  tradeError,
  indexLotSizeError,
  marketClosed,
  insufficientBalance,
  dismiss,
  dismissAll
} = NotificationService;
