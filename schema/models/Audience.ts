import { list } from "@keystone-6/core";
import { checkbox, integer, select, filter, relationship, json } from "../../fields";
import { allowAll } from "@keystone-6/core/access";
import { auditable } from "../auth";

const Audience = list({
  access: allowAll,
  fields: {
    ...auditable,
    geoframe: json({
      ui: {
        views: "./fields/geoframe/wrapper"
      }
    }),
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
            ...resolvedData.advertisers.connect.map((value: any) => ({
              advertisers: { some: where_equal(value) },
            }))
          );
        if (resolvedData.advertisers?.create instanceof Array)
          where.AND.push(
            ...resolvedData.advertisers.create.map((value: any) => ({
              advertisers: { some: where_equal(value) },
            }))
          );
        if (resolvedData.tags?.connect instanceof Array)
          where.AND.push(
            ...resolvedData.tags.connect.map((value: any) => ({
              tags: { some: where_equal(value) },
            }))
          );
        if (resolvedData.tags?.create instanceof Array)
          where.AND.push(
            ...resolvedData.tags.create.map((value: any) => ({
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
});

export default Audience;
