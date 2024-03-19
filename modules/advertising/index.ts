import type { Module } from "../../types";
import {
  Audience,
  DataSource,
  Geoframe,
  ProcessingStep,
  PublisherEntity,
} from "./models";

export const module: Module = {
  models: {
    Audience,
    DataSource,
    Geoframe,
    ProcessingStep,
    PublisherEntity,
  },
};
