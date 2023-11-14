import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema()
export class Device {
  @Prop({
    required: true,
  })
  ip: string;

  @Prop({
    required: true,
  })
  title: string;

  @Prop({
    required: true,
  })
  lastActiveDate: string;

  @Prop({
    required: true,
  })
  deviceId: string;

  @Prop({
    required: true,
  })
  userId: string;

  setIp(ip: string) {
    this.ip = ip;
  }

  setTitle(title: string) {
    this.title = title;
  }

  setDeviceId() {
    this.deviceId = uuidv4();
  }

  setLastActiveDate() {
    this.lastActiveDate = new Date().toISOString();
  }

  setUserId(userId: string) {
    this.userId = userId;
  }
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

DeviceSchema.methods = {
  setIp: Device.prototype.setIp,
  setTitle: Device.prototype.setTitle,
  setDeviceId: Device.prototype.setDeviceId,
  setLastActiveDate: Device.prototype.setLastActiveDate,
  setUserId: Device.prototype.setUserId,
};

export type DeviceDocument = HydratedDocument<Device>;
