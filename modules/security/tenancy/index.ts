import type { Module } from "../../../types";
import { User, Tenant } from "./models";
import * as dotenv from "dotenv";

dotenv.config();
export const env = {
  TENANT_GLOBAL_TITLE: process.env.TENANT_GLOBAL_TITLE || "Global",
};
export const module: Module = {
  env,
  models: { User, Tenant },
};
