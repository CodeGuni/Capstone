import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true })
  );
  app.setGlobalPrefix("api");
  await app.register((await import("@fastify/cors")).default, {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    maxAge: 86400,
  });

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

  await app.listen(process.env.PORT ?? 3000, "0.0.0.0");
}
bootstrap();
