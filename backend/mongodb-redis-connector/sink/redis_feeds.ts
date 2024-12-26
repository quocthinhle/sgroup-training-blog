import { createClient } from 'redis';
import { Sink } from '../sink';

export class RedisSink implements Sink {
  redisClient: ReturnType<typeof createClient>;

  constructor(redisClient: ReturnType<typeof createClient>) {
    this.redisClient = redisClient;
  }


  async save(data: any): Promise<void> {
    console.log('[RedisSink] Writing data to Redis:', data);
    const sinkMetadata = data.sinkMetadata;
    const {
      followers,
      postID,
      timestamp,
    } = sinkMetadata;

    console.log('[RedisSink] Writing data to Redis:', followers, postID, timestamp);

    const pipeline = this.redisClient.multi();
    for (const follower of followers) {
      pipeline.ZADD(`user:${follower}:following-feeds`, {
        score: timestamp,
        value: postID,
      });
    }

    await pipeline.execAsPipeline();
    console.log('[RedisSink] Data written to Redis');
  };
}

module.exports = {
  RedisSink,
};
