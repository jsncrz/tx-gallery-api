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
  await new Promise((r) => setTimeout(r, 5000));
  let tweetBatch: CursoredData<TwtObj> | null = null;
  let tries = 0;
  while (tries < rtwtInstances.length) {
    try {
      tweetBatch = await getRetwittInstance()!.tweet.search({ hashtags: [query] }, 20, nextCursor);
      break;
    } catch (error) {
      logger.error(`account#${tweetCounter} is rate limited`);
    }
    tries += 1;
    if (tries === rtwtInstances.length) {
      logger.error(`All account limited. Sleeping for 10 mins`);
      await new Promise((r) => setTimeout(r, 1000 * 60 * 10));
      tries = 0;
    }
  }
  return tweetBatch;
};

const syncTweet = async (
  id: mongoose.Types.ObjectId,
  limit?: number,
  minFaves?: number,
  sinceDate?: string,
  untilDate?: string
) => {
  const character = await Character.findByIdAndUpdate(id, { isSyncing: true, lastSynced: new Date() }).exec();
  const since = sinceDate != null ? ` since:${sinceDate}` : '';
  const until = untilDate != null ? ` until:${untilDate}` : '';
  if (character == null) {
    throw new Error();
  } else {
    let nextCursor: string | undefined;
    let i = 0;
    const query = `${character.tag} min_faves:${
      minFaves !== undefined ? minFaves : character.minFaves
    } filter:images${since}${until}`;
    let prevCursor = null;
    do {
      const tweetBatch = await getTweetsFromTwitterApi(query, nextCursor);
      if (prevCursor === nextCursor) {
        break;
      }
      prevCursor = nextCursor;
      if (tweetBatch == null) {
        return;
      }
      logger.info(`finding tag: ${character.tag} page: ${i} size: ${tweetBatch.list.length}`);
      for await (const tweetObj of tweetBatch.list) {
        await createTweetFromSearch(tweetObj);
      }
      i += 1;
      nextCursor = tweetBatch.next.value;
      if (nextCursor == null || tweetBatch.list.length < 20) {
        break;
      }
    } while (nextCursor !== undefined && i < (limit !== undefined ? limit : character.limit));
  }
  Character.findByIdAndUpdate(id, { isSyncing: false }).exec();
};

export const syncAllTweets = async () => {
  const since = new Date(new Date().getTime() - 259200000);
  const syncDate = new Date(new Date().getTime() - 6400000);
  const characters = await Character.find(
    { lastSynced: { $lt: syncDate } },
    { tag: 1, group: 1, _id: 1, lastSynced: 1, debutDate: 1, minFaves: 1 }
  );
  const minFaves = [5000, 2000, 1000, 500, 200, 100];
  for (const character of characters) {
    logger.info(`Crawling: ${character.tag}`);
    for (let i = 0; i < minFaves.length; i += 1) {
      if (minFaves[i]! < character.minFaves) {
        break;
      }
      await syncTweet(character._id, 15, minFaves[i], `${since.getFullYear()}-${since.getMonth() + 1}-${since.getDate()}`);
    }
    logger.info(`Finished crawling: ${character.tag}`);
  }
  logger.info('finished syncing all tweets');
};

export const deepSyncTweet = async (id: mongoose.Types.ObjectId) => {
  const until = new Date();
  const since = new Date();
  since.setMonth(until.getMonth() - 2);
  const character = await Character.findById(id);
  if (character == null) {
    throw new Error();
  }
  const minFaves = [5000, 2000, 1000, 500, 200, 100];
  while (since.getTime() > character.debutDate!.getTime() - 1000 * 60 * 60 * 24 * 60) {
    logger.info(
      `Since: ${since.getFullYear()}-${since.getMonth() + 1}-${since.getDate()} until: ${until.getFullYear()}-${
        until.getMonth() + 1
      }-${until.getDate()}`
    );
    for (let i = 0; i < minFaves.length; i += 1) {
      logger.info(`Minimum Faves is ${minFaves[i]}`);
      if (minFaves[i]! >= character.minFaves) {
        await syncTweet(
          character._id,
          10,
          minFaves[i],
          `${since.getFullYear()}-${since.getMonth() + 1}-${since.getDate()}`,
          `${until.getFullYear()}-${until.getMonth() + 1}-${until.getDate()}`
        );
      }
    }
    until.setMonth(until.getMonth() - 2);
    since.setMonth(since.getMonth() - 2);
  }
  logger.info(`finished syncing ${character.tlName} tweets`);
};

export const deleteVideos = async () => {
  await Tweet.deleteMany({ url: { $regex: /video/, $options: 'i' } });
};
