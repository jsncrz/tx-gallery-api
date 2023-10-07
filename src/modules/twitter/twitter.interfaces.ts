import { Model, Document } from 'mongoose';
import { QueryResult } from '../paginate/paginate';

export interface ITweet {
  tweetId: string;
  tags: Array<string>;
  user: string;
  url: string;
  likeCount: number;
  postDate: Date;
}

export interface ITweetDoc extends ITweet, Document {}

export interface ITweetModel extends Model<ITweetDoc> {
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}
export type NewCreatedTweet = ITweet;
