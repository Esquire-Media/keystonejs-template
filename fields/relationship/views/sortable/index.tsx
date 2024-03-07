import React, { Ref, useRef } from "react";
import { WrapperProps } from "../../wrapper";
import {
  FieldContainer,
  FieldDescription,
  FieldLegend,
} from "@keystone-ui/fields";
import { useKeystone, useList } from "@keystone-6/core/admin-ui/context";
import { fetchGraphQLClient } from "../../../../admin/utils";
import { Droppable, Draggable, DragDropContext } from "react-beautiful-dnd";
import { Cards } from "../cards";
import type {
  ItemWrapperFactory,
  ListCardContainerProps,
  ListWrapperFactory,
} from "../cards/components/List";
import "./styles.css";
import { getGqlNames } from "@keystone-6/core/types";
import { Items } from "../cards/useItemState";
import { DataHandler } from "../cards/components/Create";

export type SortableWrapperProps = WrapperProps & {
  value: {
    displayOptions: {
      orderBy: string;
    };
  };
};
export default function Sortable(props: SortableWrapperProps) {
  const droppable: Ref<HTMLOListElement> = useRef(null);
  const keystone = useKeystone();
  const fetchGraphQL = fetchGraphQLClient(keystone.apiPath);

  const onDragEnd = (result, listProps: ListCardContainerProps) => {
    if (result.destination) {
      const context = {
        listKey: props.field.listKey,
        recordId: props.value.id,
        refListKey: props.field.refListKey,
        sortField: props.value.displayOptions.orderBy as string,
        originalItemOrder: listProps.currentIdsArrayWithFetchedItems
          .sort(
            (a, b) =>
              a.itemGetter.path.slice(-1)[0] - b.itemGetter.path.slice(-1)[0]
          )
          .map((item) => item.id),
      };
      console.log(context, result);

      // Reorder items
      let reorderedItems = [...context.originalItemOrder];
      const [movedItemId] = reorderedItems.splice(result.source.index, 1);
      reorderedItems.splice(result.destination.index, 0, movedItemId);
      const mutateData = reorderedItems
        .map((value: string, index: number) => {
          if (index !== context.originalItemOrder.indexOf(value)) {
            return {
              where: {
                id: value,
              },
              data: {
                [context.sortField]: index,
              },
            };
          } else {
            return undefined;
          }
        })
        .filter((v) => v);

      // Mutate Query
      const gqlNames = getGqlNames({
        listKey: props.field.refListKey,
        pluralGraphQLName: keystone.adminMeta.lists[
          props.field.refListKey
        ].plural.replace(" ", ""),
      });
      if (mutateData.length > 0) {
        fetchGraphQL(
          `
          mutation($data: [${gqlNames.updateManyInputName}!]!) {
            ${gqlNames.updateManyMutationName}(data: $data) {
              ${context.sortField}
            }
          }
        `,
          {
            data: mutateData,
          }
        );

        // Update Items
        let newItems = {};
        Object.entries(listProps.items).forEach(
          (pair: [string, any], index: number) => {
            let newPath = [...pair[1].path];
            newPath.pop();
            newItems[pair[0]] = {
              ...pair[1],
              path: [...newPath, reorderedItems.indexOf(pair[0])],
            };
          }
        );
        listProps.setItems(newItems);
      }
    }
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
    <Draggable key={`draggable-${id}`} draggableId={id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          data-refid={id}
          data-index={index}>
          {item}
        </div>
      )}
    </Draggable>
  );
  const insertOrderBy: DataHandler = (data, dhProps) => {
    let value = 0;
    Object.entries(dhProps.items).forEach((pair: [string, any]) => {
      const path = pair[1].path.slice(-1)[0];
      if (typeof path === "number" && path >= value) {
        value = path + 1;
      }
    });

    // Handle when multiple processes get created before clicking "save changes"
    // Newly created entries only have "path" equal to ["item"] (they dont have an orderBy value)
    if (value < Object.keys(dhProps.items).length) {
      value = Object.keys(dhProps.items).length
    }

    data[props.value.displayOptions.orderBy] = value;
  };

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
        onBeforeCreate={
          props.value.displayOptions.orderBy ? insertOrderBy : undefined
        }
      />
    </FieldContainer>
  );
}
