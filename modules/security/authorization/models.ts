import {
  BaseListTypeInfo,
  ListAccessControl,
  ListConfig,
  ListHooks,
} from "@keystone-6/core/types";
import { merge } from "ts-deepmerge";
import { can, isGlobalAdmin } from "./logic";
import { Context, Operations, Ops } from "../types";
import { fetchTenantChildren, fetchTenantGlobal } from "../tenancy/logic";
import { relationship, select } from "../../../fields";
import { env } from "../tenancy";
import { allowLoggedIn } from "../identity/logic";

export const User = {
  access: {
    filter: {
      query: async ({ session, context }: Context) => {
        if (!session) return false;
        if (await isGlobalAdmin({ session, context })) return {};
        // Filter for only relatives
        const permissions = {
          some: {
            id: {
              in: (await context.query.Permission.findMany()).map(
                (permission) => permission.id
              ),
            },
          },
        };
        return { OR: [{ id: { equals: session.itemId } }, { permissions }] };
      },
    },
  } as Partial<ListAccessControl<BaseListTypeInfo>>,
  fields: {
    permissions: relationship({
      ref: "Permission.delegates",
      many: true,
      ui: {
        displayMode: "cards",
        cardFields: ["tenant", "operation"],
        createView: { fieldMode: "hidden" },
        listView: { fieldMode: "hidden" },
      },
    }),
  },
};

export const Tenant = {
  access: {
    filter: {
      query: async ({ session, context }: Context) => {
        if (!session) return false;
        if (await isGlobalAdmin({ session, context })) return {};
        const hierarchy = await fetchTenantChildren(
          { context },
          {
            permissions: {
              some: { delegates: { some: { id: { equals: session.itemId } } } },
            },
          }
        );
        return { id: { in: hierarchy.flat(Infinity) } };
      },
    },
    item: {
      create: async ({ session, context, inputData }) => {
        // If attempting to create the global tenant
        if (inputData.title === env.TENANT_GLOBAL_TITLE) {
          // check if it exists
          if (
            await context.sudo().query.Tenant.findOne({
              where: { title: env.TENANT_GLOBAL_TITLE },
            })
          ) {
            return false;
          } else {
            return true;
          }
        }
        // Check if allowed to create on parent
        return await can(
          { session, context },
          inputData.parent?.connect?.id ??
            (
              await fetchTenantGlobal({ context })
            ).id,
          "C"
        );
      },
      update: async ({ session, context, item, inputData }) => {
        // If changing parent
        if (inputData.parent?.connect?.id && item.parentId)
          return (
            // Check if adding to the new parent is allowed
            (await can(
              { session, context },
              inputData.parent.connect.id,
              "C"
            )) &&
            // Check if removing from the current parent is allowed
            (await can({ session, context }, item.parentId.toString(), "D"))
          );
        // Otherwise
        return await can({ session, context }, item.id.toString(), "U");
      },
      delete: ({ session, context, item }) =>
        can({ session, context }, item.id.toString(), "D"),
    },
  } as Partial<ListAccessControl<BaseListTypeInfo>>,
  fields: {
    permissions: relationship({
      ref: "Permission.tenant",
      many: true,
      ui: {
        displayMode: "cards",
        cardFields: ["operation", "delegates"],
        createView: { fieldMode: "hidden" },
        listView: { fieldMode: "hidden" },
        itemView: {
          fieldMode: async ({ session, context, item }) =>
            (await can({ session, context }, item.id.toString(), "U"))
              ? "edit"
              : "read",
        },
        inlineConnect: false,
        hideCreate: true,
        inlineEdit: { fields: ["delegates"] },
        removeMode: "none",
      },
    }),
  },
  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      if (operation === "create") {
        await context.sudo().db.Permission.createMany({
          data: Operations.options.map((op) => ({
            operation: typeof op === "string" ? op : op.value,
            tenant: { connect: { id: item.id } },
          })),
        });
      }
    },
  } as ListHooks<BaseListTypeInfo>,
};

export const Permission: ListConfig<BaseListTypeInfo> = {
  access: merge(allowLoggedIn, {
    operation: {
      create: () => false,
      update: () => false,
      delete: () => false,
    },
    filter: {
      query: async ({ session, context }: Context) => {
        if (!session) return false;
        if (await isGlobalAdmin({ session, context })) return {};
        // Filter for only relatives
        const permissions_direct: {
          tenant: { id: string };
          operation: string;
        }[] = (
          await context.sudo().query.User.findOne({
            where: { id: session.itemId },
            query: "permissions { tenant { id }, operation }",
          })
        ).permissions;
        const tenants = (
          await fetchTenantChildren(
            { context },
            {
              id: {
                in: permissions_direct
                  .filter((item) => item.operation === "R")
                  .map((item) => item.tenant.id)
                  .reduce((uniqueIds, id) => {
                    if (!uniqueIds.includes(id)) {
                      uniqueIds.push(id);
                    }
                    return uniqueIds;
                  }, [] as string[]),
              },
            }
          )
        )
          .flat(Infinity)
          .reduce((uniqueIds, id) => {
            if (!uniqueIds.includes(id)) {
              uniqueIds.push(id);
            }
            return uniqueIds;
          }, [] as string[]);
        return { tenant: { id: { in: tenants } } };
      },
    },
  } as Partial<ListAccessControl<BaseListTypeInfo>>) as ListAccessControl<BaseListTypeInfo>,
  fields: {
    tenant: relationship({ ref: "Tenant.permissions", many: false }),
    operation: select(Operations),
    delegates: relationship({ ref: "User.permissions", many: true }),
  },
  hooks: {
    validateInput: async ({
      operation,
      resolvedData,
      addValidationError,
      context,
    }) => {
      if (resolvedData.operation && resolvedData.tenant) {
        if (
          operation === "create" &&
          (
            await context.sudo().query.Permission.findMany({
              where: {
                operation: { equals: resolvedData.operation },
                tenant: {
                  id: {
                    equals:
                      resolvedData.tenant.connect?.id ??
                      resolvedData.tenant.create?.id,
                  },
                },
              },
            })
          ).length > 0
        )
          addValidationError("This record already exists.");
      } else {
        if (!resolvedData.operation)
          addValidationError("An Operation must be set.");
        if (!resolvedData.tenant) addValidationError("A Tenant must be set.");
      }
    },
    validateDelete: async ({ item, context, addValidationError }) => {
      if (
        item.tenantId &&
        (
          await context
            .sudo()
            .query.Tenant.findOne({ where: { id: item.tenantId.toString() } })
        ).length > 0
      )
        addValidationError("The Tenant still exists.");
    },
  },
  ui: {
    isHidden: async (context) => !(await isGlobalAdmin(context)),
    hideCreate: true,
    hideDelete: true,
  },
};
