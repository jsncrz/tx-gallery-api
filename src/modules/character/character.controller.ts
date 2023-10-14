import httpStatus from 'http-status';
import { Request, Response } from 'express';
import * as characterService from './character.service';
import { catchAsync, pick } from '../utils';
import { IOptions } from '../paginate/paginate';

export const getCharacters = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['group'], ['tlName']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
  const result = await characterService.getCharacters(filter, options);
  res.status(httpStatus.OK).send(JSON.stringify(result));
});

export const getCharactersByName = catchAsync(async (req: Request, res: Response) => {
  let name = '';
  let group = '';
  if (req.query && req.query['name']) {
    name = req.query['name'].toString();
  }
  if (req.query && req.query['group']) {
    group = req.query['group'].toString();
  }
  const result = await characterService.getCharactersByName(name, group);
  res.status(httpStatus.OK).send(JSON.stringify(result));
});

export const createCharacter = catchAsync(async (req: Request, res: Response) => {
  const character = await characterService.createCharacter(req.body);
  res.status(httpStatus.CREATED).send(character);
});

export const updateAllLimits = catchAsync(async (req: Request, res: Response) => {
  const tweet = await characterService.updateAllLimits(req.body.group, req.body.limit);
  res.status(httpStatus.OK).send(tweet);
});

export const updateAllMinFaves = catchAsync(async (req: Request, res: Response) => {
  const tweet = await characterService.updateAllMinFaves(req.body.group, req.body.minFaves);
  res.status(httpStatus.OK).send(tweet);
});
