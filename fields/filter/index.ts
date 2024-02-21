import { graphql } from "@keystone-6/core";
import {
  type FieldTypeFunc,
  fieldType,
  type BaseListTypeInfo,
  type CommonFieldConfig,
} from "@keystone-6/core/types";
import { getNamedType } from "graphql";
import type { Config } from "@react-awesome-query-builder/ui";

export type Dependency = { field: string };

export type FieldMeta = {
  config?: Config | null;
  dependency?: Dependency | null;
};

type FilterFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    ui?: FieldMeta;
    ref?: string;
  };

export const filter =
  <ListTypeInfo extends BaseListTypeInfo>({
    ...config
  }: FilterFieldConfig<ListTypeInfo>): FieldTypeFunc<ListTypeInfo> =>
  (meta) =>
    fieldType({
      kind: "scalar",
      mode: "optional",
      scalar: "String",
    })({
      ...config,
      input: {
        create: { arg: graphql.arg({ type: graphql.String }) },
        update: { arg: graphql.arg({ type: graphql.String }) },
      },
      output: graphql.field({
        type: graphql.String,
      }),
      views: "./fields/filter/display",
      getAdminMeta() {
        let config: Config = {};

        if (config.ref) {
          const ref = config.ref?.split(".");
          let listName: string = "";

          ref?.forEach((v, i) => {
            if (i === 0) {
              if (v === "self") {
                listName = meta.listKey;
              } else {
                listName = v;
              }
            } else {
              if (meta.lists[listName]) {
                let field =
                  meta.lists[listName].types.output.graphQLType.getFields()[v];
                if (Object.keys(field.type).includes("_fields")) {
                  listName = getNamedType(field.type).name;
                }
              }
            }
          });

          for (const [key, value] of Object.entries(
            meta.lists[listName].types.output.graphQLType.getFields()
          )) {
            config[key] = getNamedType(value.type).name;
          }
        } else if (config.ui?.config) {
          config = config.ui.config;
        }

        return {
          config: config || null,
          dependency: config.ui?.dependency || null,
        };
      },
    });

export default filter;
