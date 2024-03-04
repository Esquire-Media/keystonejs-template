import React, { Ref, useRef } from "react";
import { WrapperProps } from "../../wrapper";
import {
  FieldContainer,
  FieldDescription,
  FieldLegend,
} from "@keystone-ui/fields";
import { useKeystone, useList } from "@keystone-6/core/admin-ui/context";
import { Droppable, Draggable, DragDropContext } from "react-beautiful-dnd";
import { Cards } from "../cards";
import type {
  ItemWrapperFactory,
  ListCardContainerProps,
  ListWrapperFactory,
} from "../cards/components/List";
import "./styles.css";

export default function Sortable(props: WrapperProps) {
  const droppable: Ref<HTMLOListElement> = useRef(null);
  const onDragEnd = (result, listProps: ListCardContainerProps) => {
    const context = {
      listKey: props.field.listKey,
      recordId: props.value.id,
      refListKey: props.field.refListKey,
      sortField: props.value.displayOptions.orderBy,
      originalItemOrder: listProps.currentIdsArrayWithFetchedItems
        .sort(
          (a, b) =>
            a.itemGetter.path.slice(-1)[0] - b.itemGetter.path.slice(-1)[0]
        )
        .map((item) => item.id),
    };
    console.log(context, result);
  };
  const listWrapper: ListWrapperFactory = (list, props) => (
    <DragDropContext onDragEnd={(results) => onDragEnd(results, props)}>
      <Droppable droppableId={props.field.path}>
        {(provided, snapshot) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {list}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
  const itemWrapper: ItemWrapperFactory = (
    item,
    index,
    props,
    id,
    itemGetter
  ) => (
    <Draggable key={`draggable-${index}`} draggableId={id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          data-refid={id}
          data-index={index}
        >
          {item}
        </div>
      )}
    </Draggable>
  );
  return (
    <FieldContainer as="fieldset">
      <FieldLegend>{props.field.label}</FieldLegend>
      <FieldDescription id={`${props.field.path}-description`}>
        {props.field.description}
      </FieldDescription>
      <Cards
        {...props}
        id={props.value.id}
        ref={droppable}
        listWrapper={listWrapper}
        itemWrapper={itemWrapper}
      />
    </FieldContainer>
  );
}
