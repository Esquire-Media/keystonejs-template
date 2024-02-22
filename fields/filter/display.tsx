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

// The main Field component, responsible for rendering the custom field in the Admin UI.
export const Field = ({
  field,
  value,
  itemValue,
  onChange,
}: FieldProps<typeof controller>) => {
  // Utilizes the Keystone context for global state and GraphQL endpoint access.
  const keystone = useKeystone();
  const fetchGraphQL = fetchGraphQLClient(keystone.apiPath);

  // Determines the GraphQL list key and names based on field metadata.
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

  // State to manage the fields data, fetched based on dependency.
  const [fields, setFields] = useState<any>(field.meta.fields || {});

  // Identifies if there's a dependency value to fetch related fields dynamically.
  const dependent =
    itemValue && field.meta.dependency?.field
      ? itemValue?.[field.meta.dependency.field.split(".")[0]]
      : undefined;

  // Fetches and updates the field's options based on the dependency's value.
  useEffect(() => {
    if (dependent) {
      const dependentID =
        dependent.value.inner?.value ??
        dependent.value?.value?.id ??
        dependent.value;
      if (typeof dependentID === "object") return;
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
          if (data.item && field.meta.dependency?.field) {
            const value = selectNestedKey(
              field.meta.dependency.field.split(".").slice(1),
              data.item
            );
            if (value) setFields(JSON.parse(value));
          }
        });
      }
    }
  }, [dependent]);

  // Renders the field's UI in the admin interface.
  return (
    <FieldContainer as="fieldset">
      <FieldLabel as="legend">{field.label}</FieldLabel>
      <Interface
        value={JSON.parse(value || "null")}
        fields={fields}
        onChange={onChange}
      />
    </FieldContainer>
  );
};

// Cell component for displaying the field's value in list views.
export const Cell: CellComponent<typeof controller> = ({
  item,
  field,
  linkTo,
}) => {
  let value = "hello world"; // Placeholder value, adjust as needed.
  return linkTo ? (
    <CellLink {...linkTo}>{value}</CellLink>
  ) : (
    <CellContainer>{value}</CellContainer>
  );
};
Cell.supportsLinkTo = true;

// CardValue component for displaying the field in card views, such as in relationship fields.
export const CardValue: CardValueComponent<typeof controller> = ({
  item,
  field,
}) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      hello world // Placeholder content, customize as needed.
    </FieldContainer>
  );
};

// Controller for managing the field's state and interactions with the Keystone backend.
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
