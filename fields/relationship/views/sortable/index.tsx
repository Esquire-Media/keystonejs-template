import "./styles.css";
import React, { Ref, useRef } from "react";
import { WrapperProps } from "../../wrapper";
import { FieldContainer, FieldDescription, FieldLegend } from "@keystone-ui/fields";
import { useKeystone, useList } from "@keystone-6/core/admin-ui/context";
import { Droppable, Draggable, DragDropContext } from "react-beautiful-dnd";
import { Cards } from "../cards";
import { ItemWrapperFactory, ListWrapperFactory } from "../cards/components/List";
import { fetchGraphQLClient } from "../../../../admin/utils";
import { getGqlNames } from "@keystone-6/core/types";

export default function Sortable(props: WrapperProps) {
  const keystone = useKeystone();
  const fetchGraphQL = fetchGraphQLClient(keystone.apiPath);
  const orderBy = "sort";

  const droppable: Ref<HTMLOListElement> = useRef(null);
  const onDragEnd = async (result, wrapperProps) => {
    if (!result.destination) return;
    // Handle reordering
    let reorderedItems = [...wrapperProps.currentIdsArrayWithFetchedItems];
    const [movedItemId] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, movedItemId);

    console.log(reorderedItems)
    // Format data for mutation + remove unchanged items
    const mutateData = reorderedItems
      .map((value, index) => {
        if (value.id !== wrapperProps.currentIdsArrayWithFetchedItems[index].id) {
          return {
            where: {
              id: value.id,
            },
            data: {
              [orderBy]: index,
            },
          };
        } else {
          return null;
        }
      })
      .filter((v) => v);
    
      console.log(mutateData)

    // // Mutate Query
    // const gqlNames = getGqlNames({
    //   listKey: props.field.refListKey,
    //   pluralGraphQLName: keystone.adminMeta.lists[props.field.refListKey].plural.replace(" ", ""),
    // });
    // if (mutateData.length > 0) {
    //   const res = await fetchGraphQL(
    //     `
    //       mutation($data: [${gqlNames.updateManyInputName}!]!) {
    //         ${gqlNames.updateManyMutationName}(data: $data) {
    //           ${orderBy}
    //         }
    //       }
    //     `,
    //     {
    //       data: mutateData,
    //     }
    //   );
    //   wrapperProps.setItems(reorderedItems);
    //   console.log(res);
    // }
  };

  const listWrapper: ListWrapperFactory = (list, props) => (
    <DragDropContext onDragEnd={(res) => onDragEnd(res, props)}>
      <Droppable droppableId={props.field.path}>
        {(provided, snapshot) => (
          <ol {...provided.droppableProps} ref={provided.innerRef}>
            {list}
            <div className="placeholder">{provided.placeholder}</div>
          </ol>
        )}
      </Droppable>
    </DragDropContext>
  );
  const itemWrapper: ItemWrapperFactory = (item, index, props, id, itemGetter) => (
    <Draggable key={`draggable-${index}`} draggableId={id} index={index}>
      {(provided, snapshot) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          data-refid={id}
          data-index={index}
          className={snapshot.isDragging ? "" : "spaceDragging"}
        >
          {item}
        </li>
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
