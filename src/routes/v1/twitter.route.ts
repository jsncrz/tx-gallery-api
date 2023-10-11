import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { twitterValidation, twitterController } from '../../modules/twitter';

const router: Router = express.Router();

router.post('/search', validate(twitterValidation.noValidation), twitterController.searchTwitter);
router.post('/create', validate(twitterValidation.createTweet), twitterController.createTweet);
router.get('/getTweets', validate(twitterValidation.getTweets), twitterController.getTweets);
router.post('/sync-all', validate(twitterValidation.noValidation), twitterController.syncAllTweets);
router.post('/sync/:characterId', validate(twitterValidation.syncTweet), twitterController.deepSyncTweet);
router.post('/delete-video', validate(twitterValidation.noValidation), twitterController.deleteVideos);

export default router;
