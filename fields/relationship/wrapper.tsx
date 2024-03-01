import React from "react";
import type {
  RelationshipControllerConfig,
  RelationshipController,
} from "./types";
import {
  Field as _Field,
  controller as _controller,
  Cell,
  CardValue,
} from "@keystone-6/core/fields/types/relationship/views";
import type { FieldProps } from "@keystone-6/core/types";
import Sortable from "./views/sortable";
import { Cards } from "./views/cards";

export { Cell, CardValue };
export type WrapperProps = FieldProps<typeof controller> & {
  id: string | null;
  value: { kind: "cards-view" };
};

export const Field = (props: WrapperProps) => {
  if (props.value.kind == "cards-view") {
    if (props.value.displayOptions.orderBy) {
      return <Sortable {...props} />;
    }
    return <Cards { ...props } id={props.value.id} />;
  }
  return _Field(props);
};

export const controller = (
  config: RelationshipControllerConfig
): RelationshipController => {
  const context: RelationshipController = _controller(config);
  context.refOrderBy = config.fieldMeta.refOrderBy;
  if (
    context.defaultValue.kind === "cards-view" &&
    config.fieldMeta.displayMode === "cards"
  ) {
    context.defaultValue.displayOptions.orderBy = config.fieldMeta.orderBy;
  }
  return context;
};
