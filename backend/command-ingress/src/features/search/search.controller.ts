import asyncHandler from "express-async-handler";
import Post from '../../../../internal/database/mongodb/model/post';
import Tag from '../../../../internal/database/mongodb/model/tag';
import User from '../../../../internal/database/mongodb/model/user';
import { getPostsWithUser } from "../post/post.controller";

//todo pagination
export const postSearch = asyncHandler(async (req, res, next) => {
  const { query } = req.params;
  const { userId } = req.body;
  const ignoreAuthors = [];
  const ignorePosts = [];
  if (userId) {
    const user = await User.findOne({ _id: userId });
    ignoreAuthors.push(...(user?.mutedAuthor ?? []));
    ignorePosts.push(...(user?.ignore ?? []));
  }
  const regex = new RegExp(`${query}`, "i");
  const posts = await getPostsWithUser(
    Post.find({
      $and: [
        { title: regex },
        { _id: { $nin: ignorePosts } },
        { userId: { $nin: ignoreAuthors } },
      ],
    })
  );
  res.send(posts);
});

//todo pagination
export const topicSearch = asyncHandler(async (req, res, next) => {
  const { query } = req.params;
  const regex = new RegExp(`${query}`, "i");
  const tags = await Tag.find({ name: regex });
  res.send(tags);
});

//todo pagination
export const userSearch = asyncHandler(async (req, res, next) => {
  const { query } = req.params;
  const regex = new RegExp(`${query}`, "i");
  const users = await User.find({ name: regex });
  res.send(users);
});
