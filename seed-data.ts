import { getContext } from "@keystone-6/core/context";
import config from "./keystone";
import * as PrismaModule from "@prisma/client";
import { GraphQLInputObjectType, GraphQLObjectType } from "graphql";

const common = {
  listValues: {
    cardinalDirections: [
      { value: "SE", title: "South East" },
      { value: "S", title: "South" },
      { value: "SW", title: "South West" },
      { value: "W", title: "West" },
      { value: "NW", title: "North West" },
      { value: "N", title: "North" },
      { value: "NE", title: "North East" },
      { value: "E", title: "East" },
    ],
    streetSuffixes: [
      { value: "ALY", title: "Alley" },
      { value: "ANX", title: "Annex" },
      { value: "ARC", title: "Arcade" },
      { value: "AVE", title: "Avenue" },
      { value: "AVDA", title: "Avenida" },
      { value: "BLF", title: "Bluff" },
      { value: "BLVD", title: "Boulevard" },
      { value: "BR", title: "Branch" },
      { value: "BRG", title: "Bridge" },
      { value: "BRK", title: "Brook" },
      { value: "BTM", title: "Bottom" },
      { value: "BYU", title: "Bayou" },
      { value: "CALLE", title: "Calle" },
      { value: "CAMINO", title: "Camino" },
      { value: "CIR", title: "Circle" },
      { value: "CLF", title: "Cliff" },
      { value: "CLFS", title: "Cliffs" },
      { value: "CMN", title: "Common" },
      { value: "CMNO", title: "Camino" },
      { value: "CORS", title: "Corner" },
      { value: "COURT", title: "Court" },
      { value: "CP", title: "Camp" },
      { value: "CPE", title: "Cape" },
      { value: "CRK", title: "Creek" },
      { value: "CROSSING", title: "Crossing" },
      { value: "CSWY", title: "Causeway" },
      { value: "CT", title: "Court" },
      { value: "CTS", title: "Courts" },
      { value: "CV", title: "Cove" },
      { value: "CYN", title: "Canyon" },
      { value: "DL", title: "Dale" },
      { value: "DM", title: "Dam" },
      { value: "DR", title: "Drive" },
      { value: "DRS", title: "Drives" },
      { value: "ENT", title: "Entrance" },
      { value: "EST", title: "Estate" },
      { value: "ESTS", title: "Estates" },
      { value: "EXPY", title: "Expressway" },
      { value: "EXT", title: "Extension" },
      { value: "EXTS", title: "Extensions" },
      { value: "FLD", title: "Field" },
      { value: "FLDS", title: "Fields" },
      { value: "FLS", title: "Falls" },
      { value: "FLT", title: "Flat" },
      { value: "FM", title: "Farm" },
      { value: "FRD", title: "Ford" },
      { value: "FRG", title: "Forge" },
      { value: "FRK", title: "Fork" },
      { value: "FRKS", title: "Forks" },
      { value: "FRST", title: "Forest" },
      { value: "FRY", title: "Ferry" },
      { value: "FWY", title: "Freeway" },
      { value: "GDNS", title: "Gardens" },
      { value: "GLN", title: "Glen" },
      { value: "GRN", title: "Green" },
      { value: "GRNS", title: "Greens" },
      { value: "GRVS", title: "Grove" },
      { value: "GTWY", title: "Gateway" },
      { value: "HBR", title: "Harbor" },
      { value: "HVN", title: "Haven" },
      { value: "HWY", title: "Highway" },
      { value: "INLT", title: "Inlet" },
      { value: "IS", title: "Island" },
      { value: "ISLE", title: "Isle" },
      { value: "JCT", title: "Junction" },
      { value: "KNL", title: "Knoll" },
      { value: "KNLS", title: "Knolls" },
      { value: "KY", title: "Key" },
      { value: "KYS", title: "Keys" },
      { value: "LCK", title: "Lock" },
      { value: "LCKS", title: "Locks" },
      { value: "LDG", title: "Lodge" },
      { value: "LF", title: "Loaf" },
      { value: "LGT", title: "Light" },
      { value: "LGTS", title: "Lights" },
      { value: "LNDG", title: "Landing" },
      { value: "LN", title: "Lane" },
      { value: "LKS", title: "Lakes" },
      { value: "MNR", title: "Manor" },
      { value: "MDW", title: "Meadow" },
      { value: "MDWS", title: "Meadows" },
      { value: "MEWS", title: "Mews" },
      { value: "MLS", title: "Mills" },
      { value: "MSN", title: "Mission" },
      { value: "MT", title: "Mount" },
      { value: "MTN", title: "Mountain" },
      { value: "MTNS", title: "Mountains" },
      { value: "MTWY", title: "Motorway" },
      { value: "NCK", title: "Neck" },
      { value: "ORCH", title: "Orchard" },
      { value: "PARK", title: "Park" },
      { value: "PARKWAY", title: "Parkway" },
      { value: "PASAJE", title: "Pasaje" },
      { value: "PASEO", title: "Paseo" },
      { value: "PATH", title: "Path" },
      { value: "PH", title: "Path" },
      { value: "PIKE", title: "Pike" },
      { value: "PL", title: "Place" },
      { value: "PLN", title: "Plain" },
      { value: "PLNS", title: "Plains" },
      { value: "PLZ", title: "Plaza" },
      { value: "PNES", title: "Pines" },
      { value: "PRT", title: "Port" },
      { value: "PTS", title: "Points" },
      { value: "RADL", title: "Radial" },
      { value: "RAMP", title: "Ramp" },
      { value: "RD", title: "Road" },
      { value: "RDG", title: "Ridge" },
      { value: "RDGS", title: "Ridges" },
      { value: "RIV", title: "River" },
      { value: "RNCH", title: "Ranch" },
      { value: "RPD", title: "Rapid" },
      { value: "RPDS", title: "Rapids" },
      { value: "RST", title: "Rest" },
      { value: "ROUTE", title: "Route" },
      { value: "ROW", title: "Row" },
      { value: "RUE", title: "Rue" },
      { value: "RUN", title: "Run" },
      { value: "SHL", title: "Shoal" },
      { value: "SHLS", title: "Shoals" },
      { value: "SHR", title: "Shore" },
      { value: "SHRS", title: "Shores" },
      { value: "SKWY", title: "Skyway" },
      { value: "SPG", title: "Spring" },
      { value: "SPGS", title: "Springs" },
      { value: "SPUR", title: "Spur" },
      { value: "SQ", title: "Square" },
      { value: "SQS", title: "Squares" },
      { value: "STA", title: "Station" },
      { value: "STRA", title: "Stravenue" },
      { value: "STRM", title: "Stream" },
      { value: "ST", title: "Street" },
      { value: "STS", title: "Streets" },
      { value: "TER", title: "Terrace" },
      { value: "TPKE", title: "Turnpike" },
      { value: "TRCE", title: "Trace" },
      { value: "TRAK", title: "Track" },
      { value: "TRL", title: "Trail" },
      { value: "TRWY", title: "Throughway" },
      { value: "TUNL", title: "Tunnel" },
      { value: "US", title: "United States" },
      { value: "UN", title: "Union" },
      { value: "VALLEY", title: "Valley" },
      { value: "VIADUCT", title: "Viaduct" },
      { value: "VL", title: "Ville" },
      { value: "VW", title: "View" },
      { value: "VWS", title: "Views" },
      { value: "VLG", title: "Village" },
    ],
    states: [
      { value: "AK", title: "Alaska" },
      { value: "AL", title: "Alabama" },
      { value: "AR", title: "Arkansas" },
      { value: "AZ", title: "Arizona" },
      { value: "CA", title: "California" },
      { value: "CO", title: "Colorado" },
      { value: "CT", title: "Connecticut" },
      { value: "DC", title: "District of Columbia" },
      { value: "DE", title: "Delaware" },
      { value: "FL", title: "Florida" },
      { value: "GA", title: "Georgia" },
      { value: "HI", title: "Hawaii" },
      { value: "IA", title: "Iowa" },
      { value: "ID", title: "Idaho" },
      { value: "IL", title: "Illinois" },
      { value: "IN", title: "Indiana" },
      { value: "KS", title: "Kansas" },
      { value: "KY", title: "Kentucky" },
      { value: "LA", title: "Louisiana" },
      { value: "MA", title: "Massachusetts" },
      { value: "MD", title: "Maryland" },
      { value: "ME", title: "Maine" },
      { value: "MI", title: "Michigan" },
      { value: "MN", title: "Minnesota" },
      { value: "MO", title: "Missouri" },
      { value: "MS", title: "Mississippi" },
      { value: "MT", title: "Montana" },
      { value: "NC", title: "North Carolina" },
      { value: "ND", title: "North Dakota" },
      { value: "NE", title: "Nebraska" },
      { value: "NH", title: "New Hampshire" },
      { value: "NJ", title: "New Jersey" },
      { value: "NM", title: "New Mexico" },
      { value: "NV", title: "Nevada" },
      { value: "NY", title: "New York" },
      { value: "OH", title: "Ohio" },
      { value: "OK", title: "Oklahoma" },
      { value: "OR", title: "Oregon" },
      { value: "PA", title: "Pennsylvania" },
      { value: "RI", title: "Rhode Island" },
      { value: "SC", title: "South Carolina" },
      { value: "SD", title: "South Dakota" },
      { value: "TN", title: "Tennessee" },
      { value: "TX", title: "Texas" },
      { value: "UT", title: "Utah" },
      { value: "VA", title: "Virginia" },
      { value: "VT", title: "Vermont" },
      { value: "WA", title: "Washington" },
      { value: "WI", title: "Wisconsin" },
      { value: "WV", title: "West Virginia" },
      { value: "WY", title: "Wyoming" },
    ],
  },
};

