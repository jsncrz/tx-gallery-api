import schedule from 'node-schedule';
import { twitterService } from '../twitter';

class SyncJob {
  static startJob() {
    schedule.scheduleJob('0 */4 * * *', function () {
      twitterService.syncAllTweets();
    });
  }
}

export default SyncJob;
