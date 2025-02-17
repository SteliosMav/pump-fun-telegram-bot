import { Module } from "@nestjs/common";
import { UserModule } from "../../core/user";
import { AdminUpdate } from "./admin.update";
import { AdminService } from "./admin.service";
import { RenderAdminScene } from "./render-admin.scene";
import { AdminViewService } from "./admin-view.service";
import { CryptoModule } from "../../core/crypto";
import { DecryptPrivateKeyScene } from "./scenes/decrypt-private-key/decrypt-private-key.scene";

@Module({
  providers: [
    // Update
    AdminUpdate,

    // Scenes
    RenderAdminScene,
    DecryptPrivateKeyScene,

    // Services
    AdminService,
    AdminViewService,
  ],
  imports: [CryptoModule, UserModule],
})
export class AdminModule {}
