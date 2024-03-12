import { getContext } from "@keystone-6/core/context";
import config from "../keystone";
import * as PrismaModule from "@prisma/client";
import { GraphQLError, GraphQLInputObjectType } from "graphql";
import { KeystoneContext } from "@keystone-6/core/types";
import seed_data from "./data";

function getUniqueInput(context: KeystoneContext<any>, listKey: string) {
  return Object.keys(
    (
      context.graphql.schema.getTypeMap()[
        listKey + "WhereUniqueInput"
      ] as GraphQLInputObjectType
    )?.getFields() || {}
  ).filter((key) => key !== "id");
}

async function main() {
  const context = getContext(config, PrismaModule);

  console.log(`🌱 Inserting seed data`);
  listLoop: for (const [listKey, items] of Object.entries(seed_data)) {
    itemLoop: for (const data of items) {
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === "function") {
          // Call the factory function to get the resolved value
          data[key] = value(seed_data);
          if (!data[key]) {
            continue itemLoop;
          }
        }
      }

      const whereClause: { [key: string]: any } = {};
      getUniqueInput(context, listKey).forEach((fieldName: string) => {
        if (data.hasOwnProperty(fieldName)) {
          whereClause[fieldName] = (data as any)[fieldName];
        }
      });
      const existingItem = await context.db[listKey].findOne({
        where: whereClause,
      });
      if (!existingItem) {
        try {
          const item = await context.db[listKey].createOne({
            data,
          });
          console.log(`Created ${listKey} record.`);
          data["id"] = item.id;
        } catch (error) {
          console.warn((error as GraphQLError).message);
        }
      } else {
        console.log(`Updating existing ${listKey} record.`);
        await context.db[listKey].updateOne({
          where: { id: existingItem.id },
          data: data,
        });
        data["id"] = existingItem.id;
      }
    }
  }
  console.log(`✅ Seed data inserted`);
}

main();
