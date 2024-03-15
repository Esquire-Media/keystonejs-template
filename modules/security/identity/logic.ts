import { BaseListTypeInfo, ListAccessControl } from "@keystone-6/core/types";
import { allowAll } from "@keystone-6/core/access";
import { merge } from "ts-deepmerge";
import { Context } from "../types";

export const isLoggedIn = ({ session }: Context) => !!session;

export const allowLoggedIn = {
  operation: {
    query: isLoggedIn,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  filter: {
    query: (context) => (isLoggedIn(context) ? {} : false),
    update: (context) => (isLoggedIn(context) ? {} : false),
    delete: (context) => (isLoggedIn(context) ? {} : false),
  },
  item: {
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
} as ListAccessControl<BaseListTypeInfo>;

export const allowAllQuery = merge(allowLoggedIn, {
  operation: {
    query: allowAll,
  },
  filter: {
    query: allowAll,
  } as Partial<ListAccessControl<BaseListTypeInfo>>,
}) as ListAccessControl<BaseListTypeInfo>;

export const allowAllCreate: ListAccessControl<BaseListTypeInfo> = merge(
  allowLoggedIn,
  {
    operation: {
      create: allowAll,
    },
    item: {
      create: allowAll,
    } as Partial<ListAccessControl<BaseListTypeInfo>>,
  }
) as ListAccessControl<BaseListTypeInfo>;

export const allowAllQueryOrCreate = merge(
  allowAllQuery,
  allowAllCreate
) as ListAccessControl<BaseListTypeInfo>;