/* eslint-disable no-restricted-syntax */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-await-in-loop */
import { CursoredData, Rettiwt, Tweet as TwtObj } from 'rettiwt-api';
import mongoose from 'mongoose';
import config from '../../config/config';
import { logger } from '../logger';
import Tweet from './twitter.model';
import { IOptions, QueryResult } from '../paginate/paginate';
import Character from '../character/character.model';

let rettiwt: Rettiwt;
const rtwtInstances: Rettiwt[] = [];
let tweetCounter = 0;

let noAccountValid = false;

const initializeService = () => {
  const cookies: string[] = config.twitterCookies.replaceAll("'", '').split(',');
  cookies.forEach((cookie) => {
    rtwtInstances.push(new Rettiwt(cookie));
  });
};

const getRetwittInstance = (): Rettiwt | undefined => {
  logger.info(`account#${tweetCounter}`);
  tweetCounter = tweetCounter < rtwtInstances.length - 1 ? (tweetCounter += 1) : 0;
  return rtwtInstances[tweetCounter];
};

initializeService();

export const searchTwitterByFilter = async (hashtag: string) => {
  return rettiwt.tweet
    .search({
      hashtags: [hashtag],
    })
    .then((data: CursoredData<TwtObj>) => {
      logger.info(JSON.stringify(data));
      return data;
    })
    .catch((err: Error) => {
      logger.error(err);
      logger.error(JSON.stringify(err));
      return err;
    });
};

export const createTweet = async (tweetBody: any) => {
  return Tweet.findOneAndUpdate({ tweetId: tweetBody.tweetId }, tweetBody, {
    new: true,
    upsert: true,
  });
};

export const queryTweets = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult> => {
  const users = await Tweet.paginate(filter, options);
  return users;
};

const initFromTweetResult = (tweetResult: TwtObj) => ({
  tweetId: tweetResult.id,
  tags: tweetResult.entities.hashtags,
  user: tweetResult.tweetBy.userName,
  url: tweetResult.media[0]?.url,
  likeCount: tweetResult.likeCount,
  postDate: tweetResult.createdAt,
});

const createTweetFromSearch = async (tweetResult: TwtObj) => {
  return createTweet(initFromTweetResult(tweetResult));
};

const getTweetsFromTwitterApi = async (query: string, nextCursor?: string) => {
  await new Promise((r) => setTimeout(r, 3000));
  let tweetBatch: CursoredData<TwtObj> | null = null;
  let tries = 0;
  while (tries < rtwtInstances.length) {
    try {
      tweetBatch = await getRetwittInstance()!.tweet.search({ hashtags: [query] }, 20, nextCursor);
      break;
    } catch (error) {
      logger.error(error);
      logger.error(`account#${tweetCounter} is rate limited`);
    }
    tries += 1;
  }
  return tweetBatch;
};

const sinceDate = '2020-11-02';
const untilDate = '2020-12-01';
export const syncTweet = async (id: mongoose.Types.ObjectId, limit?: number, minFaves?: number) => {
  const character = await Character.findByIdAndUpdate(id, { isSyncing: true, lastSynced: new Date() }).exec();
  if (character == null) {
    throw new Error();
  } else {
    let nextCursor: string | undefined;
    let i = 0;
    let repeatedTweet = 0;
    const query = `${character.tag} min_faves:${
      minFaves !== undefined ? minFaves : character.minFaves
    } filter:images since:${sinceDate} until:${untilDate}`;
    let prevCursor = null;
    do {
      const tweetBatch = await getTweetsFromTwitterApi(query, nextCursor);
      repeatedTweet = 0;
      if (prevCursor === nextCursor) {
        break;
      }
      prevCursor = nextCursor;
      if (tweetBatch == null) {
        noAccountValid = true;
        logger.error('Ran out of accounts to crawl!');
        return;
      }
      logger.info(`finding tag: ${character.tag} page: ${i}`);
      logger.info(tweetBatch.list.length);
      for await (const tweetObj of tweetBatch.list) {
        const oldTweet = await Tweet.findOne({ tweetId: tweetObj?.id }, { _id: 1 });
        repeatedTweet = oldTweet != null ? (repeatedTweet += 1) : (repeatedTweet = 0);
        if (repeatedTweet === 5) {
          logger.info('Repeated tweets are 5');
          break;
        }
        await createTweetFromSearch(tweetObj);
      }
      if (repeatedTweet === 5) {
        break;
      }
      i += 1;
      nextCursor = tweetBatch.next.value;
      logger.info(tweetBatch.list.length);
      if (nextCursor == null || tweetBatch.list.length < 20) {
        break;
      }
    } while (nextCursor !== undefined && i < (limit !== undefined ? limit : character.limit));
    logger.info(`Finished crawling: ${character.tag}`);
  }
  Character.findByIdAndUpdate(id, { isSyncing: false }).exec();
};

export const syncAllTweets = async () => {
  logger.info('Syncing all tweets');
  if (noAccountValid) {
    logger.info('No accounts are valid');
    return;
  }
  const characters = await Character.find({}, { _id: 1, lastSynced: 1, debutDate: 1 });
  for (const character of characters) {
    // if (
    //   character.lastSynced == null ||
    //   (character.lastSynced != null && new Date().getTime() - character.lastSynced.getTime() > 86400000 / 24)
    // ) {
    if (new Date(untilDate).getTime() > character.debutDate!.getTime()) await syncTweet(character._id);
    // }
    if (noAccountValid) {
      break;
    }
  }
  logger.info('finished syncing all tweets');
};

export const deleteTweetFromTag = async (hashtag: string) => {
  const tweets = await Tweet.deleteMany({ tags: hashtag });
  return tweets;
};
