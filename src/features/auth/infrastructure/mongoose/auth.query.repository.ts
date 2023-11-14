import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth, AuthDocument } from '@auth/domain/mongoose/auth.schema';

@Injectable()
export class AuthQueryRepository {
  constructor(@InjectModel(Auth.name) private authModel: Model<AuthDocument>) {}

  async findRefreshToken(refreshToken: string): Promise<AuthDocument | null> {
    const token = await this.authModel.findOne({ refreshToken: refreshToken });
    return token;
  }
}
