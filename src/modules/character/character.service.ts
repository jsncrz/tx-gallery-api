import { IOptions, QueryResult } from '../paginate/paginate';
import escapeRegex from '../utils/escapeRegex';
import Character from './character.model';

export const getCharacters = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult> => {
  const characters = await Character.paginate(filter, options);
  return characters;
};

export const getCharactersByName = async (name: string, group: string) => {
  const tags = await Character.find(
    {
      $or: [
        { name: { $regex: escapeRegex(name), $options: 'i' } },
        { tlName: { $regex: escapeRegex(name), $options: 'i' } },
      ],
      group: { $regex: group, $options: 'i' },
    },
    { name: 1, tlName: 1, tag: 1, group: 1 }
  );
  return tags;
};

export const createCharacter = async (characterBody: any) => {
  return Character.findOneAndUpdate({ name: characterBody.name }, characterBody, {
    new: true,
    upsert: true,
  });
};

export const updateAllLimits = async (group: string, limit: number) => {
  const characters = await Character.updateMany({ group }, { limit });
  return characters;
};

export const updateAllMinFaves = async (group: string, minFaves: number) => {
  const characters = await Character.updateMany({ group }, { minFaves });
  return characters;
};
