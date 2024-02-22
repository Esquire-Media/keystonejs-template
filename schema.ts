import { list, BaseFields } from "@keystone-6/core";
import { allowAll } from "@keystone-6/core/access";
import type { Lists } from ".keystone/types";

import {
  text,
  relationship,
  password,
  timestamp,
  integer,
  checkbox,
  json,
  select,
} from "@keystone-6/core/fields";

import * as Fields from "./fields";

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

export const lists: Lists = {
  User: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({
        validation: { isRequired: true },
        isIndexed: "unique",
      }),
      password: password({ validation: { isRequired: true } }),
      createdAt: timestamp({
        defaultValue: { kind: "now" },
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
      filtering: json({ defaultValue: {} }),
    },
  }),
  ProcessingStep: list({
    access: allowAll,
    fields: {
      ...auditable,
      outputType: relationship({
        ref: "DataType",
        ui: {
          labelField: "title",
          hideCreate: true,
        },
      }),
      audience: relationship({
        ref: "Audience.processes",
        ui: {
          listView: { fieldMode: "hidden" },
          createView: { fieldMode: "hidden" },
          itemView: { fieldMode: "read" },
        },
        many: false,
      }),
      sort: integer({ ui: { createView: { fieldMode: "hidden" } } }),
      customCoding: json(),
    },
  }),

  DemandSidePlatform: list({
    access: allowAll,
    fields: {
      ...auditable,
      title: text({
        validation: { isRequired: true },
        isIndexed: "unique",
      }),
    },
  }),
  DSPEntity: list({
    access: allowAll,
    fields: {
      ...auditable,
      demandSidePlatform: relationship({
        ref: "DemandSidePlatform",
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

  Audience: list({
    access: allowAll,
    fields: {
      ...auditable,
      tags: text(),
      status: checkbox({ defaultValue: true }),
      rebuildFrequency: integer({ defaultValue: 1 }),
      rebuildUnit: select({
        type: "enum",
        options: [
          { label: "Day(s)", value: "days" },
          { label: "Month(s)", value: "months" },
        ],
        defaultValue: "days",
      }),
      timeToLive: integer({ defaultValue: 0 }),
      TTLUnit: select({
        type: "enum",
        options: [
          { label: "Day(s)", value: "days" },
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
      dataFilter: Fields.filter({
        ui: {
          // ref: "DataSource.dataType",
          dependency: {
            field: "dataSource.filtering",
          },
          // fields: {
          //   qty: {
          //     label: "Qty",
          //     type: "number",
          //     fieldSettings: {
          //       min: 0,
          //     },
          //     valueSources: ["value"],
          //     preferWidgets: ["number"],
          //   },
          //   price: {
          //     label: "Price",
          //     type: "number",
          //     valueSources: ["value"],
          //     fieldSettings: {
          //       min: 10,
          //       max: 100,
          //     },
          //     preferWidgets: ["slider", "rangeslider"],
          //   },
          //   name: {
          //     label: "Name",
          //     type: "text",
          //   },
          //   color: {
          //     label: "Color",
          //     type: "select",
          //     valueSources: ["value"],
          //     fieldSettings: {
          //       listValues: [
          //         { value: "yellow", title: "Yellow" },
          //         { value: "green", title: "Green" },
          //         { value: "orange", title: "Orange" },
          //       ],
          //     },
          //   },
          //   is_promotion: {
          //     label: "Promo?",
          //     type: "boolean",
          //     operators: ["equal"],
          //     valueSources: ["value"],
          //   },
          // },
        },
      }),
      processes: relationship({
        ref: "ProcessingStep.audience",
        many: true,
        ui: {
          displayMode: "cards",
          cardFields: ["outputType"],
          inlineEdit: { fields: ["outputType", "customCoding"] },
          inlineCreate: { fields: ["outputType", "customCoding"] },
        },
      }),
    },
    db: {
      extendPrismaSchema: (schema) => {
        return schema.replace(
          /(model [^}]+)}/g,
          "$1@@unique([tags, dataSourceId, dataFilter])\n}"
        );
      },
    },
  }),
};