const filters = {
  address: {
    primaryNumber: {
      label: "Address: Primary Number",
      type: "text",
    },
    streetPredirection: {
      label: "Address: Pre-Direction",
      type: "select",
      valueSources: ["value"],
      fieldSettings: {
        listValues: common.listValues.cardinalDirections,
      },
    },
    streetName: {
      label: "Address: Street Name",
      type: "text",
    },
    streetSuffix: {
      label: "Address: Street Suffix",
      type: "select",
      valueSources: ["value"],
      fieldSettings: {
        listValues: common.listValues.streetSuffixes,
      },
    },
    streetPostdirection: {
      label: "Address: Post-Direction",
      type: "select",
      valueSources: ["value"],
      fieldSettings: {
        listValues: common.listValues.cardinalDirections,
      },
    },
    secondaryDesignator: {
      label: "Address: Secondary Designator",
      type: "text",
    },
    secondaryNumber: {
      label: "Address: Secondary Number",
      type: "text",
    },
    city: {
      label: "Address: City",
      type: "text",
    },
    state: {
      label: "Address: State",
      type: "select",
      valueSources: ["value"],
      fieldSettings: {
        listValues: common.listValues.states,
      },
    },
    zipCode: {
      label: "Address: Zip Code",
      type: "text",
    },
    plus4Code: {
      label: "Address: +4 Code",
      type: "text",
    },
    latitude: {
      label: "Geography: Latitude",
      type: "number",
    },
    longitude: {
      label: "Geography: Longitude",
      type: "number",
    },
    h3_index: {
      label: "Geography: H3 (7)",
      type: "text",
    },
  },
};

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
      filtering: JSON.stringify({
        ID: {
          label: "ID",
          type: "text",
        },
        FIPS: {
          label: "FIPS",
          type: "text",
        },
        datePublished: {
          label: "Meta: Date Published",
          type: "date",
        },
        ...filters.address,
      }),
    },
    {
      title: "DeepSync's Movers Data",
      dataType: { title: "Addresses" },
      filtering: JSON.stringify({
        ...filters.address,
        date: {
          label: "Meta: Date Published",
          type: "date",
        },
        homeOwnership: {
          label: "Demographics: Home Ownership",
          type: "select",
          valueSources: ["value"],
          fieldSettings: {
            listValues: [
              { value: "None" },
              { value: "HomeOwner" },
              { value: "ProbableHomeOwner" },
              { value: "ProbableRenter" },
              { value: "Renter" },
            ],
          },
        },
        addressType: {
          label: "Demographics: Address Type",
          type: "select",
          valueSources: ["value"],
          fieldSettings: {
            listValues: [
              { value: "None" },
              { value: "Highrise" },
              { value: "SingleFamily" },
            ],
          },
        },
        estimatedIncome: {
          label: "Demographics: Estimated Income",
          type: "number",
        },
        estimatedHomeValue: {
          label: "Demographics: Estimated Home Value",
          type: "number",
        },
        estimatedAge: {
          label: "Demographics: Estimated Age",
          type: "number",
        },
      }),
    },
    {
      title: "Esquire's Audience Data",
      dataType: { title: "Device IDs" },
      filtering: JSON.stringify({
        id: {
          label: "ID",
          type: "text",
        },
        tags: {
          label: "Tags",
          type: "text",
        },
      }),
    },
    {
      title: "Esquire's GeoFrame Data",
      dataType: { title: "Polygons" },
      filtering: JSON.stringify({
        id: {
          label: "ID",
          type: "text",
        },
        esqid: {
          label: "ESQ ID (Legacy)",
          type: "text",
        },
      }),
    },
    {
      title: "Esquire's Sales Data",
      dataType: { title: "Addresses" },
      filtering: JSON.stringify({
        ...filters.address,
        client: {
          label: "Client",
          type: "text",
        },
      }),
    },
    {
      title: "FourSquare's POI Data",
      dataType: { title: "Addresses" },
      filtering: JSON.stringify({
        ...filters.address,
      }),
    },
    {
      title: "OpenStreetMaps' Building Footprints",
      dataType: { title: "Polygons" },
      filtering: JSON.stringify({
        ...filters.address,
      }),
    },
  ],
  Audience: [
    {
      tags: "AFW,Ashley,Arizona",
      dataSource: { title: "Esquire's Sales Data" },
      dataFilter: JSON.stringify({
        and: [{ "==": [{ var: "client" }, "AFW???"] }],
      }),
    },
    {
      tags: "California Closets,Atlanta",
      dataSource: { title: "DeepSync's Movers Data" },
      dataFilter: JSON.stringify({
        and: [
          {
            "<=": [
              "2024-01-01T05:00:00.000Z",
              { var: "date" },
              "2024-02-29T05:00:00.000Z",
            ],
          },
          {
            in: [
              { var: "zipCode" },
              [
                "30004",
                "30005",
                "30009",
                "30022",
                "30024",
                "30030",
                "30040",
                "30041",
                "30062",
                "30066",
                "30067",
                "30068",
                "30075",
                "30076",
                "30092",
                "30097",
                "30269",
                "30305",
                "30306",
                "30307",
                "30308",
                "30309",
                "30319",
                "30327",
                "30328",
                "30338",
                "30339",
                "30342",
                "30345",
                "30350",
                "30363",
                "35213",
                "35223",
                "35242",
                "35243",
                "35244",
                "35406",
                "28801",
                "28803",
                "28804",
                "28805",
                "28806",
                "29607",
                "29609",
                "29642",
                "29644",
                "29650",
                "29651",
                "29687",
                "29690",
                "31901",
                "31902",
                "31903",
                "31904",
                "31906",
                "31907",
                "31908",
                "31909",
                "31914",
                "31917",
                "31993",
                "31997",
                "31998",
              ],
            ],
          },
          { ">=": [{ var: "estimatedHomeValue" }, 600000] },
        ],
      }),
    },
    {
      tags: "California Closets,Atlanta",
      dataSource: { title: "Esquire's GeoFrame Data" },
      dataFilter: JSON.stringify({
        and: [
          {
            in: [
              { var: "esqid" },
              [
                "EF~06491",
                "EF~06492",
                "EF~06993",
                "EF~06994",
                "EF~32577",
                "EF~32578",
                "EF~32934",
                "EF~32935",
                "EF~32936",
                "EF~32937",
                "EF~32938",
                "EF~32939",
                "EF~32940",
                "EF~32941",
              ],
            ],
          },
        ],
      }),
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
        try {
          await context.db[listKey].createOne({
            data: await format_query(gqlt, data),
          });
          console.log(
            `Created ${listKey} record with unique fields: ${JSON.stringify(
              whereClause
            )}`
          );
        } catch {
          console.warn(
            `Could not create ${listKey} record with unique fields: ${JSON.stringify(
              whereClause
            )}`
          );
        }
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
