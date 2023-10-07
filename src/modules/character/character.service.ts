import { IOptions, QueryResult } from '../paginate/paginate';
import Character from './character.model';

export const getCharacters = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult> => {
  const characters = await Character.paginate(filter, options);
  return characters;
};

export const getTagsByName = async (name: string) => {
  const tags = await Character.find({ tlName: { $regex: name, $options: 'i' } }, { name: 1, tlName: 1, tag: 1 });
  return tags;
};

export const createCharacter = async (characterBody: any) => {
  return Character.findOneAndUpdate({ name: characterBody.name }, characterBody, {
    new: true,
    upsert: true,
  });
};

export const updateAllLimits = async (group: string, limit: number) => {
  const tweets = await Character.updateMany({ group }, { limit });
  return tweets;
};

export const updateAllMinFaves = async (group: string, minFaves: number) => {
  const tweets = await Character.updateMany({ group }, { minFaves });
  return tweets;
};
