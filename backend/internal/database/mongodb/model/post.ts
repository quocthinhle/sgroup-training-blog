import { Schema, InferSchemaType, model } from "mongoose";

const postSchema = new Schema(
  {
    title: {
      type: String,
      require: true,
    },
    markdown: {
      type: String,
      require: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    tags: [{ type: String, required: true }],
    votes: [{ type: Schema.Types.ObjectId, ref: "users" }],
    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "users" },
        comment: String,
      },
    ],
    image: String,
    summary: String,
    savedBy: [{ type: Schema.Types.ObjectId, ref: "users" }],
  },
  { timestamps: true }
);

type postSchemaInferType = InferSchemaType<typeof postSchema>;
export default model<postSchemaInferType>("posts", postSchema);
