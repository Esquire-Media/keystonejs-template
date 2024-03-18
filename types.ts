import { ListConfig } from "@keystone-6/core";
import { BaseListTypeInfo, SessionStrategy } from "@keystone-6/core/types";

export type Models = Record<string, any>;
export type Module = {
  models?: Models;
  env?: NodeJS.ProcessEnv;
  checks?: Record<string, any>;
  session?: SessionStrategy<any, any>;
};
