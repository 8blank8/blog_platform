import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../domain/mongoose/user.schema';
import { Model } from 'mongoose';
import { UserCreateType } from '../../models/user.create.type';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(user: UserCreateType): Promise<UserDocument> {
    return new this.userModel(user);
  }

  async deleteUser(id: string) {
    const res = await this.userModel.deleteOne({ id: id });
    return res.deletedCount === 1;
  }

  async save(user: UserDocument) {
    return user.save();
  }

  async deleteAllData() {
    return this.userModel.deleteMany({});
  }
}
