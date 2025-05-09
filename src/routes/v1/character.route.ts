import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { characterController, characterValidation } from '../../modules/character';
import { auth } from '../../modules/auth';

const router: Router = express.Router();

router.get('/', validate(characterValidation.getCharacters), characterController.getCharacters);
router.get(
  '/names',
  validate(characterValidation.getCharactersByName),
  characterController.getCharactersByName
);
router
  .route('/')
  .post(auth('updateCharacter'), validate(characterValidation.createCharacter), characterController.createCharacter);
router
  .route('/update-limit')
  .post(auth('updateCharacter'), validate(characterValidation.noValidation), characterController.updateAllLimits);
router
  .route('/update-min-faves')
  .post(auth('updateCharacter'), validate(characterValidation.noValidation), characterController.updateAllMinFaves);

export default router;
