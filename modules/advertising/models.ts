import { ListConfig } from "@keystone-6/core";
import {
  checkbox,
  codeblock,
  filter,
  integer,
  json,
  relationship,
  select,
  text,
} from "../../fields";
import { BaseListTypeInfo, ListAccessControl } from "@keystone-6/core/types";
import { DataType, Publisher, PublisherEntityType } from "./types";
import { merge } from "ts-deepmerge";
import { can, isGlobalAdmin } from "../security/authorization/logic";
import { allowLoggedIn } from "../security/identity/logic";
import { fetchTenantChildren } from "../security/tenancy/logic";

export const Geoframe: ListConfig<BaseListTypeInfo> = {
  access: allowLoggedIn,
  fields: {
    ESQID: text(),
    polygon: json({
      ui: {
        views: "./fields/geoframe/wrapper"
      }
    }),
  }
}

export const EnumList: ListConfig<BaseListTypeInfo> = {
  access: allowLoggedIn,
  fields: {
    title: text({
      validation: { isRequired: true },
      isIndexed: "unique",
    }),
  },
  ui: { labelField: "title" },
};

export const DataSource: ListConfig<BaseListTypeInfo> = {
  access: allowLoggedIn,
  fields: {
    dataType: select(DataType),
    title: text({
      validation: { isRequired: true },
      isIndexed: "unique",
    }),
    filtering: codeblock({
      ui: {
        language: "json",
        options: {
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          formatOnPaste: true,
          formatOnType: true,
          scrollBeyondLastLine: false,
        },
      },
    }),
  },
  ui: {
    labelField: "title",
    isHidden: async (context) => !(await isGlobalAdmin(context)),
    hideCreate: true,
    hideDelete: true,
  },
};

export const ProcessingStep: ListConfig<BaseListTypeInfo> = {
  access: allowLoggedIn,
  fields: {
    audience: relationship({
      ref: "Audience.processes",
      many: false,
      ui: {
        displayMode: "cards",
        cardFields: ["tenant"],
        inlineConnect: false,
        hideCreate: true,
      },
    }),
    sort: integer({ ui: { createView: { fieldMode: "hidden" } } }),
    outputType: select(DataType),
    customCoding: codeblock({
      ui: {
        language: "json",
        options: {
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          formatOnPaste: true,
          formatOnType: true,
          scrollBeyondLastLine: false,
        },
      },
    }),
  },
  hooks: {
    validateInput: async ({
      operation,
      resolvedData,
      addValidationError,
      context,
      listKey,
    }) => {
      let errors = false;
      if (operation === "create") {
        if (resolvedData.audience === undefined) {
          errors = true;
          addValidationError("An Audience must be selected");
        }
        if (resolvedData.sort === undefined) {
          errors = true;
          addValidationError("The Sort order must be set");
        }
        if (resolvedData.outputType === undefined) {
          errors = true;
          addValidationError("An Output Type must be selected");
        }
      }
      if (errors) return;
      const existing = await context.sudo().query[listKey].findMany({
        where: {
          audience: {
            id: {
              equals:
                resolvedData.audience.connect?.id ??
                resolvedData.audience.create?.id,
            },
          },
          sort: { equals: resolvedData.sort },
          outputType: { equals: resolvedData.outputType },
          customCoding: { equals: resolvedData.customCoding },
        },
      });
      if (
        existing.length > 0 &&
        (operation === "create" ||
          (operation === "update" &&
            !existing.map((e) => e.id).includes(resolvedData.id)))
      ) {
        addValidationError(
          `The record ${JSON.stringify(existing[0])} already exists.`
        );
      }
    },
  },
  ui: {
    isHidden: async (context) => !(await isGlobalAdmin(context)),
    hideCreate: true,
    hideDelete: true,
  },
};

export const PublisherEntity: ListConfig<BaseListTypeInfo> = {
  access: allowLoggedIn,
  fields: {
    publisher: select(Publisher),
    entityType: select(PublisherEntityType),
    entityId: text({
      validation: { isRequired: true },
      isIndexed: "unique",
    }),
  },
  ui: {
    isHidden: async (context) => !(await isGlobalAdmin(context)),
    hideCreate: true,
    hideDelete: true,
  },
};

