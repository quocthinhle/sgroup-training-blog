import { createClient, RedisClientType } from 'redis';
import { Source } from "../source";
import {Db} from 'mongodb';
import EventEmitter from "events";


class MongoDBChangeStreamSource implements Source {
  redisClient: ReturnType<typeof createClient>;
  mongoDbClient: Db;
  mongoDbCollectionName: string;

  constructor(
    redisClient: ReturnType<typeof createClient>,
    mongoDbClient: Db,
    mongoDbCollectionName: string,
  ) {
    this.redisClient = redisClient;
    this.mongoDbClient = mongoDbClient;
    this.mongoDbCollectionName = mongoDbCollectionName;
  }

  async get(): Promise<EventEmitter> {
    const eventEmitter = new EventEmitter();
    const resumeToken = await this.redisClient.get('RESUME_TOKEN');
    const watchOptions: any = {};
    if (resumeToken) {
      watchOptions['resumeAfter'] = { _data: resumeToken };
    }

    const changeStream = this.mongoDbClient
      .collection(this.mongoDbCollectionName)
      .watch([], watchOptions);

    changeStream.on('change', (change) => {
      if (change && change.operationType) {
        console.info('Source flushed data:', change);
        eventEmitter.emit('change', change);
      }
    });

    console.info('Change stream started on collection:', this.mongoDbCollectionName);

    return eventEmitter;
  };
}

export {
  MongoDBChangeStreamSource,
};
