import React, { useEffect, useState } from "react";
import { FieldContainer, FieldLabel } from "@keystone-ui/fields";
import {
  type CardValueComponent,
  type CellComponent,
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
} from "@keystone-6/core/types";
import { CellContainer, CellLink } from "@keystone-6/core/admin-ui/components";
import { FieldMeta } from ".";
import Interface from "./interface";

export const Field = ({
  field,
  value,
  itemValue,
  onChange,
  autoFocus,
}: FieldProps<typeof controller>) => {
  const [config, setFilterOptions] = useState<
    FieldMeta["config"]
  >(field.meta.config || {});
  // Return null if there's no dependent value to avoid rendering
  if (field.meta.dependency?.field) {
    if (!itemValue?.[field.meta.dependency?.field]) return null;
    const dependent: any =
      (itemValue as any)?.[field.meta.dependency.field] || null;

    useEffect(() => {
      if (dependent) {
        // Calculate the new filter options based on the dependency
        const dependentValue =
          dependent.value.inner?.value ??
          dependent.value?.value ??
          dependent.value;

        let newFilterOptions = {};
        if (dependentValue instanceof Object) {
          if (dependentValue.hasOwnProperty("data")) {
            newFilterOptions = {
              id: dependentValue.id,
              listKey: dependentValue.data.__typename,
            };
          } else {
            newFilterOptions = {
              id: dependentValue.id,
            };
          }
        } else {
          newFilterOptions = dependentValue;
        }

        // Update the config state
        setFilterOptions(newFilterOptions);
        // Optionally, trigger any change handlers if needed
        onChange?.(value);
      }
    }, [dependent, onChange, value]);
  }

  return (
    <FieldContainer as="fieldset">
      <FieldLabel as="legend">{field.label}</FieldLabel>
      <Interface value={value || ""} config={config || {}} onChange={onChange} />
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
