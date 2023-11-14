import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth, AuthDocument } from '@auth/domain/mongoose/auth.schema';

@Injectable()
export class AuthRepository {
  constructor(@InjectModel(Auth.name) private authModel: Model<AuthDocument>) {}

  async postRefreshToken(token: {
    refreshToken: string;
  }): Promise<AuthDocument> {
    return new this.authModel(token);
  }

  async save(token: AuthDocument) {
    return await token.save();
  }
}
