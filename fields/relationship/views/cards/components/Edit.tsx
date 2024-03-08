/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, Stack } from "@keystone-ui/core";
import CardContainer from "./Container";
import { RelationshipSelect } from "../../RelationshipSelect";
import { type ApolloClient, gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { MutableRefObject, useCallback, useState } from "react";
import { DataGetter, deserializeValue, Fields, ItemData, makeDataGetter, useChangedFieldsAndDataForUpdate, useInvalidFields } from "@keystone-6/core/admin-ui/utils";
import { Button } from "@keystone-ui/button";
import { CardProps } from "..";
import { Items, useFieldsObj } from "../useItemState";
import { GraphQLErrorNotice } from "@keystone-6/core/admin-ui/components";
import { useToasts } from "@keystone-ui/toast";
import { ListMeta } from "@keystone-6/core/types";

type EditCardContainerProps = CardProps & {
  foreignList: ListMeta;
  items: Items;
  setItems: (items: Items) => void;
  selectedFields: string;
  client: ApolloClient<object>;
  isLoadingLazyItems: boolean;
  isMountedRef: MutableRefObject<boolean>;
  hideConnectItemsLabel: string;
  setHideConnectItemsLabel: (val: "Cancel" | "Done") => void;
  setIsLoadingLazyItems: (val: boolean) => void;
  setShowConnectItems: (val: boolean) => void;
};

export default function EditCardContainer(props: EditCardContainerProps) {
  const {
    field,
    foreignList,
    items,
    onChange,
    selectedFields,
    setItems,
    value,
  } = props;
  return (
    <CardContainer mode="edit">
      <Stack
        gap="small"
        across
        css={{
          width: "100%",
          justifyContent: "space-between",
          "div:first-of-type": {
            flex: "2",
          },
        }}
      >
        <RelationshipSelect
          autoFocus
          controlShouldRenderValue={props.isLoadingLazyItems}
          isDisabled={onChange === undefined}
          list={foreignList}
          labelField={field.refLabelField}
          searchFields={field.refSearchFields}
          isLoading={props.isLoadingLazyItems}
          placeholder={`Select a ${foreignList.singular}`}
          portalMenu
          state={{
            kind: "many",
            async onChange(options) {
              // TODO: maybe use the extraSelection prop on RelationshipSelect here
              const itemsToFetchAndConnect: string[] = [];
              options.forEach((item) => {
                if (!value.currentIds.has(item.id)) {
                  itemsToFetchAndConnect.push(item.id);
                }
              });
              if (itemsToFetchAndConnect.length) {
                try {
                  const { data, errors } = await props.client.query({
                    query: gql`query ($ids: [ID!]!) {
              items: ${foreignList.gqlNames.listQueryName}(where: { id: { in: $ids }}) {
                ${selectedFields}
              }
            }`,
                    variables: { ids: itemsToFetchAndConnect },
                  });
                  if (props.isMountedRef.current) {
                    const dataGetters = makeDataGetter(data, errors);
                    const itemsDataGetter = dataGetters.get("items");
                    let newItems = { ...items };
                    let newCurrentIds = field.many
                      ? new Set(value.currentIds)
                      : new Set<string>();
                    if (Array.isArray(itemsDataGetter.data)) {
                      itemsDataGetter.data.forEach((item, i) => {
                        if (item?.id != null) {
                          newCurrentIds.add(item.id);
                          newItems[item.id] = itemsDataGetter.get(i);
                        }
                      });
                    }
                    if (newCurrentIds.size && onChange) {
                      setItems(newItems);
                      onChange({
                        ...value,
                        currentIds: newCurrentIds,
                      });
                      props.setHideConnectItemsLabel("Done");
                    }
                  }
                } finally {
                  if (props.isMountedRef.current) {
                    props.setIsLoadingLazyItems(false);
                  }
                }
              }
            },
            value: (() => {
              let options: { label: string; id: string }[] = [];
              Object.keys(items).forEach((id) => {
                if (value.currentIds.has(id)) {
                  options.push({ id, label: id });
                }
              });
              return options;
            })(),
          }}
        />
        <Button onClick={() => props.setShowConnectItems(false)}>
          {props.hideConnectItemsLabel}
        </Button>
      </Stack>
    </CardContainer>
  );
}

export function InlineEdit({
  fields,
  list,
  selectedFields,
  itemGetter,
  onCancel,
  onSave,
}: {
  fields: readonly string[];
  list: ListMeta;
  selectedFields: string;
  itemGetter: DataGetter<ItemData>;
  onCancel: () => void;
  onSave: (newItemGetter: DataGetter<ItemData>) => void;
}) {
  const fieldsObj = useFieldsObj(list, fields);

  const [update, { loading, error }] = useMutation(
    gql`mutation ($data: ${list.gqlNames.updateInputName}!, $id: ID!) {
          item: ${list.gqlNames.updateMutationName}(where: { id: $id }, data: $data) {
            ${selectedFields}
          }
        }`,
    { errorPolicy: "all" }
  );

  const [state, setValue] = useState(() => {
    const value = deserializeValue(fieldsObj, itemGetter);
    return { value, item: itemGetter.data };
  });

  if (
    state.item !== itemGetter.data &&
    itemGetter.errors?.every((x) => x.path?.length !== 1)
  ) {
    const value = deserializeValue(fieldsObj, itemGetter);
    setValue({ value, item: itemGetter.data });
  }

  const { changedFields, dataForUpdate } = useChangedFieldsAndDataForUpdate(
    fieldsObj,
    itemGetter,
    state.value
  );

  const invalidFields = useInvalidFields(fieldsObj, state.value);

  const [forceValidation, setForceValidation] = useState(false);
  const toasts = useToasts();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (changedFields.size === 0) {
          onCancel();
          return;
        }
        const newForceValidation = invalidFields.size !== 0;
        setForceValidation(newForceValidation);
        if (newForceValidation) return;

        update({
          variables: {
            data: dataForUpdate,
            id: itemGetter.get("id").data,
          },
        })
          .then(({ data, errors }) => {
            // we're checking for path.length === 1 because errors with a path larger than 1 will be field level errors
            // which are handled seperately and do not indicate a failure to update the item
            const error = errors?.find((x) => x.path?.length === 1);
            if (error) {
              toasts.addToast({
                title: "Failed to update item",
                tone: "negative",
                message: error.message,
              });
            } else {
              toasts.addToast({
                title: data.item[list.labelField] || data.item.id,
                tone: "positive",
                message: "Saved successfully",
              });
              onSave(makeDataGetter(data, errors).get("item"));
            }
          })
          .catch((err) => {
            toasts.addToast({
              title: "Failed to update item",
              tone: "negative",
              message: err.message,
            });
          });
      }}
    >
      <Stack gap="xlarge">
        {error && (
          <GraphQLErrorNotice
            networkError={error?.networkError}
            // we're checking for path.length === 1 because errors with a path larger than 1 will be field level errors
            // which are handled seperately and do not indicate a failure to update the item
            errors={error?.graphQLErrors.filter((x) => x.path?.length === 1)}
          />
        )}
        <Fields
          fields={fieldsObj}
          forceValidation={forceValidation}
          invalidFields={invalidFields}
          onChange={useCallback(
            (value) => {
              setValue((state) => ({
                item: state.item,
                value: value(state.value),
              }));
            },
            [setValue]
          )}
          value={state.value}
        />
        <Stack across gap="small">
          <Button
            isLoading={loading}
            weight="bold"
            size="small"
            tone="active"
            type="submit"
          >
            Save
          </Button>
          <Button size="small" weight="none" onClick={onCancel}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
