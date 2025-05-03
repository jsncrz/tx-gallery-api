import { Model, Document, Types } from 'mongoose';
import { QueryResult } from '../paginate/paginate';

export interface ICharacter {
  name: string;
  tlName: string;
  twitterLink: string;
  pictureUrl: string;
  tag: string;
  otherTags?: Array<string>;
  group: string;
  limit: number;
  minFaves: number;
  isSyncing?: boolean;
  lastSynced?: Date;
  debutDate: Date;
}

export interface ICharacterDoc extends ICharacter, Document<Types.ObjectId> {}

export interface ICharacterModel extends Model<ICharacterDoc> {
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}
export type NewCreatedCharacter = ICharacter;
