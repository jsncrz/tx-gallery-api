import httpStatus from 'http-status';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import * as twitterService from './twitter.service';
import { catchAsync, pick } from '../utils';
import { IOptions } from '../paginate/paginate';

export const searchTwitter = catchAsync(async (req: Request, res: Response) => {
  const tweet = await twitterService.searchTwitterByFilter(req.body.hashtag);
  res.status(httpStatus.OK).send(JSON.stringify(tweet));
});

export const createTweet = catchAsync(async (req: Request, res: Response) => {
  const tweet = await twitterService.createTweet(req.body);
  res.status(httpStatus.CREATED).send(tweet);
});

export const getTweets = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['tags']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
  const result = await twitterService.queryTweets(filter, options);
  res.send(result);
});

export const syncTweet = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['characterId'] === 'string') {
    const tweet = await twitterService.syncTweet(new mongoose.Types.ObjectId(req.params['characterId']), 10, 3000);
    res.send(tweet);
  }
});

export const syncAllTweets = catchAsync(async (_req: Request, res: Response) => {
  const tweets = await twitterService.syncAllTweets();
  res.send(tweets);
});

export const deleteTweetFromTag = catchAsync(async (req: Request, res: Response) => {
  const tweet = await twitterService.deleteTweetFromTag(req.body.hashtag);
  res.status(httpStatus.OK).send(JSON.stringify(tweet));
});
