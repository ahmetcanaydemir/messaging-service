import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Message {
  id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  sender: string;

  @Prop({ required: true })
  receiver: string;

  @Prop({ required: true })
  message: string;
}

export type MessageDocument = Message & Document;

export const MessageSchema = SchemaFactory.createForClass(Message);
