import mongoose from 'mongoose';
import toJSON from '../toJSON/toJSON';
import paginate from '../paginate/paginate';
import { ICharacterDoc, ICharacterModel } from './character.interfaces';

const CharacterSchema = new mongoose.Schema<ICharacterDoc, ICharacterModel>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  tlName: {
    type: String,
    required: true,
    trim: true,
  },
  twitterLink: {
    type: String,
    required: true,
    trim: true,
  },
  pictureUrl: {
    type: String,
    required: true,
    trim: true,
  },
  tag: {
    type: String,
    required: true,
    trim: true,
  },
  group: {
    type: String,
    required: true,
    trim: true,
  },
  limit: {
    type: Number,
    required: true,
  },
  minFaves: {
    type: Number,
    required: true,
  },
  isSyncing: {
    type: Boolean,
    required: false,
  },
  lastSynced: {
    type: Date,
    required: false,
  },
  debutDate: {
    type: Date,
    required: false,
  },
});

// add plugin that converts mongoose to json
CharacterSchema.plugin(toJSON);
CharacterSchema.plugin(paginate);

const Character = mongoose.model<ICharacterDoc, ICharacterModel>('Character', CharacterSchema);

export default Character;
