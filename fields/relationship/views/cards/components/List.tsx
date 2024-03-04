import React, { Ref } from "react";
import CardContainer from "./Container";
import { Link, Stack, VisuallyHidden } from "@keystone-ui/core";
import { DataGetter, ItemData, getRootGraphQLFieldsFromFieldController } from "@keystone-6/core/admin-ui/utils";
import { FieldContainer, FieldLabel } from "@keystone-ui/fields";
import { Button } from "@keystone-ui/button";
import { Tooltip } from "@keystone-ui/tooltip";
import { CardProps } from "..";
import { Items } from "../useItemState";
import { InlineEdit } from "./Edit";
import { ListMeta } from "@keystone-6/core/types";

type ItemProps = ListCardContainerProps & {
  itemId: string;
  items: Items;
  selectedFields: string;
  setItems: (items: Items) => void;
  index: number;
  isEditMode: boolean;
  itemGetter: DataGetter<ItemData>;
};

export function ItemCardContainer(props: ItemProps) {
  return (
    <CardContainer
      role="status"
      mode={props.isEditMode ? "edit" : "view"}
      key={props.itemId}
    >
      <VisuallyHidden as="h2">{`${props.field.label} ${props.index + 1} ${
        props.isEditMode ? "edit" : "view"
      } mode`}</VisuallyHidden>
      {props.isEditMode ? (
        <InlineEdit
          list={props.foreignList}
          fields={props.value.displayOptions.inlineEdit!.fields}
          onSave={(newItemGetter) => {
            props.setItems({
              ...props.items,
              [props.itemId]: newItemGetter,
            });
            const itemsBeingEdited = new Set(props.value.itemsBeingEdited);
            itemsBeingEdited.delete(props.itemId);
            props.onChange!({
              ...props.value,
              itemsBeingEdited,
            });
          }}
          selectedFields={props.selectedFields}
          itemGetter={props.itemGetter}
          onCancel={() => {
            const itemsBeingEdited = new Set(props.value.itemsBeingEdited);
            itemsBeingEdited.delete(props.itemId);
            props.onChange!({
              ...props.value,
              itemsBeingEdited,
            });
          }}
        />
      ) : (
        <Stack gap="xlarge">
          {props.value.displayOptions.cardFields.map((fieldPath) => {
            const field = props.foreignList.fields[fieldPath];
            const itemForField: Record<string, any> = {};
            for (const graphqlField of getRootGraphQLFieldsFromFieldController(
              field.controller
            )) {
              const fieldGetter = props.itemGetter.get(graphqlField);
              if (fieldGetter.errors) {
                const errorMessage = fieldGetter.errors[0].message;
                return (
                  <FieldContainer>
                    <FieldLabel>{field.label}</FieldLabel>
                    {errorMessage}
                  </FieldContainer>
                );
              }
              itemForField[graphqlField] = fieldGetter.data;
            }
            return (
              <field.views.CardValue
                key={props.itemId}
                field={field.controller}
                item={itemForField}
              />
            );
          })}
          <Stack across gap="small">
            {props.value.displayOptions.inlineEdit &&
              props.onChange !== undefined && (
                <Button
                  size="small"
                  disabled={props.onChange === undefined}
                  onClick={() => {
                    props.onChange!({
                      ...props.value,
                      itemsBeingEdited: new Set([
                        ...props.value.itemsBeingEdited,
                        props.itemId,
                      ]),
                    });
                  }}
                  tone="active"
                >
                  Edit
                </Button>
              )}
            {props.value.displayOptions.removeMode === "disconnect" &&
              props.onChange !== undefined && (
                <Tooltip content="This item will not be deleted. It will only be removed from this field.">
                  {(_props) => (
                    <Button
                      size="small"
                      disabled={props.onChange === undefined}
                      onClick={() => {
                        const currentIds = new Set(props.value.currentIds);
                        currentIds.delete(props.itemId);
                        props.onChange!({
                          ...props.value,
                          currentIds,
                        });
                      }}
                      {..._props}
                      tone="negative"
                    >
                      Remove
                    </Button>
                  )}
                </Tooltip>
              )}
            {props.value.displayOptions.linkToItem && (
              <Button
                size="small"
                weight="link"
                tone="active"
                css={{ textDecoration: "none" }}
                as={Link}
                href={`/${props.foreignList.path}/${props.itemId}`}
              >
                View {props.foreignList.singular} details
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </CardContainer>
  );
}

export type ListWrapperFactory = (
  list: JSX.Element,
  props: ListCardContainerProps
) => JSX.Element;
export type ItemWrapperFactory = (
  item: JSX.Element,
  index: number,
  props: ListCardContainerProps,
  id: string,
  itemGetter: DataGetter<ItemData>
) => JSX.Element;
type ListCardContainerProps = CardProps & {
  items: Items;
  selectedFields: string;
  setItems: (items: Items) => void;
  foreignList: ListMeta;
  currentIdsArrayWithFetchedItems: Array<any>;
  listWrapper?: ListWrapperFactory;
  itemWrapper?: ItemWrapperFactory;
};
export default function ListCardContainer(props: ListCardContainerProps) {
  const list = (
    <Stack
      as="ol"
      gap="medium"
      ref={props.listRef}
      css={{
        padding: 0,
        margin: 0,
        li: {
          listStyle: "none",
        },
      }}
    >
      {props.currentIdsArrayWithFetchedItems
        .sort((a,b) => a.itemGetter.path.slice(-1)[0] - b.itemGetter.path.slice(-1)[0])
        .map(({ id, itemGetter }, index) => {
          const item = (
            <ItemCardContainer
              {...props}
              itemId={id}
              index={index}
              itemGetter={itemGetter}
              isEditMode={
                !!(props.onChange !== undefined) &&
                props.value.itemsBeingEdited.has(id)
              }
            />
          );
          return props.itemWrapper
            ? props.itemWrapper(item, index, props, id, itemGetter)
            : item;
        })}
    </Stack>
  );
  return props.listWrapper ? props.listWrapper(list, props) : list;
}
