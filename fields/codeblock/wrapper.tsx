import React from "react";
import {
  Field as _Field,
  controller as _controller,
  Cell,
  CardValue,
} from "@keystone-6/core/fields/types/text/views";
import type { FieldProps } from "@keystone-6/core/types";
import type { CodeBlockController, CodeBlockControllerConfig } from "./types";
import DefaultView from "./views/default";

export { Cell, CardValue };
export type WrapperProps = FieldProps<typeof controller> & {};

export const Field = (props: WrapperProps) => {
  if (!props.field.viewProps?.widget) {
    return _Field(props);
  }
  return <DefaultView {...props} />;
};

export const controller = (
  config: CodeBlockControllerConfig
): CodeBlockController => {
  const context: CodeBlockController = _controller(config);
  context.viewProps = config.fieldMeta.viewProps;
  return context;
};
