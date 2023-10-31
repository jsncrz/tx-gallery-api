import { Model, Document } from 'mongoose';
import { ICollation, QueryResult } from '../paginate/paginate';
import { ICharacterDoc } from '../character/character.interfaces';

export interface ITweet {
  tweetId: string;
  tags: Array<string>;
  user: string;
  url: string;
  likeCount: number;
  postDate: Date;
  characters: ICharacterDoc[];
}

export interface ITweetDoc extends ITweet, Document {}

export interface ITweetModel extends Model<ITweetDoc> {
  paginate(filter: Record<string, any>, options: Record<string, any>, collation?: ICollation): Promise<QueryResult>;
}
export type NewCreatedTweet = ITweet;
