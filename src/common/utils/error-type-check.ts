import { HttpStatus } from '@nestjs/common';

export const errorTypeCheck = (error: unknown, status: HttpStatus): boolean => {
  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    error.status === status
  ) {
    return true;
  }

  return false;
};
