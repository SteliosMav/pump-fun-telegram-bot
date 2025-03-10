import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import { Configuration } from "../../shared/config";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configuration, true>) => ({
        uri: configService.get<Configuration["MONGO_URI"]>("MONGO_URI"),
        autoIndex:
          configService.get<Configuration["ENV"]>("ENV") === "production"
            ? false
            : true,
      }),
    }),
  ],
})
export class DatabaseModule {}
