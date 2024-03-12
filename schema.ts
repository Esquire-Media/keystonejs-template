import { list, BaseFields } from "@keystone-6/core";
import type { Lists } from ".keystone/types";

import {
  checkbox,
  // decimal,
  // file,
  // float,
  integer,
  // bigInt,
  // image,
  // json,
  password,
  select,
  text,
  timestamp,
  // virtual,
  // calendarDay,
  // multiselect,
  codeblock,
  filter,
  relationship,
  // rating,
} from "./fields";
import { allowAll } from "@keystone-6/core/access";
import { KeystoneContext } from "@keystone-6/core/types";

const auditable: BaseFields<any> = {
  createdBy: relationship({
    ref: "User",
    ui: {
      listView: { fieldMode: "hidden" },
      createView: { fieldMode: "hidden" },
      itemView: { fieldMode: "read" },
    },
    hooks: {
      async resolveInput({ context, operation, resolvedData }) {
        if (operation === "create") {
          const [user] = await context.db.User.findMany({
            where: { id: { equals: context.session?.itemId } },
          });

          if (user) {
            return { connect: { id: user.id } };
          }
        }
        return resolvedData.createdBy;
      },
    },
  }),
  createdAt: timestamp({
    ui: {
      listView: { fieldMode: "hidden" },
      createView: { fieldMode: "hidden" },
      itemView: { fieldMode: "read" },
    },
    hooks: {
      async resolveInput({ resolvedData, operation }) {
        if (operation === "create") {
          return new Date();
        }
        return resolvedData.createdAt;
      },
    },
  }),
  updatedBy: relationship({
    ref: "User",
    ui: {
      listView: { fieldMode: "hidden" },
      createView: { fieldMode: "hidden" },
      itemView: { fieldMode: "read" },
    },
    hooks: {
      async resolveInput({ context, resolvedData }) {
        const [user] = await context.db.User.findMany({
          where: { id: { equals: context.session?.itemId } },
        });
        if (user) {
          return { connect: { id: user.id } };
        }
        return resolvedData.updatedBy;
      },
    },
  }),
  updatedAt: timestamp({
    ui: {
      listView: { fieldMode: "hidden" },
      createView: { fieldMode: "hidden" },
      itemView: { fieldMode: "read" },
    },
    hooks: {
      async resolveInput() {
        return new Date();
      },
    },
  }),
};

const hasAdministratorRole = async (
  session: any,
  context: KeystoneContext<any>
) => {
  if (!session) return false; // Ensure the user is logged in
  // Check if the user is an Administrator
  const userRole = await context.db.User.findOne({
    where: { id: session.itemId },
  });
  if (userRole?.role?.title === "Administrator") {
    return true;
  }
  return false;
};

