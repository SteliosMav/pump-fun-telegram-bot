import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { MongooseModule } from "@nestjs/mongoose";
import { userSchema } from "./user.model";

@Module({
  providers: [UserService, UserRepository],
  imports: [
    MongooseModule.forFeature([{ name: "User", schema: userSchema }]), // Register User model
  ],
  exports: [UserService],
})
export class UserModule {}
