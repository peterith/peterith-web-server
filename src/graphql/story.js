import { gql } from 'apollo-server-express';
import { StoryTypeEnum } from '../utils/enums';

export const storyTypeDefs = gql`
  extend type Query {
    getAboutStory: Story!
  }

  extend type Mutation {
    addStory(story: StoryInput!): Story!
  }

  type Story {
    id: ID
    title: String
    description: String
    type: StoryType
    tags: [String]
    sections: [StorySection]
    createdAt: String
    updatedAt: String
  }

  type StorySection {
    id: ID
    title: String
    contents: [StoryContent]
    order: Int
  }

  type StoryContent {
    id: ID
    title: String
    text: String
    order: Int
  }

  enum StoryType {
    INTERNAL
  }

  enum StoryContentType {
    LIST
    TEXT
  }

  input StoryInput {
    title: String
    description: String
    type: StoryType
    tags: [String]
    sections: [StorySectionInput]
  }

  input StorySectionInput {
    title: String
    contents: [StoryContentInput]
    order: Int
  }

  input StoryContentInput {
    title: String
    text: String
    order: Int
  }
`;

export const storyResolvers = {
  Query: {
    getAboutStory: (_, __, { db }) => {
      return db.Story.findOne({ type: StoryTypeEnum.INTERNAL, tags: '__about' });
    },
  },

  Mutation: {
    addStory: (_, { story }, { contextUser, db }) => {
      // if (story.type === StoryTypeEnum.INTERNAL && contextUser.role !== RoleEnum.ADMIN) {
      //   throw new ForbiddenError(ErrorMessageEnum.NO_PERMISSION);
      // }
      return db.Story.create(story);
    },
    // updateAboutStory: (_, __, { contextUser, db }) => {
    //   if (contextUser.role !== RoleEnum.ADMIN) {
    //     throw ForbiddenError(ErrorMessageEnum.NO_PERMISSION);
    //   }
    //   return db.Story.find({ storyType: StoryTypeEnum.INTERNAL, tags: 'about' });
    // },
  },
};
