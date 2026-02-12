import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  use(req: any, res: any, next: () => void) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    this.logger.log(`Incoming Request:${method} ${originalUrl} - IP ${ip} - User-Agent ${userAgent}`);

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const duration = Date.now() - startTime;
      this.logger.log(`Outgoing Response:${method} ${originalUrl} - Status ${statusCode} - Content-Length 
        ${contentLength} - Response-Time ${duration}ms`);
      if (statusCode >= 400) {
        this.logger.error(`Error Response:${method} ${originalUrl} - Status ${statusCode} - Content-Length 
            ${contentLength} - Response-Time ${duration}ms`);
      }
    });
    res.on('error', (err) => {
      this.logger.error(`Error Response:${method} ${originalUrl} - Error ${err.message}`);
    });
    res.on('timeout', () => {
      this.logger.warn(`Timeout Response:${method} ${originalUrl} - ${Date.now()}`);
    });
    next();
  }
}
