"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const platform_fastify_1 = require("@nestjs/platform-fastify");
async function bootstrap() {
    var _a;
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter({ logger: true }));
    app.setGlobalPrefix("api");
    /*
      // Swagger
      const cfg = new DocumentBuilder()
        .setTitle("AI Fashion Studio – Gateway")
        .setVersion("0.1.0")
        .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT" })
        .build();
      const doc = SwaggerModule.createDocument(app, cfg);
      SwaggerModule.setup("/api/docs", app, doc);
      app
        .getHttpAdapter()
        .getInstance()
        .get("/api/docs-json", (_req, res) => res.send(doc));
    
        */
    await app.listen((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000, "0.0.0.0");
}
bootstrap();
//# sourceMappingURL=main.js.map