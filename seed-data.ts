import { getContext } from "@keystone-6/core/context";
import config from "./keystone";
import * as PrismaModule from "@prisma/client";
import { GraphQLInputObjectType, GraphQLObjectType } from "graphql";

const seed_data: { [listKey: string]: any } = {
  DemandSidePlatform: [
    { title: "Meta" },
    { title: "OneView" },
    { title: "Xandr" },
  ],
  DataType: [
    { title: "Addresses" },
    { title: "Device IDs" },
    { title: "Polygons" },
  ],
  DataSource: [
    {
      title: "Attom's Estated Data",
      dataType: { title: "Addresses" },
    },
    {
      title: "DeepSync's Movers Data",
      dataType: { title: "Addresses" },
    },
    {
      title: "Esquire's Audience Data",
      dataType: { title: "Device IDs" },
    },
    {
      title: "Esquire's GeoFrame Data",
      dataType: { title: "Polygons" },
    },
    {
      title: "Esquire's Sales Data",
      dataType: { title: "Addresses" },
    },
    {
      title: "FourSquare's POI Data",
      dataType: { title: "Addresses" },
    },
    {
      title: "OpenStreetMaps' Building Footprints",
      dataType: { title: "Polygons" },
    },
  ],
  Audience: [
    {
      tags: "AFW,Ashley,Arizona",
      dataSource: { title: "Esquire's Sales Data" },
      dataFilter:
        '{"_and":[{"client":{"_eq":"AFW???"},"date":{"_between":["???","???"]},"???":{"_???":"???"}}]}',
    },
    {
      tags: "California Closets,Atlanta",
      dataSource: { title: "DeepSync's Movers Data" },
      dataFilter:
        '{"_and":[{"zipcode":{"_in":["30004","30005","30009","30022","30024","30030","30040","30041","30062","30066","30067","30068","30075","30076","30092","30097","30269","30305","30306","30307","30308","30309","30319","30327","30328","30338","30339","30342","30345","30350","30363","35213","35223","35242","35243","35244","35406","28801","28803","28804","28805","28806","29607","29609","29642","29644","29650","29651","29687","29690","31901","31902","31903","31904","31906","31907","31908","31909","31914","31917","31993","31997","31998"]}},{"date":{"_gt":"$NOW(-9 months)"}},{"estimatedHomeValue":{"_gt":600000}}]}',
    },
    {
      tags: "California Closets,Atlanta",
      dataSource: { title: "Esquire's GeoFrame Data" },
      dataFilter:
        '{"_and":[{"esqid":{"_in":["EF~06491","EF~06492","EF~06993","EF~06994","EF~32577","EF~32578","EF~32934","EF~32935","EF~32936","EF~32937","EF~32938","EF~32939","EF~32940","EF~32941"]}}]}',
    },
  ],
};

async function main() {
  const context = getContext(config, PrismaModule);

  const format_query = async (list: GraphQLObjectType, data: any) => {
    for (const key of Object.keys(data)) {
      const field = list.getFields()[key];
      if (
        field.type instanceof GraphQLObjectType &&
        !data[key].hasOwnProperty("create")
      ) {
        const relatedItem = await context.db[field.type.name].findOne({
          where: data[key],
        });
        if (relatedItem) {
          data[key] = { connect: { id: relatedItem.id } };
        } else {
          console.error(
            `Related item not found for key: ${key} and title: ${data[key]}`
          );
        }
      }
    }
    return data;
  };

  console.log(`🌱 Inserting seed data`);
  for (const [listKey, items] of Object.entries(seed_data)) {
    const gqlt = context.graphql.schema.getTypeMap()[
      listKey
    ] as GraphQLObjectType;
    const uniqueFields = Object.keys(
      (
        context.graphql.schema.getTypeMap()[
          listKey + "WhereUniqueInput"
        ] as GraphQLInputObjectType
      ).getFields()
    ).filter((key) => key !== "id");
    for (const data of items) {
      const whereClause: { [key: string]: any } = {};
      uniqueFields.forEach((fieldName: string) => {
        if (data.hasOwnProperty(fieldName)) {
          whereClause[fieldName] = (data as any)[fieldName];
        }
      });
      const existingItem = await context.db[listKey].findOne({
        where: whereClause,
      });
      if (!existingItem) {
        console.log(
          `Creating ${listKey} record with unique fields: ${JSON.stringify(
            whereClause
          )}`
        );
        await context.db[listKey].createOne({
          data: await format_query(gqlt, data),
        });
      } else {
        console.log(
          `Updating existing ${listKey} record with unique fields: ${JSON.stringify(
            whereClause
          )}`
        );
        await context.db[listKey].updateOne({
          where: { id: existingItem.id },
          data: await format_query(gqlt, data),
        });
      }
    }
  }
  console.log(`✅ Seed data inserted`);
}

main();
