import React from "react";
import { FieldContainer, FieldDescription, FieldLabel } from "@keystone-ui/fields";
import {
  type CardValueComponent,
  type CellComponent,
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
} from "@keystone-6/core/types";
import { CellContainer, CellLink } from "@keystone-6/core/admin-ui/components";
import { FilterOptions } from ".";

export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => {
  console.log(field);
  return (
    <FieldContainer as="fieldset">
      <FieldLabel as="legend">{field.label}</FieldLabel>
      <div>{JSON.stringify(field)}</div>
    </FieldContainer>
  );
};

export const Cell: CellComponent<typeof controller> = ({ item, field, linkTo }) => {
  let value = "hello world";
  return linkTo ? <CellLink {...linkTo}>{value}</CellLink> : <CellContainer>{value}</CellContainer>;
};

Cell.supportsLinkTo = true;

// this is shown on the item page in relationship fields with `displayMode: 'cards'`
export const CardValue: CardValueComponent<typeof controller> = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      hello world
    </FieldContainer>
  );
};

type Options = { filterOptions: FilterOptions | null; basedOn: string; };
export const controller = (
  config: FieldControllerConfig<Options>
): FieldController<number | null, string> & Options => {
  console.log(config);
  return {
    basedOn: config.fieldMeta.basedOn,
    filterOptions: config.fieldMeta.filterOptions,
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: null,
    deserialize: (data) => data[config.path],
    serialize: (value) => ({ [config.path]: value }),
  };
};
