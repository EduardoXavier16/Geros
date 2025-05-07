import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entities/user.entity';
import { WorkOrder } from './work-orders/entities/work-order.entity';
import { WorkOrdersModule } from './work-orders/work-orders.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQLHOST,
      port: parseInt(process.env.MYSQLPORT || '3306'),
      username: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQL_DATABASE,
      entities: [User, WorkOrder],
      synchronize: false,
      logging: false,
      ssl: { rejectUnauthorized: false },
    }),
    AuthModule,
    WorkOrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
