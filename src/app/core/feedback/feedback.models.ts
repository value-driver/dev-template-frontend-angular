export type ToastType = 'success' | 'info' | 'warning' | 'error' | 'loading';

export interface ToastOptions {
  readonly duration?: number;
  readonly pauseOnHover?: boolean;
  readonly animate?: boolean;
}

export interface DialogOptions {
  readonly title: string;
  readonly content?: string;
  readonly okText?: string;
  readonly cancelText?: string;
  readonly okType?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  readonly okDanger?: boolean;
  readonly width?: string | number;
  readonly maskClosable?: boolean;
  readonly centered?: boolean;
}

export interface ConfirmOptions extends DialogOptions {
  readonly confirmType?: 'confirm' | 'info' | 'success' | 'error' | 'warning';
}
