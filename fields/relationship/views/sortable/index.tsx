import React from "react";
import { WrapperProps } from "../../wrapper";
import {
  FieldContainer,
  FieldDescription,
  FieldLegend,
} from "@keystone-ui/fields";
import { useKeystone, useList } from "@keystone-6/core/admin-ui/context";
import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd';
import { Cards } from "../cards";
import { ListMeta } from "@keystone-6/core/types";
import { ItemWrapperFactory } from "../cards/components/List";

export default function Sortable(props: WrapperProps) {
  const foreignList: ListMeta = useList(props.field.refListKey);
  const localList: ListMeta = useList(props.field.listKey);
  
  const onDragEnd = (result) => {
    console.log(result)
  };
  const wrapItemForDragAndDrop: ItemWrapperFactory = (item, index) => (
    <Draggable key={`draggable-${index}`} draggableId={`item-${index}`} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
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
        <Droppable droppableId="droppable-cards">
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <Cards
                forceValidation={props.forceValidation}
                field={props.field}
                id={props.value.id}
                value={props.value}
                itemValue={props.itemValue}
                onChange={props.onChange}
                foreignList={foreignList}
                localList={localList}
                listRef={provided.innerRef}
                itemWrapper={wrapItemForDragAndDrop}
              />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </FieldContainer>
  );
}
