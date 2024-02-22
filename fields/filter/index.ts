import { graphql } from "@keystone-6/core";
import {
  type FieldTypeFunc,
  fieldType,
  type BaseListTypeInfo,
  type CommonFieldConfig,
} from "@keystone-6/core/types";
import { getNamedType } from "graphql";

export type Dependency = {
  ref?: string;
  list?: string;
  field?: string;
};

export type FieldMeta = {
  fields?: any | null;
  dependency?: Dependency | null;
};

type FilterFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    ui?: FieldMeta;
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
        if (!config.ui) {
          config.ui = { fields: {} };
        }
        if (!config.ui.fields) {
          if (config.ui.dependency?.ref) {
            const ref = config.ui.dependency.ref.split(".");
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
                    meta.lists[listName].types.output.graphQLType.getFields()[
                      v
                    ];
                  if (Object.keys(field.type).includes("_fields")) {
                    listName = getNamedType(field.type).name;
                  }
                }
              }
            });

            config.ui.fields = Object.entries(
              meta.lists[listName].types.output.graphQLType.getFields()
            ).map((key, value) => ({}));
          } else if (config.ui.dependency?.field) {
            const fields = config.ui.dependency.field.split(".");
            if (!config.ui.dependency?.list) {
              config.ui.dependency.list = getNamedType(
                meta.lists[meta.listKey].types.output.graphQLType.getFields()[
                  fields[0]
                ].type
              ).name;
            }
          }
        }

        return {
          fields: config.ui?.fields || null,
          dependency: config.ui?.dependency || null,
        };
      },
    });

export default filter;
