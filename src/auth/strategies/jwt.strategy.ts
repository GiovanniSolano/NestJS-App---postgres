import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from '../entities/user.entity';
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {

    constructor(
        @InjectRepository( User )
        private readonly userRepository: Repository<User>,
        configService: ConfigService
    ) {

        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        });

    }

    // Se ejecuta cuando el jwt ya fue validado (no ha expirdado y es valido, coincide con la firma)
    async validate( payload: JwtPayload ): Promise<User> {

        const { id } = payload;

        const user = await this.userRepository.findOneBy( { id });

        if ( !user )
            throw new UnauthorizedException('Token not valid');

        if ( !user.isActive )
            throw new UnauthorizedException('User is inactive');

        // Se agrega al request
        return user;

    }

}