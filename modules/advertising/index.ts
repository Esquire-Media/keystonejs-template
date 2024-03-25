import type { Module } from "../../types";
import {
  Audience,
  DataSource,
  GeoFrame,
  ProcessingStep,
  PublisherEntity,
} from "./models";

export const module: Module = {
  models: {
    Audience,
    DataSource,
    GeoFrame,
    ProcessingStep,
    PublisherEntity,
  },
};