export const Audience: ListConfig<BaseListTypeInfo> = {
  access: merge(allowLoggedIn, {
    filter: {
      query: async ({ session, context }) => {
        if (!session) return false;
        if (await isGlobalAdmin({ session, context })) return {};
        const tenants = await fetchTenantChildren(
          { context },
          {
            permissions: {
              some: { delegates: { some: { id: { equals: session.itemId } } } },
            },
          }
        );
        return { tenant: { id: { in: tenants.flat(Infinity) } } };
      },
    },
    item: {
      create: ({ session, context, inputData }) =>
        can(
          { session, context },
          inputData.tenent?.connect?.id ?? inputData.tenent?.create?.id,
          "C"
        ),
      update: async ({ session, context, item, inputData, listKey }) => {
        // If changing tenent
        if (
          (inputData.tenent?.connect?.id || inputData.tenent?.create?.id) &&
          item.tenentId
        )
          return (
            // Check if adding to the new tenent is allowed
            (await can(
              { session, context },
              inputData.tenent.connect?.id ?? inputData.tenent.create?.id,
              "C"
            )) &&
            // Check if removing from the current tenent is allowed
            (await can({ session, context }, item.tenentId.toString(), "D"))
          );
        // Otherwise
        const tenant = (
          await context.sudo().query[listKey].findOne({
            where: { id: item.id.toString() },
            query: "tenant { id }",
          })
        ).tenant;
        return await can({ session, context }, tenant, "U");
      },
      delete: async ({ session, context, item, listKey }) => {
        const tenant = (
          await context.sudo().query[listKey].findOne({
            where: { id: item.id.toString() },
            query: "tenant { id }",
          })
        ).tenant;
        return await can({ session, context }, tenant, "D");
      },
    },
  } as Partial<ListAccessControl<BaseListTypeInfo>>) as ListAccessControl<BaseListTypeInfo>,
  fields: {
    tenant: relationship({
      ref: "Tenant",
      many: false,
      ui: { hideCreate: true },
    }),
    status: checkbox({ defaultValue: true }),
    rebuildFrequency: integer({ defaultValue: 1 }),
    rebuildUnit: select({
      type: "enum",
      options: [
        { label: "Day(s)", value: "days" },
        { label: "Weeks(s)", value: "weeks" },
        { label: "Month(s)", value: "months" },
      ],
      defaultValue: "days",
    }),
    timeToLive: integer({ defaultValue: 0 }),
    TTLUnit: select({
      type: "enum",
      options: [
        { label: "Day(s)", value: "days" },
        { label: "Weeks(s)", value: "weeks" },
        { label: "Month(s)", value: "months" },
      ],
      defaultValue: "days",
    }),
    dataSource: relationship({
      ref: "DataSource",
      ui: {
        labelField: "title",
        hideCreate: true,
      },
    }),
    dataFilter: filter({
      ui: {
        style: "antd",
        dependency: {
          field: "dataSource.filtering",
        },
        // ref: "DataSource.dataType",
        // fields: {} // https://github.com/ukrbublik/react-awesome-query-builder/blob/master/CONFIG.adoc#configfields
      },
    }),
    processes: relationship({
      ref: "ProcessingStep.audience",
      many: true,
      refOrderBy: [{ sort: "asc" }],
      ui: {
        displayMode: "cards",
        orderBy: "sort",
        cardFields: ["outputType"],
        inlineEdit: { fields: ["outputType", "customCoding"] },
        inlineCreate: { fields: ["outputType", "customCoding"] },
      },
    }),
    publishing: relationship({
      ref: "PublisherEntity",
      many: true,
      ui: {
        displayMode: "cards",
        cardFields: ["publisher", "entityType", "entityId"],
        inlineCreate: { fields: ["publisher", "entityType", "entityId"] },
        inlineConnect: true,
      },
    }),
  },
  hooks: {
    validateInput: async ({
      operation,
      resolvedData,
      addValidationError,
      context,
      listKey,
    }) => {
      let errors = false;
      if (operation === "create") {
        if (!resolvedData.tenant) {
          errors = true;
          addValidationError("A Tenant must be selected");
        }
        if (!resolvedData.dataSource) {
          errors = true;
          addValidationError("A Data Source must be selected");
        }
        if (!resolvedData.dataFilter) {
          errors = true;
          addValidationError("A Data Filter must be selected");
        }
        // TODO: Add the rest of the unique fields
      }
      if (errors) return;
      const existing = await context.sudo().query[listKey].findMany({
        where: {
          tenant: {
            id: {
              equals:
                resolvedData.tenent?.connect?.id ??
                resolvedData.tenent?.create?.id,
            },
          },
          dataSource: {
            id: {
              equals:
                resolvedData.dataSource?.connect?.id ??
                resolvedData.dataSource?.create?.id,
            },
          },
          dataFilter: { equals: resolvedData.dataFilter },
        },
      });
      if (
        existing.length > 0 &&
        (operation === "create" ||
          (operation === "update" &&
            !existing.map((e) => e.id).includes(resolvedData.id)))
      ) {
        addValidationError(
          `The record ${JSON.stringify(existing[0])} already exists.`
        );
      }
    },
  },
};
