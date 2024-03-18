import type { Module } from "../../../types";
import { can } from "./logic";
import { User, Tenant, Permission } from "./models";

export const module: Module = {
  models: { User, Tenant, Permission },
  checks: { can },
};
