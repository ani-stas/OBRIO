import { HttpStatus } from '@nestjs/common';

export const forbiddenErrorCheck = (error: unknown): boolean => {
  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    error.status === HttpStatus.FORBIDDEN
  ) {
    return true;
  }

  return false;
};
