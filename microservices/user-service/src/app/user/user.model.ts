import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { hashSync } from 'bcryptjs';

@Schema()
export class User {
  id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: User.name })
  blocks: User[];
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ username: 1 }, { unique: true });

export function preSave(next: any) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = hashSync(this.password, 12);
  next();
}
