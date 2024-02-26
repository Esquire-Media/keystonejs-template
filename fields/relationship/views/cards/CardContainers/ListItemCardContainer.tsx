import React from "react";
import CardContainer from "./CardContainer";
import { Link, Stack, VisuallyHidden } from "@keystone-ui/core";
import { InlineEdit } from "../InlineEdit";
import { getRootGraphQLFieldsFromFieldController } from "@keystone-6/core/admin-ui/utils";
import { FieldContainer, FieldLabel } from "@keystone-ui/fields";
import { Button } from "@keystone-ui/button";
import { Tooltip } from "@keystone-ui/tooltip";
import { BaseCardContainerProps } from "..";

type ListItemProps = BaseCardContainerProps & {
  displayOptions: any;
  id: string;
  index: number;
  isEditMode: boolean;
  itemGetter: any;
}

export default function ListItemCardContainer(props: ListItemProps) {
  const {
    displayOptions,
    field,
    foreignList,
    id,
    index,
    isEditMode,
    itemGetter,
    items,
    onChange,
    selectedFields,
    setItems,
    value,
  } = props;

  return (
    <CardContainer role="status" mode={isEditMode ? "edit" : "view"} key={id}>
      <VisuallyHidden as="h2">{`${field.label} ${index + 1} ${
        isEditMode ? "edit" : "view"
      } mode`}</VisuallyHidden>
      {isEditMode ? (
        <InlineEdit
          list={foreignList}
          fields={displayOptions.inlineEdit!.fields}
          onSave={(newItemGetter) => {
            console.log(newItemGetter);
            setItems({
              ...items,
              [id]: newItemGetter,
            });
            const itemsBeingEdited = new Set(value.itemsBeingEdited);
            itemsBeingEdited.delete(id);
            onChange!({
              ...value,
              itemsBeingEdited,
            });
          }}
          selectedFields={selectedFields}
          itemGetter={itemGetter}
          onCancel={() => {
            const itemsBeingEdited = new Set(value.itemsBeingEdited);
            itemsBeingEdited.delete(id);
            onChange!({
              ...value,
              itemsBeingEdited,
            });
          }}
        />
      ) : (
        <Stack gap="xlarge">
          {displayOptions.cardFields.map((fieldPath) => {
            const field = foreignList.fields[fieldPath];
            const itemForField: Record<string, any> = {};
            for (const graphqlField of getRootGraphQLFieldsFromFieldController(field.controller)) {
              const fieldGetter = itemGetter.get(graphqlField);
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
              <field.views.CardValue key={fieldPath} field={field.controller} item={itemForField} />
            );
          })}
          <Stack across gap="small">
            {displayOptions.inlineEdit && onChange !== undefined && (
              <Button
                size="small"
                disabled={onChange === undefined}
                onClick={() => {
                  onChange({
                    ...value,
                    itemsBeingEdited: new Set([...value.itemsBeingEdited, id]),
                  });
                }}
                tone="active"
              >
                Edit
              </Button>
            )}
            {displayOptions.removeMode === "disconnect" && onChange !== undefined && (
              <Tooltip content="This item will not be deleted. It will only be removed from this field.">
                {(props) => (
                  <Button
                    size="small"
                    disabled={onChange === undefined}
                    onClick={() => {
                      const currentIds = new Set(value.currentIds);
                      currentIds.delete(id);
                      onChange({
                        ...value,
                        currentIds,
                      });
                    }}
                    {...props}
                    tone="negative"
                  >
                    Remove
                  </Button>
                )}
              </Tooltip>
            )}
            {displayOptions.linkToItem && (
              <Button
                size="small"
                weight="link"
                tone="active"
                css={{ textDecoration: "none" }}
                as={Link}
                href={`/${foreignList.path}/${id}`}
              >
                View {foreignList.singular} details
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </CardContainer>
  );
}
