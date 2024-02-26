import React, { useEffect, useState } from "react";
import { FieldContainer, FieldLabel } from "@keystone-ui/fields";
import {
  getGqlNames,
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
  CellComponent,
  CardValueComponent,
} from "@keystone-6/core/types";
import { FieldMeta } from ".";
import { useKeystone } from "@keystone-6/core/admin-ui/context";
import { CellContainer } from "@keystone-6/core/admin-ui/components";
import {
  fetchGraphQLClient,
  createNestedString,
  selectNestedKey,
} from "../../admin/utils";

import type { Config } from "@react-awesome-query-builder/core";
import DefaultView from "./views/default";
import AntdView from "./views/antd";

// The main Field component, responsible for rendering the custom field in the Admin UI.
export const Field = (props: FieldProps<typeof controller>) => {
  // Utilizes the Keystone context for global state and GraphQL endpoint access.
  const keystone = useKeystone();
  const fetchGraphQL = fetchGraphQLClient(keystone.apiPath);

  // Determines the GraphQL list key and names based on field metadata.
  const listKey = props.field.meta.dependency?.list
    ? props.field.meta.dependency.list
    : props.field.listKey;
  const gqlNames = getGqlNames({
    listKey,
    pluralGraphQLName: keystone.adminMeta.lists[listKey].plural.replace(
      " ",
      ""
    ),
  });

  // State to manage the fields data, fetched based on dependency.
  const [fields, setFields] = useState<any>(props.field.meta.fields || {});

  // Identifies if there's a dependency value to fetch related fields dynamically.
  const dependent =
    props.itemValue && props.field.meta.dependency?.field
      ? props.itemValue?.[props.field.meta.dependency.field.split(".")[0]]
      : undefined;

  // Fetches and updates the field's options based on the dependency's value.
  useEffect(() => {
    if (dependent) {
      const dependentID =
        dependent.value.inner?.value ??
        dependent.value?.value?.id ??
        dependent.value;
      if (typeof dependentID === "object") return;
      if (
        props.field.meta.dependency?.list &&
        props.field.meta.dependency?.field
      ) {
        fetchGraphQL(
          `
          query($id: ID!) {
            item: ${gqlNames.itemQueryName}(where: {id: $id}) {
              ${createNestedString(
                props.field.meta.dependency.field.split(".").slice(1)
              )}
            }
          }
        `,
          { id: dependentID }
        ).then((data) => {
          if (data.item && props.field.meta.dependency?.field) {
            const value = selectNestedKey(
              props.field.meta.dependency.field.split(".").slice(1),
              data.item
            );
            if (value) setFields(JSON.parse(value));
          }
        });
      }
    }
  }, [dependent]);

  const wrappedProps:WrapperProps = {
    ...props,
    value: JSON.parse(props.value || "null"),
    fields: fields,
  };
  let Interface;
  switch (props.field.meta.style) {
    case "antd":
      Interface = AntdView;
      break;
    default:
      Interface = DefaultView;
  }

  // Renders the field's UI in the admin interface.
  return (
    <FieldContainer as="fieldset">
      <FieldLabel as="legend">{props.field.label}</FieldLabel>
      <Interface {...wrappedProps} />
    </FieldContainer>
  );
};

// this is shown on the list view in the table
export const Cell: CellComponent = ({ item, field, linkTo }) => {
  let value = item[field.path] + "";
  return <CellContainer>{value}</CellContainer>;
};
// this is shown on the item page in relationship fields with `displayMode: 'cards'`
export const CardValue: CardValueComponent = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {item[field.path]}
    </FieldContainer>
  );
};

export type WrapperProps = FieldProps<typeof controller> & {
  fields: any;
  config?: Config;
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
