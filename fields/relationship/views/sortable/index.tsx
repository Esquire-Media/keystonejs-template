import React from "react";
import { WrapperProps } from "../../wrapper";
import {
  FieldContainer,
  FieldDescription,
  FieldLegend,
} from "@keystone-ui/fields";
import { useKeystone, useList } from '@keystone-6/core/admin-ui/context'
import { Cards } from "../cards";
import { ListMeta } from "@keystone-6/core/types";
import { Items, useItemState } from "../cards/useItemState";

export default function Sortable(props: WrapperProps) {
  const keystone = useKeystone()
  const foreignList: ListMeta = useList(props.field.refListKey)
  const localList: ListMeta = useList(props.field.listKey)
  return (
    <FieldContainer as="fieldset">
      <FieldLegend>{props.field.label}</FieldLegend>
      <FieldDescription id={`${props.field.path}-description`}>
        {props.field.description}
      </FieldDescription>
      <Cards
        forceValidation={props.forceValidation}
        field={props.field}
        id={props.value.id}
        value={props.value}
        itemValue={props.itemValue}
        onChange={props.onChange}
        foreignList={foreignList}
        localList={localList}
      />
    </FieldContainer>
  );
}
