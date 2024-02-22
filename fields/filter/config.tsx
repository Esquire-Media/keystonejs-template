import React from "react";
import type { Config, Widget, Operator } from "@react-awesome-query-builder/ui";
import { BasicConfig } from "@react-awesome-query-builder/ui";
import ListInputWidget from "./widgets/ListInput";

export default (init: Config = BasicConfig): Config =>
  ({
    ...init,
  } as Config);
