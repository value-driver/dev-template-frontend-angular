export interface AppError {
  code: string;
  message: string;
  status?: number;
  correlationId?: string;
  details?: unknown;
}

export class ApplicationError extends Error {
  constructor(readonly appError: AppError) {
    super(appError.message);
    this.name = 'ApplicationError';
  }
}
