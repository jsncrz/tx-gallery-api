import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { twitterValidation, twitterController } from '../../modules/twitter';
import { auth } from '../../modules/auth';

const router: Router = express.Router();

router.get('/getTweets', validate(twitterValidation.getTweets), twitterController.getTweets);
router.route('/create').post(auth('modifyTweet'), validate(twitterValidation.createTweet), twitterController.createTweet);
router.post('/sync-all', validate(twitterValidation.noValidation), twitterController.syncCharactersTweets);
// router.route('/sync-all').post(auth(), validate(twitterValidation.noValidation), twitterController.syncCharactersTweets);
router.post('/sync/:characterId', validate(twitterValidation.syncTweet), twitterController.deepSyncTweet);
// router
//   .route('/sync/:characterId')
//   .post(auth('modifyTweet'), validate(twitterValidation.syncTweet), twitterController.deepSyncTweet);
router.route('/fix-tags').post(auth('modifyTweet'), validate(twitterValidation.noValidation), twitterController.fixTags);

export default router;
