/** @jsxRuntime classic */
/** @jsx jsx */

import { Stack, Text, jsx } from "@keystone-ui/core";
import { LoadingDots } from "@keystone-ui/loading";
import { Ref, useEffect, useRef, useState } from "react";
import { type ListMeta } from "@keystone-6/core/types";
import { useApolloClient } from "@keystone-6/core/admin-ui/apollo";
import { useItemState } from "./useItemState";
import ListCardContainer, {
  ItemWrapperFactory,
  ListWrapperFactory,
} from "./components/List";
import EditCardContainer from "./components/Edit";
import CreateCardContainer from "./components/Create";
import { WrapperProps } from "../../wrapper";
import { useList } from "@keystone-6/core/admin-ui/context";
import React from "react";
import { InsertOrderByFactory } from "./components/Create";

export type CardProps = {
  listRef?: Ref<any>;
  listWrapper?: ListWrapperFactory;
  itemWrapper?: ItemWrapperFactory;
  insertOrderBy?: InsertOrderByFactory;
} & WrapperProps;

export const Cards = React.forwardRef((props: CardProps, ref) => {
  const foreignList: ListMeta = useList(props.field.refListKey);
  const localList: ListMeta = useList(props.field.listKey);
  const { displayOptions } = props.value;
  let selectedFields = [
    ...new Set([
      ...displayOptions.cardFields,
      ...(displayOptions.inlineEdit?.fields || []),
    ]),
  ]
    .map((fieldPath) => {
      return foreignList.fields[fieldPath].controller.graphqlSelection;
    })
    .join("\n");
  if (!displayOptions.cardFields.includes("id")) {
    selectedFields += "\nid";
  }
  if (
    !displayOptions.cardFields.includes(foreignList.labelField) &&
    foreignList.labelField !== "id"
  ) {
    selectedFields += `\n${foreignList.labelField}`;
  }

  const {
    items,
    setItems,
    state: itemsState,
  } = useItemState({
    selectedFields,
    localList: localList,
    foreignList: foreignList,
    id: props.id,
    field: props.field,
  });

  const client = useApolloClient();

  const [isLoadingLazyItems, setIsLoadingLazyItems] = useState(false);
  const [showConnectItems, setShowConnectItems] = useState(false);
  const [hideConnectItemsLabel, setHideConnectItemsLabel] = useState<
    "Cancel" | "Done"
  >("Cancel");
  const editRef = useRef<HTMLDivElement | null>(null);

  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  });

  useEffect(() => {
    if (props.value.itemsBeingEdited) {
      editRef?.current?.focus();
    }
  }, [props.value]);

  if (itemsState.kind === "loading") {
    return (
      <div>
        <LoadingDots label={`Loading items for ${props.field.label} field`} />
      </div>
    );
  }
  if (itemsState.kind === "error") {
    return <span css={{ color: "red" }}>{itemsState.message}</span>;
  }

  const currentIdsArrayWithFetchedItems = [...props.value.currentIds]
    .map((id) => {
      return { itemGetter: items[id], id };
    })
    .filter((x) => x.itemGetter);

  return (
    <Stack gap="medium">
      {currentIdsArrayWithFetchedItems.length !== 0 && (
        <ListCardContainer
          {...props}
          listRef={ref}
          foreignList={foreignList}
          items={items}
          setItems={setItems}
          selectedFields={selectedFields}
          currentIdsArrayWithFetchedItems={currentIdsArrayWithFetchedItems}
        />
      )}
      {props.onChange === undefined ? null : displayOptions.inlineConnect &&
        showConnectItems ? (
        <EditCardContainer
          {...props}
          items={items}
          setItems={setItems}
          selectedFields={selectedFields}
          client={client}
          isLoadingLazyItems={isLoadingLazyItems}
          hideConnectItemsLabel={hideConnectItemsLabel}
          isMountedRef={isMountedRef}
          setHideConnectItemsLabel={setHideConnectItemsLabel}
          setIsLoadingLazyItems={setIsLoadingLazyItems}
          setShowConnectItems={setShowConnectItems}
        />
      ) : (
        <CreateCardContainer
          {...props}
          foreignList={foreignList}
          items={items}
          setItems={setItems}
          selectedFields={selectedFields}
          setHideConnectItemsLabel={setHideConnectItemsLabel}
          setShowConnectItems={setShowConnectItems}
          insertOrderBy={props.insertOrderBy}
        />
      )}
      {/* TODO: this may not be visible to the user when they invoke the save action. Maybe scroll to it? */}
      {props.forceValidation && (
        <Text color="red600" size="small">
          You must finish creating and editing any related{" "}
          {foreignList.label.toLowerCase()} before saving the{" "}
          {localList.singular.toLowerCase()}
        </Text>
      )}
    </Stack>
  );
});
