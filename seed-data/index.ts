import { getContext } from "@keystone-6/core/context";
import config from "../keystone";
import * as PrismaModule from "@prisma/client";
import { GraphQLError, GraphQLInputObjectType } from "graphql";
import { KeystoneContext } from "@keystone-6/core/types";
import { sudo_seed_data, seed_data } from "./data";

// load runtime environmental variables
import * as dotenv from 'dotenv';
dotenv.config();

function getUniqueInput(context: KeystoneContext, listKey: string) {
  return Object.keys(
    (
      context.graphql.schema.getTypeMap()[
        listKey + "WhereUniqueInput"
      ] as GraphQLInputObjectType
    )?.getFields() || {}
  ).filter((key) => key !== "id");
}

async function SeedData(
  context: KeystoneContext,
  seed: typeof sudo_seed_data | typeof seed_data
) {
  for (const [listKey, items] of Object.entries(seed)) {
    itemLoop: for (const data of items) {
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === "function") {
          // Call the factory function to get the resolved value
          data[key] = await value(context);
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
          if (error instanceof GraphQLError) {
            console.warn(error.message);
          } else{
            console.error(error)
          }
          
        }
      } else {
        console.log(`Updating existing ${listKey} record.`);
        await context.db[listKey].updateOne({
          where: { id: existingItem.id.toString() },
          data: data,
        });
        data["id"] = existingItem.id;
      }
    }
  }
}

async function main() {
  console.log(`🌱 Inserting seed data`);
  const sudo = getContext(config, PrismaModule).sudo();
  await SeedData(sudo, sudo_seed_data);
  if (process.env.DB_SEED || process.env.DB_SEED === "true")
    await SeedData(
      getContext(config, PrismaModule).withSession({
        itemId: (
          await sudo.db.User.findOne({
            where: { email: sudo_seed_data.User[0].email },
          })
        ).id,
        data: {
          name: sudo_seed_data.User[0].name,
          email: sudo_seed_data.User[0].email,
        },
      }),
      seed_data
    );
  console.log(`✅ Seed data inserted`);
}

main();
