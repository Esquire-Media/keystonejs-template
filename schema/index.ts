import type { Lists } from ".keystone/types";
import Role from "./models/Role";
import User from "./models/User";
import Advertiser from "./models/Advertiser";
import Tag from "./models/Tag";
import DataType from "./models/DataType";
import DataSource from "./models/DataSource";
import ProcessingStep from "./models/ProcessingStep";
import Publisher from "./models/Publisher";
import PublisherEntity from "./models/PublisherEntity";
import Audience from "./models/Audience"

export const lists = {
  Role,
  User,
  Advertiser,
  Tag,
  DataType,
  DataSource,
  ProcessingStep,
  Publisher,
  PublisherEntity,
  Audience,
};
