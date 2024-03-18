import type { Module } from "../../types";
import {
  Audience,
  DataSource,
  ProcessingStep,
  PublisherEntity,
} from "./models";

export const module: Module = {
  models: {
    DataSource,
    ProcessingStep,
    PublisherEntity,
    Audience,
  },
};
