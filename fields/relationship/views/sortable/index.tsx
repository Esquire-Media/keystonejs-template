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
import { ItemWrapperFactory } from "../cards/components/List";

export default function Sortable(props: WrapperProps) {
  const droppable: Ref<HTMLOListElement> = useRef(null);
  const onDragEnd = (result) => {
    const context = {
      listKey: props.field.listKey,
      recordId: props.value.id,
      refListKey: props.field.refListKey,
      sortField: props.value.displayOptions.orderBy,
      items: Array.from(droppable.current?.children || []).map(
        (child, index) => {
          const target = child.firstElementChild
          return {
            id: target?.getAttribute("data-refid"),
            index
          }
        }
      ),
    };

    console.log(context, result)
  };
  const itemWrapper: ItemWrapperFactory = (
    item,
    index,
    props,
    id,
    itemGetter
  ) => (
    <Draggable key={`draggable-${index}`} draggableId={item.key} index={index}>
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
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={props.field.path}>
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <Cards
                {...props}
                id={props.value.id}
                ref={droppable}
                itemWrapper={itemWrapper}
              />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </FieldContainer>
  );
}
