import Joi from 'joi';
import { NewCreatedTweet } from './twitter.interfaces';
import { objectId } from '../validate';

const createTweetBody: Record<keyof NewCreatedTweet, any> = {
  tweetId: Joi.string().required(),
  tags: Joi.array().required(),
  user: Joi.string().required(),
  url: Joi.string().required(),
  likeCount: Joi.number().required(),
  postDate: Joi.date().required(),
};

export const noValidation = {
  body: Joi.object().keys(),
};

export const createTweet = {
  body: Joi.object().keys(createTweetBody),
};

export const getTweets = {
  query: Joi.object().keys({
    tags: Joi.string().allow(''),
    group: Joi.string().allow(''),
    sortBy: Joi.string(),
    projectBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const syncTweet = {
  params: Joi.object().keys({
    characterId: Joi.string().custom(objectId),
  }),
};
