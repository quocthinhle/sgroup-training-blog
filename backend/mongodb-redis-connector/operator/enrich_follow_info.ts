import { Operator } from "../pipeline";
import _ from 'lodash';
import {Db, ObjectId} from 'mongodb';

class EnrichUserFollowInfo implements Operator {
  mongoDBClient: Db;

  constructor(mongoDBClient: Db) {
    this.mongoDBClient = mongoDBClient;
  }

  async run(data: any): Promise<any> {
    if (!this.isNewPost(data)) {
      return;
    }

    const authorId = _.get(data, 'fullDocument.userId');
    const author = await this.getUser(authorId);
    const followers = _.get(author, 'followers', [])
      .map((follower: any) => String(follower));

    return {
      ...data,
      sinkMetadata: {
        ..._.get(data, 'sinkMetadata', {}),
        followers,
      },
    }
  }

  isNewPost(data: any): boolean {
    const operationType = _.get(data, 'operationType');
    const author = _.get(data, 'fullDocument.userId', '');

    return operationType === 'insert' && author !== '';
  }

  async getUser(userId: string): Promise<any> {
    const user = await this.mongoDBClient
      .collection('users')
      .findOne({ _id: new ObjectId(userId) });

    return user;
  }

}

export {
  EnrichUserFollowInfo,
};
