/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, Stack } from "@keystone-ui/core";
import CardContainer from "./CardContainer";
import { RelationshipSelect } from "../../RelationshipSelect";
import { type ApolloClient, gql } from "@keystone-6/core/admin-ui/apollo";
import { MutableRefObject } from "react";
import { makeDataGetter } from "@keystone-6/core/admin-ui/utils";
import { Button } from "@keystone-ui/button";
import { BaseCardContainerProps } from "..";

type EditCardContainerProps = BaseCardContainerProps & {
  client: ApolloClient<object>;
  isLoadingLazyItems: boolean;
  isMountedRef: MutableRefObject<boolean>;
  hideConnectItemsLabel: string;
  setHideConnectItemsLabel: (val: "Cancel" | "Done") => void;
  setIsLoadingLazyItems: (val: boolean) => void;
  setShowConnectItems: (val: boolean) => void;
};

export default function EditCardContainer(props: EditCardContainerProps) {
  const { field, foreignList, items, onChange, selectedFields, setItems, value } = props;
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
                    let newCurrentIds = field.many ? new Set(value.currentIds) : new Set<string>();
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
