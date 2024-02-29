/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, Stack } from "@keystone-ui/core";
import CardContainer from "./Container";
import { CardProps } from "..";
import isDeepEqual from "fast-deep-equal";
import { Items, useFieldsObj } from "../useItemState";
import { Button } from "@keystone-ui/button";
import {
  DataGetter,
  Fields,
  ItemData,
  makeDataGetter,
  serializeValueToObjByFieldKey,
  useInvalidFields,
  Value,
} from "@keystone-6/core/admin-ui/utils";
import { GraphQLErrorNotice } from "@keystone-6/core/admin-ui/components";
import { useState } from "react";
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { useToasts } from "@keystone-ui/toast";
import { ListMeta } from "@keystone-6/core/types";

type CreateRecordContainerProps = CardProps & {
  items: Items;
  setItems: (items: Items) => void;
  selectedFields: string;
  foreignList: ListMeta;
};

export function CreateRecordContainer(props: CreateRecordContainerProps) {
  const { items, setItems, selectedFields, value } = props;
  return (
    <CardContainer mode="create">
      <InlineCreate
        selectedFields={selectedFields}
        fields={value.displayOptions.inlineCreate!.fields}
        list={props.foreignList}
        onCancel={() => {
          props.onChange!({ ...props.value, itemBeingCreated: false });
        }}
        onCreate={(itemGetter) => {
          const id = itemGetter.data.id;
          setItems({ ...items, [id]: itemGetter });
          props.onChange!({
            ...props.value,
            itemBeingCreated: false,
            currentIds: props.field.many
              ? new Set([...props.value.currentIds, id])
              : new Set([id]),
          });
        }}
      />
    </CardContainer>
  );
}

type CreateButtonContainerProps = CardProps & {
  foreignList: ListMeta;
  setHideConnectItemsLabel: (val: "Cancel" | "Done") => void;
  setShowConnectItems: (val: boolean) => void;
};
export function CreateButtonsContainer(props: CreateButtonContainerProps) {
  return (
    <CardContainer mode="create">
      <Stack gap="small" across>
        {props.value.displayOptions.inlineCreate && (
          <Button
            size="small"
            disabled={props.onChange === undefined}
            tone="positive"
            onClick={() => {
              props.onChange!({
                ...props.value,
                itemBeingCreated: true,
              });
            }}
          >
            Create {props.foreignList.singular}
          </Button>
        )}
        {props.value.displayOptions.inlineConnect && (
          <Button
            size="small"
            weight="none"
            tone="passive"
            onClick={() => {
              props.setShowConnectItems(true);
              props.setHideConnectItemsLabel("Cancel");
            }}
          >
            Link existing {props.foreignList.singular}
          </Button>
        )}
      </Stack>
    </CardContainer>
  );
}

export default function CreateCardContainer(
  props: CreateRecordContainerProps & CreateButtonContainerProps
) {
  return props.value.itemBeingCreated ? (
    <CreateRecordContainer {...props} />
  ) : props.value.displayOptions.inlineCreate ||
    props.value.displayOptions.inlineConnect ? (
    <CreateButtonsContainer {...props} />
  ) : null;
}

export function InlineCreate({
  list,
  onCancel,
  onCreate,
  fields: fieldPaths,
  selectedFields,
}: {
  list: ListMeta;
  selectedFields: string;
  fields: readonly string[];
  onCancel: () => void;
  onCreate: (itemGetter: DataGetter<ItemData>) => void;
}) {
  const toasts = useToasts();
  const fields = useFieldsObj(list, fieldPaths);

  const [createItem, { loading, error }] = useMutation(
    gql`mutation($data: ${list.gqlNames.createInputName}!) {
        item: ${list.gqlNames.createMutationName}(data: $data) {
          ${selectedFields}
      }
    }`
  );

  const [value, setValue] = useState(() => {
    const value: Value = {};
    Object.keys(fields).forEach((fieldPath) => {
      value[fieldPath] = {
        kind: "value",
        value: fields[fieldPath].controller.defaultValue,
      };
    });
    return value;
  });

  const invalidFields = useInvalidFields(fields, value);
  const [forceValidation, setForceValidation] = useState(false);

  const onSubmit = () => {
    const newForceValidation = invalidFields.size !== 0;
    setForceValidation(newForceValidation);

    if (newForceValidation) return;
    const data: Record<string, any> = {};
    const allSerializedValues = serializeValueToObjByFieldKey(fields, value);
    Object.keys(allSerializedValues).forEach((fieldPath) => {
      const { controller } = fields[fieldPath];
      const serialized = allSerializedValues[fieldPath];
      if (
        !isDeepEqual(serialized, controller.serialize(controller.defaultValue))
      ) {
        Object.assign(data, serialized);
      }
    });

    createItem({
      variables: {
        data,
      },
    })
      .then(({ data, errors }) => {
        // we're checking for path.length === 1 because errors with a path larger than 1 will be field level errors
        // which are handled seperately and do not indicate a failure to update the item
        const error = errors?.find((x) => x.path?.length === 1);
        if (error) {
          toasts.addToast({
            title: "Failed to create item",
            tone: "negative",
            message: error.message,
          });
        } else {
          toasts.addToast({
            title: data.item[list.labelField] || data.item.id,
            tone: "positive",
            message: "Saved successfully",
          });
          onCreate(makeDataGetter(data, errors).get("item"));
        }
      })
      .catch((err) => {
        toasts.addToast({
          title: "Failed to update item",
          tone: "negative",
          message: err.message,
        });
      });
  };

  return (
    <section>
      <Stack gap="xlarge">
        {error && (
          <GraphQLErrorNotice
            networkError={error?.networkError}
            errors={error?.graphQLErrors}
          />
        )}
        <Fields
          fields={fields}
          forceValidation={forceValidation}
          invalidFields={invalidFields}
          onChange={setValue}
          value={value}
        />
        <Stack gap="small" across>
          <Button
            onClick={onSubmit}
            isLoading={loading}
            size="small"
            tone="positive"
            weight="bold"
          >
            Create {list.singular}
          </Button>
          <Button size="small" weight="none" onClick={onCancel}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </section>
  );
}
