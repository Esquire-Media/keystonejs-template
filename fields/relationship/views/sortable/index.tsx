import React, { Ref, useEffect, useRef } from "react";
import { WrapperProps } from "../../wrapper";
import {
  FieldContainer,
  FieldDescription,
  FieldLegend,
} from "@keystone-ui/fields";
import { useKeystone, useList } from "@keystone-6/core/admin-ui/context";
import { Cards } from "../cards";
import { ListMeta } from "@keystone-6/core/types";

export default function Sortable(props: WrapperProps) {
  const keystone = useKeystone();
  const listRef:Ref<any> = useRef(null);
  const foreignList: ListMeta = useList(props.field.refListKey);
  const localList: ListMeta = useList(props.field.listKey);

  useEffect(() => {
    if (listRef.current?.children) {
      console.log(listRef.current?.children);
    }
  }, [listRef.current?.children]);

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
        stackRef={listRef}
      />
    </FieldContainer>
  );
}
