import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [

    ConfigModule,

    TypeOrmModule.forFeature([ User ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: ( configService: ConfigService ) => {

        // console.log(configService.get('JWT_SECRET'), process.env.JWT_SECRET);
        
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: "2h"
          }
        }
      } // cuando se intente registrar el modulo async
    })

    // JwtModule.register({
    //   secret: "312312",
    //   signOptions: {
    //     expiresIn: process.env.JWT_SECRET
    //   }
    // })
  ], 
  exports: [ TypeOrmModule, JwtStrategy, PassportModule, JwtModule ]
})
export class AuthModule {}
