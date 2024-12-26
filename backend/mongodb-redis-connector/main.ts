import { config } from "dotenv";
import {MongoClient} from 'mongodb';
import {createClient} from 'redis';
import {connectRedis} from '../lib/redis';
import {mustGetEnv} from '../lib/env';
import {Operator, Pipeline, Transformer} from './pipeline';
import {RedisSink} from './sink/redis_feeds';
import {MongoDBChangeStreamSource} from './source/changestream';
import {EnrichUserFollowInfo} from "./operator/enrich_follow_info";
import {TransformPostMetadata} from "./operator/transform_post_metadata";

config();


async function connectMongoDB() {
  const databaseUri = mustGetEnv('MONGO_URI');
  const databaseName = mustGetEnv('MONGO_DB_NAME');
  const mongoClient = await MongoClient.connect(databaseUri);
  const db = mongoClient.db(databaseName);

  return {
    db, mongoClient,
  };
}

async function main() {
  const postCollection = 'posts';
  const redisClient: ReturnType<typeof createClient> = await connectRedis();
  const { db, mongoClient } = await connectMongoDB();

  const closeFn = () => {
    console.log('Received OS Signal. Exiting gracefully...');
    redisClient.quit();
    mongoClient.close();
    process.exit(0);
  }

  process.on('SIGINT', closeFn);
  process.on('SIGTERM', closeFn);

  const mongoChangeStreamSource = new MongoDBChangeStreamSource(
    redisClient,
    db,
    postCollection,
  );
  const redisSink = new RedisSink(redisClient);
  const operators: Operator[] = [];

  operators.push(new EnrichUserFollowInfo(db));
  operators.push(new TransformPostMetadata());

  const pipeline = new Pipeline(
    mongoChangeStreamSource,
    redisSink,
    operators,
  );

  pipeline.run();

  setInterval(() => {}, 1 << 30);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});