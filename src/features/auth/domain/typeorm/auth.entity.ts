import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class BlackListRefreshToken {

    @PrimaryGeneratedColumn('uuid')
    Id: string

    @Column()
    refreshToken: string
}