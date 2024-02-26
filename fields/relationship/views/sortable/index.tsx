import React from "react";
import { WrapperProps } from "../../wrapper";
import {
  FieldContainer,
  FieldDescription,
  FieldLegend,
} from "@keystone-ui/fields";
import { useList } from "@keystone-6/core/admin-ui/context";
import { Cards } from "../cards";

export default function Sortable(props: WrapperProps) {
  const foreignList = useList(props.field.refListKey);
  const localList = useList(props.field.listKey);
  console.log(props.value)
  return (
    <FieldContainer as="fieldset">
      <FieldLegend>{props.field.label}</FieldLegend>
      <FieldDescription id={`${props.field.path}-description`}>
        {props.field.description}
      </FieldDescription>
      {/* <Cards
        forceValidation={props.forceValidation}
        field={props.field}
        id={props.value.id}
        value={props.value}
        itemValue={props.itemValue}
        onChange={props.onChange}
        foreignList={foreignList}
        localList={localList}
      /> */}
    </FieldContainer>
  );
}
