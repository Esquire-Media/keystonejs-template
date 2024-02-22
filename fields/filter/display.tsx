import React, { useEffect, useState, useMemo } from "react";
import { FieldContainer, FieldLabel } from "@keystone-ui/fields";
import {
  getGqlNames,
  type CardValueComponent,
  type CellComponent,
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
} from "@keystone-6/core/types";
import { CellContainer, CellLink } from "@keystone-6/core/admin-ui/components";
import { FieldMeta } from ".";
import Interface from "./interface";
import { useKeystone } from "@keystone-6/core/admin-ui/context";
import {
  fetchGraphQLClient,
  createNestedString,
  selectNestedKey,
} from "../../admin/utils";

export const Field = ({
  field,
  value,
  itemValue,
  onChange,
}: FieldProps<typeof controller>) => {
  const keystone = useKeystone();
  const fetchGraphQL = fetchGraphQLClient(keystone.apiPath);
  const listKey = field.meta.dependency?.list
    ? field.meta.dependency.list
    : field.listKey;
  const gqlNames = getGqlNames({
    listKey,
    pluralGraphQLName: keystone.adminMeta.lists[listKey].plural.replace(
      " ",
      ""
    ),
  });
  const [fields, setFields] = useState<any>(field.meta.fields || {});
  const dependent =
    itemValue && field.meta.dependency?.field
      ? itemValue?.[field.meta.dependency.field.split(".")[0]]
      : undefined;
  useEffect(() => {
    if (dependent) {
      const dependentID =
        dependent.value.inner?.value ??
        dependent.value?.value?.id ??
        dependent.value;
      if (typeof dependentID === "object") return
      if (field.meta.dependency?.list && field.meta.dependency?.field) {
        fetchGraphQL(
          `
          query($id: ID!) {
            item: ${gqlNames.itemQueryName}(where: {id: $id}) {
              ${createNestedString(
                field.meta.dependency.field.split(".").slice(1)
              )}
            }
          }
        `,
          { id: dependentID }
        ).then((data) => {
          if (data.item) {
            if (field.meta.dependency?.field) {
              const value =
                selectNestedKey(
                  field.meta.dependency.field.split(".").slice(1),
                  data.item
                ) || "{}";
              setFields(JSON.parse(value));
            }
          }
        });
      }
    }
  }, [dependent]);
  useEffect(() => {
    console.log(fields);
  }, [fields]);
  return (
    <FieldContainer as="fieldset">
      <FieldLabel as="legend">{field.label}</FieldLabel>
      {Object.keys(fields).length === 0 ? (<Interface
        value={JSON.parse(value || "null")}
        fields={fields}
        onChange={onChange}
      />) : null}
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
): FieldController<string | null, string> & {
  meta: FieldMeta;
  listKey: string;
} => {
  return {
    meta: config.fieldMeta,
    listKey: config.listKey,
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
