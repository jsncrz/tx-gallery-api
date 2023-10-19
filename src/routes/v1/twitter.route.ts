import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { twitterValidation, twitterController } from '../../modules/twitter';
import { auth } from '../../modules/auth';

const router: Router = express.Router();

router.get('/getTweets', validate(twitterValidation.getTweets), twitterController.getTweets);
router.route('/create').post(auth('modifyTweet'), validate(twitterValidation.createTweet), twitterController.createTweet);
router
  .route('/sync-all')
  .post(auth('modifyTweet'), validate(twitterValidation.noValidation), twitterController.syncCharactersTweets);
router
  .route('/sync/:characterId')
  .post(auth('modifyTweet'), validate(twitterValidation.syncTweet), twitterController.deepSyncTweet);
router
  .route('/delete-video')
  .delete(auth('modifyTweet'), validate(twitterValidation.noValidation), twitterController.deleteVideos);

export default router;
