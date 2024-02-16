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
} from "@keystone-6/core/fields";
import { stars } from "./fields/stars"

const auditable_fields: BaseFields<any> = {
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
      ...auditable_fields,
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
      ...auditable_fields,
      dataType: relationship({
        ref: "DataType",
        ui: {
          labelField: "title",
        },
      }),
      title: text({
        validation: {
          isRequired: true,
        },
        isIndexed: "unique",
      }),
      rating: stars()
    },
  }),
  ProcessingStep: list({
    access: allowAll,
    fields: {
      ...auditable_fields,
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
  Audience: list({
    access: allowAll,
    fields: {
      ...auditable_fields,
      tags: text(),
      status: checkbox(),
      dataSource: relationship({
        ref: "DataSource",
        ui: {
          labelField: "title",
          hideCreate: true,
        },
      }),
      dataFilter: json(),
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
  }),
};
