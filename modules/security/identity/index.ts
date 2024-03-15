import type { Module } from "../../../types";
import { isLoggedIn } from "./logic";
import { User } from "./models";

export const module: Module = {
  models: { User },
  checks: { isLoggedIn },
};
