import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { createServer } from 'net';
import { AppModule } from './app.module';

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer()
      .listen(port, () => {
        server.close();
        resolve(true);
      })
      .on('error', () => {
        resolve(false);
      });
  });
}

async function findAvailablePort(startPort: number): Promise<number> {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
    if (port > startPort + 100) {
      throw new Error('Não foi possível encontrar uma porta disponível');
    }
  }
  return port;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração do prefixo global da API
  app.setGlobalPrefix('api');

  // Configuração de CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Configuração do Swagger (apenas em desenvolvimento)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('GEROS API')
      .setDescription('Documentação da API do GEROS')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Configurações básicas de segurança
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  const desiredPort = parseInt(process.env.PORT ?? '3000', 10);
  const port = await findAvailablePort(desiredPort);

  await app.listen(port);
  console.log(
    `Servidor iniciado na porta ${port} em modo ${process.env.NODE_ENV}`,
  );
}

bootstrap();
