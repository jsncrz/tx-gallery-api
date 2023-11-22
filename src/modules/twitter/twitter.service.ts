/* eslint-disable no-restricted-syntax */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-await-in-loop */
import mongoose from 'mongoose';
import { Rettiwt } from 'rettiwt-api';
import { CursoredData } from 'rettiwt-api/dist/models/public/CursoredData';
import { Tweet as TwtObj } from 'rettiwt-api/dist/models/public/Tweet';
import config from '../../config/config';
import { ICharacterDoc } from '../character/character.interfaces';
import Character from '../character/character.model';
import { logger } from '../logger';
import { IOptions, QueryResult } from '../paginate/paginate';
import Tweet from './twitter.model';

const rtwtInstances: Rettiwt[] = [];
let tweetCounter = 0;
let tweetRetry = 0;

const initializeService = () => {
  const cookies: string[] = config.twitterCookies.replaceAll("'", '').split(',');
  cookies.forEach((cookie) => {
    rtwtInstances.push(new Rettiwt({ apiKey: cookie }));
  });
};

const getRetwittInstance = (): Rettiwt | undefined => {
  logger.info(`account#${tweetCounter}`);
  tweetCounter = tweetCounter < rtwtInstances.length - 1 ? (tweetCounter += 1) : 0;
  return rtwtInstances[tweetCounter];
};

initializeService();

const upsertTweet = async (tweetBody: any, character: ICharacterDoc) => {
  const tweet = await Tweet.findOne({ tweetId: tweetBody.tweetId });
  if (tweet != null) {
    if (tweet.characters.indexOf(character) !== -1) {
      tweet.characters.push(character);
    }
    tweet.likeCount = tweetBody.likeCount;
    tweet.tags = tweetBody.tags;
    return tweet.save();
  }
  return Tweet.create(tweetBody);
};

export const queryTweets = async (
  filter: Record<string, any>,
  options: IOptions,
  group?: string,
  tag?: string
): Promise<QueryResult> => {
  if (filter['characters'] == null && group != null && group !== '') {
    const characters = await Character.find({ group }, { tag: 1, otherTags: 1 });
    filter['characters'] = { $in: characters };
  } else if (filter['characters'] == null && tag != null) {
    const characters = await Character.find(
      {
        $or: [{ tag }, { otherTags: tag }],
      },
      { tag: 1, otherTags: 1 }
    );
    const characterTags = characters.map((character) => character.tag);
    const otherTags = characters.flatMap((character) => (character.otherTags != null ? character.otherTags : []));
    const allTags = [...characterTags, ...otherTags];
    filter['tags'] = { $in: allTags };
  }
  const tweets = await Tweet.paginate(filter, options);
  return tweets;
};

const initFromTweetResult = (tweetResult: TwtObj, character: ICharacterDoc) => ({
  tweetId: tweetResult.id,
  tags: tweetResult.entities.hashtags,
  user: tweetResult.tweetBy.userName,
  url: tweetResult.media[0]?.url,
  likeCount: tweetResult.likeCount,
  postDate: tweetResult.createdAt,
  characters: [character],
});

const createTweetFromSearch = async (tweetResult: TwtObj, character: ICharacterDoc) => {
  return upsertTweet(initFromTweetResult(tweetResult, character), character);
};

const getTweetsFromTwitterApi = async (query: string, nextCursor?: string) => {
  await new Promise((r) => setTimeout(r, 5000));
  let tweetBatch: CursoredData<TwtObj> | null = null;
  let tries = 0;
  while (tries < rtwtInstances.length && tweetRetry < 2) {
    try {
      tweetBatch = await getRetwittInstance()!.tweet.search({ hashtags: [query] }, 20, nextCursor);
      break;
    } catch (error) {
      logger.error(`Account #${tweetCounter} is rate limited.`);
    }
    tries += 1;
    if (tries === rtwtInstances.length) {
      tries = 0;
      tweetRetry += 1;
      logger.error(`All account limited. Sleeping for 15 mins`);
      await new Promise((r) => setTimeout(r, 1000 * 60 * 15));
    }
  }
  return tweetBatch;
};

const syncTweet = async (id: mongoose.Types.ObjectId, minFaves?: number, sinceDate?: string, untilDate?: string) => {
  const character: ICharacterDoc | null = await Character.findByIdAndUpdate(id, {
    isSyncing: true,
    lastSynced: new Date(),
  }).exec();
  const since = sinceDate != null ? ` since:${sinceDate}` : '';
  const until = untilDate != null ? ` until:${untilDate}` : '';
  if (character == null) {
    return;
  }
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
      await createTweetFromSearch(tweetObj, character);
    }
    i += 1;
    nextCursor = tweetBatch.next.value;
    if (nextCursor == null || tweetBatch.list.length < 20) {
      break;
    }
  } while (nextCursor !== undefined);
  await Character.findByIdAndUpdate(id, { isSyncing: false }).exec();
};

export const syncCharactersTweets = async () => {
  tweetRetry = 0;
  const since = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 5);
  const syncDate = new Date(new Date().getTime() - 6400000);
  const characters = await Character.find(
    { lastSynced: { $lt: syncDate }, isSyncing: false },
    { tag: 1, group: 1, _id: 1, lastSynced: 1, debutDate: 1, minFaves: 1 }
  );
  const minFaves = [2000, 1000, 500, 100, 50];
  for (const character of characters) {
    if (tweetRetry === 2) {
      logger.error('Too many retries. Stopping sync!');
      break;
    }
    logger.info(`Crawling: ${character.tag}`);
    for (let i = 0; i < minFaves.length; i += 1) {
      if (minFaves[i]! < character.minFaves) {
        break;
      }
      await syncTweet(character._id, minFaves[i], `${since.getFullYear()}-${since.getMonth() + 1}-${since.getDate()}`);
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
  const minFaves = [5000, 2000, 1000, 500, 100];
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
          minFaves[i],
          `${since.getFullYear()}-${since.getMonth() + 1}-${since.getDate()}`,
          `${until.getFullYear()}-${until.getMonth() + 1}-${until.getDate()}`
        );
      }
    }
    until.setMonth(until.getMonth() - 2);
    until.setDate(until.getDate() + 1);
    since.setMonth(since.getMonth() - 2);
  }
  logger.info(`finished syncing ${character.tlName} tweets`);
};

export const fixTags = async () => {
  const characters = await Character.find({}, { tlName: 1, _id: 1, tag: 1, otherTags: 1 });
  for (const character of characters) {
    const tags = [character.tag];
    if (character.otherTags != null) {
      tags.push(...character.otherTags);
    }
    logger.info(`processing ${character.tlName}`);
    await Tweet.updateMany({ tags: { $in: tags } }, { $push: { characters: character._id } });
    logger.info(`finished processing ${character.tlName}`);
  }
  logger.info(`finished fixing tags`);
};

export const recheckTweet = async () => {
  const dateUpperLimit = new Date();
  const dateLowerLimit = new Date();
  dateLowerLimit.setDate(dateLowerLimit.getDate() - 3);
  dateUpperLimit.setDate(dateUpperLimit.getDate() - 1);
  const tweets = await Tweet.find(
    { postDate: { $gt: dateLowerLimit, $lt: dateUpperLimit } },
    { postDate: 1, tweetId: 1, likeCount: 1 }
  );
  const rettiwt = new Rettiwt();
  for (const tweet of tweets) {
    const tweetObject = await rettiwt.tweet.details(tweet.tweetId);
    if (tweetObject != null) {
      tweet.likeCount = tweetObject.likeCount;
      tweet.save();
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
};
