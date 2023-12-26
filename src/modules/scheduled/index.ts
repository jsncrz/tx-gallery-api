import schedule from 'node-schedule';
import { twitterService } from '../twitter';

class SyncJob {
  static syncAllCharactersTweets() {
    schedule.scheduleJob('0 */12 * * *', function () {
      twitterService.syncCharactersTweets();
    });
  }

  static resyncTweets() {
    schedule.scheduleJob('30 2 * * *', function () {
      twitterService.recheckTweet();
    });
  }
}

export default SyncJob;
