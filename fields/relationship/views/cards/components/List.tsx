import React, { Ref } from "react";
import CardContainer from "./Container";
import { Link, Stack, VisuallyHidden } from "@keystone-ui/core";
import { getRootGraphQLFieldsFromFieldController } from "@keystone-6/core/admin-ui/utils";
import { FieldContainer, FieldLabel } from "@keystone-ui/fields";
import { Button } from "@keystone-ui/button";
import { Tooltip } from "@keystone-ui/tooltip";
import { CardProps } from "..";
import { Items } from "../useItemState";
import { InlineEdit } from "./Edit";

type ItemProps = CardProps & {
  key: string;
  items: Items;
  selectedFields: string;
  setItems: (items: Items) => void;
  index: number;
  isEditMode: boolean;
  itemGetter: any;
};

export function ItemCardContainer(props: ItemProps) {
  return (
    <CardContainer
      role="status"
      mode={props.isEditMode ? "edit" : "view"}
      key={props.id}
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
              [props.key]: newItemGetter,
            });
            const itemsBeingEdited = new Set(props.value.itemsBeingEdited);
            itemsBeingEdited.delete(props.key);
            props.onChange!({
              ...props.value,
              itemsBeingEdited,
            });
          }}
          selectedFields={props.selectedFields}
          itemGetter={props.itemGetter}
          onCancel={() => {
            const itemsBeingEdited = new Set(props.value.itemsBeingEdited);
            itemsBeingEdited.delete(props.key);
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
                  <FieldContainer key={fieldPath}>
                    <FieldLabel>{field.label}</FieldLabel>
                    {errorMessage}
                  </FieldContainer>
                );
              }
              itemForField[graphqlField] = fieldGetter.data;
            }
            return (
              <field.views.CardValue
                key={fieldPath}
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
                        props.key,
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
                        currentIds.delete(props.key);
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
                href={`/${props.foreignList.path}/${props.id}`}
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

type ListCardContainerProps = CardProps & {
  items: Items;
  selectedFields: string;
  setItems: (items: Items) => void;
  currentIdsArrayWithFetchedItems: Array<any>;
};

export default function ListCardContainer(props: ListCardContainerProps) {
  return (
    <Stack gap="medium" ref={props.stackRef}>
      {props.currentIdsArrayWithFetchedItems.map(
        ({ id, itemGetter }, index) => {
          return (
            <ItemCardContainer
              {...props}
              key={id}
              index={index}
              itemGetter={itemGetter}
              isEditMode={
                !!(props.onChange !== undefined) &&
                props.value.itemsBeingEdited.has(id)
              }
            />
          );
        }
      )}
    </Stack>
  );
}
