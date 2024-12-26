import { Operator } from "../pipeline";
import _ from 'lodash';
import {Db, ObjectId} from 'mongodb';

class TransformPostMetadata implements Operator {
  async run(data: any): Promise<any> {
    if (!this.isNewPost(data)) {
      return;
    }

    const postCreatedAt = _.get(data, 'fullDocument.createdAt');

    return {
      ...data,
      sinkMetadata: {
        ..._.get(data, 'sinkMetadata', {}),
        timestamp: (new Date(postCreatedAt)).getTime(),
        postID: String(_.get(data, 'fullDocument._id')),
      },
    }
  }

  isNewPost(data: any): boolean {
    const operationType = _.get(data, 'operationType');
    const author = _.get(data, 'fullDocument.userId', '');

    return operationType === 'insert' && author !== '';
  }
}

export {
  TransformPostMetadata,
};
