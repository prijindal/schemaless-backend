import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import os from "os";
import { Get, Route, Tags } from "tsoa";
import { CacheService } from "../../cache";
import { TypeOrmConnection } from "../../db/typeorm";

@Tags("health")
@Route()
@provide(HealthController)
export class HealthController {
  constructor(
    @inject(TypeOrmConnection) private typeOrmConnection: TypeOrmConnection,
    @inject(CacheService) private cacheService: CacheService,
  ) { }

  @Get("/health")
  getHealth() {
    return {
      healthy: true,
    };
  }

  @Get("/cumulative/health")
  async getCumulativeHealth() {
    const db = this.typeOrmConnection.getInstance();
    const cacheHealth = await this.cacheService.health();
    return {
      healthy: true,
      db: db != null ? db.isInitialized : false,
      cache: cacheHealth,
      os: {
        hostname: os.hostname(),
        uptime: os.uptime(),
        time: Date.now(),
      },
      env: {
        "PORT": process.env.PORT,
        "HOST": process.env.HOST,
        "AUTO_MIGRATION": process.env.AUTO_MIGRATION,
        "LOG_LEVEL": process.env.LOG_LEVEL,
        "REQUEST_TRACING": process.env.REQUEST_TRACING,
        "LOG_FORMATTER": process.env.LOG_FORMATTER,
      } as Record<string, string | undefined>,
    };
  }
}
