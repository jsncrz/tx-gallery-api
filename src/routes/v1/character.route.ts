import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { characterController, characterValidation } from '../../modules/character';

const router: Router = express.Router();

router.get('/', validate(characterValidation.getCharacters), characterController.getCharacters);
router.get('/getTagsByName', validate(characterValidation.getTagsByName), characterController.getTagsByName);
router.post('/', validate(characterValidation.createCharacter), characterController.createCharacter);
router.post('/update-limit', validate(characterValidation.noValidation), characterController.updateAllLimits);
router.post('/update-min-faves', validate(characterValidation.noValidation), characterController.updateAllMinFaves);

export default router;
