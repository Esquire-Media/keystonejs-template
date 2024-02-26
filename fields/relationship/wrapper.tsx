import React from "react";
import {
  RelationshipFieldControllerConfig,
  RelationshipController,
} from "./index";
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
export type WrapperProps = FieldProps<typeof controller>;

export const Field = (props: WrapperProps) => {
  if (props.value.kind == "cards-view") {
    if (props.field.refSortField) {
      return <Sortable {...props} />;
    }
    // return Cards(props)
  }
  return _Field(props);
};

export const controller = (
  config: RelationshipFieldControllerConfig
): RelationshipController => {
  return {
    ..._controller(config),
    refSortField: config.fieldMeta.refSortField,
  };
};
