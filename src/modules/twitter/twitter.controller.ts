import httpStatus from 'http-status';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import * as twitterService from './twitter.service';
import { catchAsync, pick } from '../utils';
import { IOptions } from '../paginate/paginate';

// TODO: Add body to include tweet link and character id
export const createTweet = catchAsync(async (_req: Request, res: Response) => {
  res.status(httpStatus.CREATED);
});

export const getTweets = catchAsync(async (req: Request, res: Response) => {
  let group: string | undefined;
  const filter = pick(req.query, [], [], ['characters']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
  if (req.query && req.query['group']) {
    group = req.query['group'].toString();
  }
  const result = await twitterService.queryTweets(
    filter,
    options,
    group,
    req.query && req.query['tags'] ? req.query['tags'].toString() : undefined
  );
  res.send(result);
});

export const syncCharactersTweets = catchAsync(async (_req: Request, res: Response) => {
  const tweets = await twitterService.syncCharactersTweets();
  res.send(tweets);
});

export const deepSyncTweet = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['characterId'] === 'string') {
    const tweet = await twitterService.deepSyncTweet(new mongoose.Types.ObjectId(req.params['characterId']));
    res.send(tweet);
  }
});

export const fixTags = catchAsync(async (_req: Request, res: Response) => {
  await twitterService.fixTags();
  res.sendStatus(httpStatus.OK);
});
