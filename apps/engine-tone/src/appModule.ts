// src/appModule.ts

import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/module';
import { CatalogModule } from './modules/catalog/module';
import { ToneModule } from './modules/tone/module';

@Module({
  imports: [AuthModule, CatalogModule, ToneModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
