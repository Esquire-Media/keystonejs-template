import { getContext } from "@keystone-6/core/context";
import config from "./keystone";
import * as PrismaModule from "@prisma/client";

const DataTypes = [
  { title: "Addresses" },
  { title: "Device IDs" },
  { title: "Polygons" },
];

const DataSource = [
  { title: "Attom's Estated Data", dataType: "Addresses" },
  { title: "DeepSync's Movers Data", dataType: "Addresses" },
  { title: "Esquire's Audience Data", dataType: "Device IDs" },
  { title: "Esquire's GeoFrame Data", dataType: "Polygons" },
  { title: "Esquire's Sales Data", dataType: "Addresses" },
  { title: "FourSquare's POI Data", dataType: "Addresses" },
  { title: "OpenStreetMaps' Building Footprints", dataType: "Polygons" },
];

async function main() {
  const context = getContext(config, PrismaModule);

  const create_DataType = async (data: any) => {
    const item = await context.db.DataType.findOne({
      where: { title: data.title },
    });
    if (!item) {
      await context.db.DataType.createOne({
        data: { title: data.title },
      });
    }
  };

  const create_DataSource = async (data: any) => {
    const item = await context.db.DataSource.findOne({
      where: { title: data.title },
    });
    if (!item) {
      const i = await context.db.DataType.findOne({
        where: { title: data.dataType },
      });
      await context.db.DataSource.createOne({
        data: { title: data.title, dataType: { connect: { id: i.id } } },
      });
    }
  };

  console.log(`🌱 Inserting seed data`);
  for (const data of DataTypes) {
    console.log(`Adding data type: ${data.title}`)
    await create_DataType(data)
  }
  for (const data of DataSource) {
    console.log(`Adding data source: ${data.title}`)
    await create_DataSource(data)
  }

  console.log(`✅ Seed data inserted`);
}

main();
