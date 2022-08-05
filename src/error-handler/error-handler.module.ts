import { ErrorHandlerService } from '@app/error-handler/error-handler.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [ErrorHandlerService],
})
export class ErrorHandlerModule {}
