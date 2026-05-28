import { Module } from "@nestjs/common";
import { AiModule } from "./modules/ai/ai.module.js";
import { AssetsModule } from "./modules/assets/assets.module.js";
import { ExportsModule } from "./modules/exports/exports.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { NbxpModule } from "./modules/nbxp/nbxp.module.js";
import { NotebooksModule } from "./modules/notebooks/notebooks.module.js";
import { PresentationsModule } from "./modules/presentations/presentations.module.js";
import { ProjectsModule } from "./modules/projects/projects.module.js";
import { SharingModule } from "./modules/sharing/sharing.module.js";
import { SlidesModule } from "./modules/slides/slides.module.js";
import { StorageModule } from "./modules/storage/storage.module.js";
import { ThemesModule } from "./modules/themes/themes.module.js";

@Module({
  imports: [
    HealthModule,
    ProjectsModule,
    NotebooksModule,
    PresentationsModule,
    SlidesModule,
    AssetsModule,
    ThemesModule,
    ExportsModule,
    NbxpModule,
    AiModule,
    SharingModule,
    StorageModule,
  ],
})
export class AppModule {}
