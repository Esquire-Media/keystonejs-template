import { list } from "@keystone-6/core";
import { integer, codeblock, relationship } from "../../fields";
import { allowAll } from "@keystone-6/core/access";
import { auditable } from "../auth";

const ProcessingStep = list({
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
});

export default ProcessingStep;
