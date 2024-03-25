import type { Module } from "../../types";
import {
  Audience,
  DataSource,
  Geography,
  ProcessingStep,
  PublisherEntity,
} from "./models";

export const module: Module = {
  models: {
    Audience,
    DataSource,
    Geography,
    ProcessingStep,
    PublisherEntity,
  },
};
