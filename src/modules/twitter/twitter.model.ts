import mongoose from 'mongoose';
import toJSON from '../toJSON/toJSON';
import paginate from '../paginate/paginate';
import { ITweetDoc, ITweetModel } from './twitter.interfaces';

const tweetSchema = new mongoose.Schema<ITweetDoc, ITweetModel>(
  {
    tweetId: {
      type: String,
      unique: true,
      required: true,
    },
    tags: [
      {
        type: String,
        required: true,
      },
    ],
    user: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    likeCount: {
      type: Number,
      required: true,
    },
    postDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
tweetSchema.plugin(toJSON);
tweetSchema.plugin(paginate);

const Tweet = mongoose.model<ITweetDoc, ITweetModel>('Tweet', tweetSchema);

export default Tweet;
