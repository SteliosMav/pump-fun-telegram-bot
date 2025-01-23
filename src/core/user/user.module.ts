import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { MongooseModule } from "@nestjs/mongoose";
import { createUserSchema } from "./user.model";
import { CryptoModule, CryptoService } from "../crypto";

@Module({
  providers: [UserService, UserRepository],
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: "User",
        imports: [CryptoModule],
        inject: [CryptoService],
        useFactory: (cryptoService: CryptoService) =>
          createUserSchema(cryptoService),
      },
    ]),
  ],
  exports: [UserService],
})
export class UserModule {}
