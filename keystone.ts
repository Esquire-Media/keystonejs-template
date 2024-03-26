// Welcome to Keystone!
//
// This file is what Keystone uses as the entry-point to your headless backend
//
// Keystone imports the default export of this file, expecting a Keystone configuration object
//   you can find out more at https://keystonejs.com/docs/apis/config

import { config } from "@keystone-6/core";
import { DatabaseProvider } from "@keystone-6/core/types";

// load runtime environmental variables
import * as dotenv from "dotenv";
dotenv.config();

import { withAuth, app } from "./modules";

export default withAuth(
  config({
    db: {
      // we're using sqlite for the fastest startup experience
      //   for more information on what database might be appropriate for you
      //   see https://keystonejs.com/docs/guides/choosing-a-database#title
      provider: (process.env.DB_TYPE as DatabaseProvider) || "sqlite",
      url: process.env.DB_URL || "file:./keystone.db",
    },
    ...app,
  })
);

const test = "test"