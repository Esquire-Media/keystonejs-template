import React, { useEffect } from "react";
import {
  FieldContainer,
  FieldDescription,
  FieldLabel,
} from "@keystone-ui/fields";
import {
  type CardValueComponent,
  type CellComponent,
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
} from "@keystone-6/core/types";
import { CellContainer, CellLink } from "@keystone-6/core/admin-ui/components";
import { FieldMeta } from ".";

export const Field = ({
  field,
  value,
  itemValue,
  onChange,
  autoFocus,
}: FieldProps<typeof controller>) => {
  let filterOptions: FieldMeta['filterOptions'] = field.meta.filterOptions || {};
  if (field.meta.dependency?.field) {
    const dependent: any = (itemValue as any)?.[field.meta.dependency.field] || null;

    useEffect(() => {
      if (dependent) onChange?.("");
    }, [onChange, dependent]);

    if (!dependent) return null;

    const dependentValue =
      dependent.value.inner?.value ?? dependent.value?.value ?? dependent.value;

    console.log(dependentValue);
  }
  return (
    <FieldContainer as="fieldset">
      <FieldLabel as="legend">{field.label}</FieldLabel>
      <div>{JSON.stringify(filterOptions)}</div>
    </FieldContainer>
  );
};

export const Cell: CellComponent<typeof controller> = ({
  item,
  field,
  linkTo,
}) => {
  let value = "hello world";
  return linkTo ? (
    <CellLink {...linkTo}>{value}</CellLink>
  ) : (
    <CellContainer>{value}</CellContainer>
  );
};

Cell.supportsLinkTo = true;

// this is shown on the item page in relationship fields with `displayMode: 'cards'`
export const CardValue: CardValueComponent<typeof controller> = ({
  item,
  field,
}) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      hello world
    </FieldContainer>
  );
};

export const controller = (
  config: FieldControllerConfig<FieldMeta>
): FieldController<string | null, string> & { meta: FieldMeta } => {
  return {
    meta: config.fieldMeta,
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: null,
    deserialize: (data) => {
      const value = data[config.path];
      return typeof value === "string" ? value : null;
    },
    serialize: (value) => ({ [config.path]: value }),
  };
};
