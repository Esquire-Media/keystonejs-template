import React from "react";
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from "@keystone-6/core/types";
import {
  FieldContainer,
  FieldDescription,
  FieldLabel,
} from "@keystone-ui/fields";
import { CellContainer, CellLink } from "@keystone-6/core/admin-ui/components";
import MapMain from "./ReactMapGL/MapMain";

export const Field = (props: FieldProps<typeof controller>) => {
  /* States */
  const [mapRef, setMapRef] = React.useState<any>();
  const draw = mapRef?.current
    .getMap()
    ._controls.filter((e: any) => Object.keys(e).includes("getSelected"))[0];

  return (
    <FieldContainer as="fieldset">
      <FieldLabel as="legend">{props.field.label}</FieldLabel>
      <FieldDescription id={`${props.field.path}-description`}>
        {props.field.description}
      </FieldDescription>
      <div style={{ width: 400, height: 400 }}>
        <MapMain passupFn={setMapRef} />
      </div>
    </FieldContainer>
  );
};

// this is shown on the item page in relationship fields with `displayMode: 'cards'`
export const CardValue: CardValueComponent = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {item[field.path]}
      Showing "CardValue"
    </FieldContainer>
  );
};

// this is shown on the list view in the table
export const Cell: CellComponent = ({ item, field, linkTo }) => {
  let value = item[field.path] + "";
  return linkTo ? (
    <CellLink {...linkTo}>{value}</CellLink>
  ) : (
    <CellContainer>{value}</CellContainer>
  );
};
// setting supportsLinksTo means the cell component allows containing a link to the item
// for example, text fields support it but relationship fields don't because
// their cell component links to the related item so it can't link to the item that the relationship is on
Cell.supportsLinkTo = true;

// Controller for managing the field's state and interactions with the Keystone backend.
export const controller = (
  config: FieldControllerConfig<any>
): FieldController<string | null, string> => {
  return {
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
