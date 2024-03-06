import {
  type BaseListTypeInfo,
  FieldControllerConfig,
  FieldController,
} from "@keystone-6/core/types";
import { TextFieldConfig } from "@keystone-6/core/fields";

export type CodeBlockViewProps = {
  widget?: "monaco";
  language?: string;
  theme?: string;
  options?: any;
};
export type CodeBlockFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  TextFieldConfig<ListTypeInfo> & {
    ui?: CodeBlockViewProps;
  };
export type CodeBlockControllerConfig = FieldControllerConfig<
  import("@keystone-6/core/src/fields/types/text").TextFieldMeta
> & {
  fieldMeta: { viewProps: CodeBlockViewProps };
};
type Validation = {
  isRequired: boolean;
  match: { regex: RegExp; explanation: string | null } | null;
  length: { min: number | null; max: number | null };
};
type InnerTextValue =
  | { kind: "null"; prev: string }
  | { kind: "value"; value: string };
type TextValue =
  | { kind: "create"; inner: InnerTextValue }
  | { kind: "update"; inner: InnerTextValue; initial: InnerTextValue };
export type CodeBlockController = FieldController<TextValue, string> & {
  displayMode: "input" | "textarea" | "monaco";
  validation: Validation;
  isNullable: boolean;
  viewProps?: CodeBlockViewProps;
};
