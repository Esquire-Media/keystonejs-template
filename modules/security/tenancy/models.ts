import {
  BaseListTypeInfo,
  ListConfig,
} from "@keystone-6/core/types";
import { relationship, text, virtual } from "../../../fields";
import { module } from ".";
import { fetchTenantChildren } from "./logic";
import { graphql } from "@keystone-6/core";
import { allowLoggedIn } from "../identity/logic";

export const User: Partial<ListConfig<BaseListTypeInfo>> = {
  fields: {
    tenants: virtual({
      field: graphql.field({
        type: graphql.list(graphql.String),
        async resolve(item, _, context) {
          const tenants = await fetchTenantChildren(
            { context },
            {
              permissions: {
                some: { delegates: { some: { id: { equals: item.id } } } },
              },
            }
          );
          return tenants;
        },
      }),
    }),
  },
};

export const Tenant: ListConfig<BaseListTypeInfo> = {
  access: allowLoggedIn,
  fields: {
    title: text({ validation: { isRequired: true }, isIndexed: "unique" }),
    parent: relationship({
      ref: "Tenant.children",
      many: false,
      ui: {
        hideCreate: true,
        itemView: { fieldMode: "hidden" },
      },
    }),
    children: relationship({
      ref: "Tenant.parent",
      many: true,
      ui: {
        hideCreate: true,
        createView: { fieldMode: "hidden" },
      },
    }),
  },
  hooks: {
    resolveInput: async ({ inputData, resolvedData, item, context }) => {
      if (
        !(
          item?.title === module.env?.TENANT_GLOBAL_TITLE ||
          inputData.title === module.env?.TENANT_GLOBAL_TITLE ||
          resolvedData.title === module.env?.TENANT_GLOBAL_TITLE
        ) &&
        !item?.parentId &&
        !inputData.parentId &&
        !resolvedData.parent
      )
        resolvedData.parent = {
          connect: await context.sudo().query.Tenant.findOne({
            where: { title: module.env?.TENANT_GLOBAL_TITLE },
          }),
        };

      return resolvedData;
    },
  },
};
