import mongoose from 'mongoose';
import request from 'supertest';
import { faker } from '@faker-js/faker';
import httpStatus from 'http-status';
import app from '../../app';
import setupTestDB from '../jest/setupTestDB';
import Character from './character.model';

setupTestDB();

const charOne = {
  _id: new mongoose.Types.ObjectId(),
  name: faker.person.fullName(),
  tlName: faker.person.fullName(),
  twitterLink: faker.internet.url(),
  pictureUrl: faker.internet.url(),
  tag: faker.word.noun(),
  group: 'A-Team',
  limit: faker.number.int(),
  minFaves: faker.number.int(),
  debutDate: faker.date.recent().toISOString(),
};

const charTwo = {
  _id: new mongoose.Types.ObjectId(),
  name: faker.person.fullName(),
  tlName: faker.person.fullName(),
  twitterLink: faker.internet.url(),
  pictureUrl: faker.internet.url(),
  tag: faker.word.noun(),
  group: 'A-Team',
  limit: faker.number.int(),
  minFaves: faker.number.int(),
  debutDate: faker.date.recent().toISOString(),
};

const charThree = {
  _id: new mongoose.Types.ObjectId(),
  name: faker.person.fullName(),
  tlName: faker.person.fullName(),
  twitterLink: faker.internet.url(),
  pictureUrl: faker.internet.url(),
  tag: faker.word.noun(),
  group: 'B-Team',
  limit: faker.number.int(),
  minFaves: faker.number.int(),
  debutDate: faker.date.recent().toISOString(),
};

const insertCharacter = async (charas: Record<string, any>[]) => {
  await Character.insertMany(charas.map((chara) => ({ ...chara })));
};

describe('Character routes', () => {

  describe('GET /v1/characters', () => {
    it('should return 200 and apply the default query options', async () => {
      await insertCharacter([charOne, charTwo, charThree]);

      const res = await request(app)
        .get('/api/v1/characters')
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0]).toEqual({
        id: charOne._id.toHexString(),
        name: charOne.name,
        tlName: charOne.tlName,
        twitterLink: charOne.twitterLink,
        pictureUrl: charOne.pictureUrl,
        tag: charOne.tag,
        group: charOne.group,
        limit: charOne.limit,
        minFaves: charOne.minFaves,
        otherTags: expect.any(Array),
        debutDate: charOne.debutDate,
      });
    });
    it('should return 200 and get a sorted list by name', async () => {
      let charas = [charOne, charTwo, charThree];
      charas = charas.sort((a, b) => a.name.localeCompare(b.name));
      const firstChara = charas[0]!;
      await insertCharacter(charas);
      const res = await request(app)
        .get('/api/v1/characters?sortBy=name:asc')
        .send()
        .expect(httpStatus.OK);
      expect(res.body.results[0]).toEqual({
        id: firstChara._id.toHexString(),
        name: firstChara.name,
        tlName: firstChara.tlName,
        twitterLink: firstChara.twitterLink,
        pictureUrl: firstChara.pictureUrl,
        tag: firstChara.tag,
        group: firstChara.group,
        limit: firstChara.limit,
        minFaves: firstChara.minFaves,
        otherTags: expect.any(Array),
        debutDate: firstChara.debutDate,
      });
    })
    it('should return 200 and get a limited result list of 1', async () => {
      await insertCharacter([charOne, charTwo, charThree]);
      const res = await request(app)
        .get('/api/v1/characters?limit=1')
        .send()
        .expect(httpStatus.OK);
      expect(res.body.results).toHaveLength(1);
    })
  });
  describe('GET /api/characters/names', () => {
  });
  describe('GET /api/characters/search', () => {
  });
});