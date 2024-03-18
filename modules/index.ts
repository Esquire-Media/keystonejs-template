import type { Module } from "../types";
import { module as Security, withAuth } from "./security";
import { module as Advertising } from "./advertising";
import { merge } from "ts-deepmerge";
import { ListConfig, list } from "@keystone-6/core";
import { BaseListTypeInfo } from "@keystone-6/core/types";

const modules: Module[] = [Security, Advertising];
export const config = modules.length > 1 ? merge(...modules) : modules[0];

export const app = {
  lists: config.models
    ? Object.fromEntries(
        Object.entries(config.models).map(([listKey, config]) => [
          listKey,
          list(config as ListConfig<BaseListTypeInfo>),
        ])
      )
    : {},
  session: config.session,
};

export { withAuth };