export const lists: Lists = {
  Role: list({
    access: allowAll,
    fields: {
      ...auditable,
      title: text({
        validation: { isRequired: true },
        isIndexed: "unique",
      }),
      users: relationship({
        ref: "User.role",
        many: true,
        ui: {
          displayMode: "cards",
          cardFields: ["name", "email"],
          inlineConnect: true,
        },
      }),
    },
  }),

  User: list({
    access: allowAll,
    fields: {
      ...auditable,
      name: text({ validation: { isRequired: true } }),
      email: text({
        validation: { isRequired: true },
        isIndexed: "unique",
      }),
      password: password({ validation: { isRequired: true } }),
      advertisers: relationship({
        ref: "Advertiser.users",
        many: true,
        ui: {
          labelField: "title",
          linkToItem: true,
          hideCreate: true,
        },
      }),
      role: relationship({
        ref: "Role.users",
        ui: {
          labelField: "title",
          hideCreate: false,
        },
      }),
    },
  }),

  Advertiser: list({
    access: allowAll,
    fields: {
      ...auditable,
      title: text({
        validation: { isRequired: true },
        isIndexed: "unique",
      }),
      users: relationship({
        ref: "User.advertisers",
        many: true,
        ui: {
          displayMode: "cards",
          cardFields: ["name", "email"],
          inlineConnect: true,
          hideCreate: true,
        },
      }),
      audiences: relationship({
        ref: "Audience.advertisers",
        many: true,
        ui: {
          displayMode: "cards",
          cardFields: ["tags", "dataSource"],
          linkToItem: true,
        },
      }),
    },
  }),

  DataType: list({
    access: allowAll,
    fields: {
      ...auditable,
      title: text({
        validation: { isRequired: true },
        isIndexed: "unique",
      }),
    },
    ui: { labelField: "title" },
  }),
  DataSource: list({
    access: allowAll,
    fields: {
      ...auditable,
      dataType: relationship({
        ref: "DataType",
        ui: {
          labelField: "title",
        },
      }),
      title: text({
        validation: { isRequired: true },
        isIndexed: "unique",
      }),
      filtering: codeblock({
        ui: {
          // language: "json",
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
  }),
  ProcessingStep: list({
    access: allowAll,
    fields: {
      ...auditable,
      audience: relationship({
        ref: "Audience.processes",
        many: false,
        ui: {
          displayMode: "cards",
          cardFields: ["advertisers", "tags"],
          inlineConnect: false,
          hideCreate: true,
        },
      }),
      outputType: relationship({
        ref: "DataType",
        ui: {
          labelField: "title",
          hideCreate: true,
        },
      }),
      sort: integer({ ui: { createView: { fieldMode: "hidden" } } }),
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
      }) => {
        if (operation === "create" || operation === "update") {
          function where_equal(obj: any) {
            return Object.entries(obj).reduce((acc, [key, value]) => {
              acc[key] = { equals: value };
              return acc;
            }, {} as Record<string, any>);
          }
          const where = { AND: [] as Array<any> };
          const audience =
            resolvedData.audience?.connect || resolvedData.audience?.create;
          if (audience) {
            where.AND.push({
              audience: where_equal(audience),
            });
          }
          const outputType =
            resolvedData.outputType?.connect || resolvedData.outputType?.create;
          if (outputType) {
            where.AND.push({
              outputType: where_equal(outputType),
            });
          }
          if (resolvedData.sort) {
            where.AND.push({
              sort: { equals: resolvedData.sort },
            });
          }
          if (resolvedData.customCoding) {
            where.AND.push({
              customCoding: { equals: resolvedData.customCoding },
            });
          }

          // Adjust this query based on the actual data structure and necessary comparisons
          const existingRecords = await context.db.ProcessingStep.findMany({
            where,
          });

          if (existingRecords.length > 0) {
            addValidationError(
              "A record with the same combination of audience, outputType, sort, and customCoding already exists."
            );
          }
        }
      },
    },
    db: {
      extendPrismaSchema: (schema) => {
        return schema.replace(
          /(model [^}]+)}/g,
          "$1@@unique([audienceId, outputTypeId, sort, customCoding])\n}"
        );
      },
    },
  }),

  Publisher: list({
    access: allowAll,
    fields: {
      ...auditable,
      title: text({
        validation: { isRequired: true },
        isIndexed: "unique",
      }),
    },
  }),
  PublisherEntity: list({
    access: allowAll,
    fields: {
      ...auditable,
      demandSidePlatform: relationship({
        ref: "Publisher",
        ui: {
          listView: { fieldMode: "hidden" },
          createView: { fieldMode: "hidden" },
          itemView: { fieldMode: "read" },
        },
        many: false,
      }),
      entityType: select({
        type: "enum",
        options: [{ label: "Audience", value: "audience" }],
        defaultValue: "audience",
      }),
      entityId: text({
        validation: { isRequired: true },
      }),
    },
  }),

  Tag: list({
    access: allowAll,
    fields: {
      title: text({
        validation: { isRequired: true },
        isIndexed: "unique",
      }),
    },
  }),

  Audience: list({
    access: allowAll,
    fields: {
      ...auditable,
      advertisers: relationship({
        ref: "Advertiser.audiences",
        many: true,
        ui: {
          labelField: "title",
          inlineConnect: true,
        },
      }),
      tags: relationship({
        ref: "Tag",
        many: true,
        ui: {
          labelField: "title",
          inlineConnect: true,
          inlineCreate: { fields: ["title"] },
        },
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
    },
    hooks: {
      validateInput: async ({
        operation,
        resolvedData,
        addValidationError,
        context,
      }) => {
        if (operation === "create" || operation === "update") {
          function where_equal(obj: any) {
            return Object.entries(obj).reduce((acc, [key, value]) => {
              acc[key] = { equals: value };
              return acc;
            }, {} as Record<string, any>);
          }
          const where = { AND: [] as Array<any> };
          if (resolvedData.advertisers?.connect instanceof Array)
            where.AND.push(
              ...resolvedData.advertisers.connect.map((value) => ({
                advertisers: { some: where_equal(value) },
              }))
            );
          if (resolvedData.advertisers?.create instanceof Array)
            where.AND.push(
              ...resolvedData.advertisers.create.map((value) => ({
                advertisers: { some: where_equal(value) },
              }))
            );
          if (resolvedData.tags?.connect instanceof Array)
            where.AND.push(
              ...resolvedData.tags.connect.map((value) => ({
                tags: { some: where_equal(value) },
              }))
            );
          if (resolvedData.tags?.create instanceof Array)
            where.AND.push(
              ...resolvedData.tags.create.map((value) => ({
                tags: { some: where_equal(value) },
              }))
            );
          const dataSource =
            resolvedData.dataSource?.connect || resolvedData.dataSource?.create;
          if (dataSource)
            where.AND.push({
              dataSource: where_equal(dataSource),
            });

          const existingRecords = await context.db.Audience.findMany({ where });

          if (existingRecords.length > 0) {
            addValidationError(
              "A record with the same combination of advertisers, tags, dataSource, and dataFilter already exists."
            );
          }
        }
      },
    },
  }),
};
