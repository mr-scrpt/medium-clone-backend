import { HttpException, Injectable } from '@nestjs/common';

@Injectable()
export class ErrorHandlerService {
  constructor() {
    this.errorCount = 0;
  }
  errorObject = {
    errors: {},
  };
  errorCount: number;

  errorHandler(field, message) {
    this.errorCount++;
    this.errorObject.errors[field] = message;
  }

  checkError(status) {
    if (this.errorCount > 0) {
      throw new HttpException(this.errorObject, status);
    }
  }
}
