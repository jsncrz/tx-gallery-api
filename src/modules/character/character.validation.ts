import Joi from 'joi';
import { NewCreatedCharacter } from './character.interfaces';

export const noValidation = {
  body: Joi.object().keys(),
};

const createCharacterBody: Record<keyof NewCreatedCharacter, any> = {
  name: Joi.string().required(),
  tlName: Joi.string().required(),
  group: Joi.string().required(),
  twitterLink: Joi.string().required(),
  pictureUrl: Joi.string().required(),
  tag: Joi.string().required(),
  limit: Joi.number().required(),
  minFaves: Joi.number().required(),
  isSyncing: Joi.boolean().allow(''),
  lastSynced: Joi.date().allow(''),
  debutDate: Joi.date().required(),
};

export const createCharacter = {
  body: Joi.object().keys(createCharacterBody),
};

export const getCharacters = {
  query: Joi.object().keys({
    group: Joi.string().allow(''),
    tlName: Joi.string().allow(''),
    sortBy: Joi.string(),
    projectBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const getCharactersByName = {
  query: Joi.object().keys({
    name: Joi.string().allow(''),
    group: Joi.string().allow(''),
  }),
};
