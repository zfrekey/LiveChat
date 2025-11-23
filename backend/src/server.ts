import Fastify from "fastify";
import cors from "@fastify/cors";
import { setupSocketIO } from "./socket";

const PORT = 3001;

export async function buildServer() {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(cors, {
    origin: "http://localhost:5173",
  });

  setupSocketIO(fastify);

  fastify.get("/health", async () => ({ status: "ok" }));

  return fastify;
}

async function start() {
  try {
    const fastify = await buildServer();
    await fastify.listen({ port: PORT, host: "0.0.0.0" });
    fastify.log.info(`Servidor rodando em http://localhost:${PORT}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();