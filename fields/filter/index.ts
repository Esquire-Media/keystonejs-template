// Import necessary GraphQL utilities from Keystone core and GraphQL.
import { graphql } from "@keystone-6/core";
import {
  type FieldTypeFunc,
  fieldType,
  type BaseListTypeInfo,
  type CommonFieldConfig,
} from "@keystone-6/core/types";
import { getNamedType } from "graphql";

// Define the structure for specifying dependencies of the field.
export type Dependency = {
  ref?: string; // A reference to another field or list that this field depends on.
  list?: string; // The specific list the dependency is part of.
  field?: string; // The specific field within the list that forms the dependency.
};

// Define metadata for the field, including any fields and dependencies.
export type FieldMeta = {
  fields?: any | null; // Additional fields related to the filter functionality.
  dependency?: Dependency | null; // Dependency information for dynamic behavior.
};

// Extend common field configuration with UI-specific metadata.
type FilterFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    ui?: FieldMeta; // UI metadata, including fields and dependencies.
  };

// Define the filter field as a function that returns a Keystone field type.
export const filter =
  <ListTypeInfo extends BaseListTypeInfo>({
    ...config
  }: FilterFieldConfig<ListTypeInfo>): FieldTypeFunc<ListTypeInfo> =>
  (
    meta // 'meta' contains information about the list the field is added to.
  ) =>
    fieldType({
      kind: "scalar", // Define the field as a scalar type.
      mode: "optional", // The field is optional.
      scalar: "String", // The scalar type is a string.
    })({
      ...config,
      input: {
        // Define GraphQL arguments for creating and updating the field.
        create: { arg: graphql.arg({ type: graphql.String }) },
        update: { arg: graphql.arg({ type: graphql.String }) },
      },
      output: graphql.field({
        type: graphql.String, // The output type of the field is a string.
      }),
      views: "./fields/filter/display", // Custom UI view for the field.
      getAdminMeta() {
        // Generate metadata for the admin UI.
        if (!config.ui) {
          config.ui = { fields: {} }; // Ensure there's a default value for UI config.
        }
        if (!config.ui.fields) {
          // Process reference dependencies for dynamic field behavior.
          if (config.ui.dependency?.ref) {
            const ref = config.ui.dependency.ref.split(".");
            let listName: string = ""; // Initialize the list name variable.

            // Parse the reference to determine the list and field dependencies.
            ref?.forEach((v, i) => {
              if (i === 0) {
                listName = v === "self" ? meta.listKey : v;
              } else {
                // Access nested fields to determine the dependency chain.
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

            // Set UI fields based on the determined list and its fields.
            config.ui.fields = Object.entries(
              meta.lists[listName].types.output.graphQLType.getFields()
            ).map((key, value) => ({}));
          } else if (config.ui.dependency?.field) {
            // Handle field-specific dependencies.
            const fields = config.ui.dependency.field.split(".");
            if (!config.ui.dependency?.list) {
              // Determine the list of the dependency if not explicitly set.
              config.ui.dependency.list = getNamedType(
                meta.lists[meta.listKey].types.output.graphQLType.getFields()[
                  fields[0]
                ].type
              ).name;
            }
          }
        }

        // Return the UI configuration for the admin interface.
        return {
          fields: config.ui?.fields || null,
          dependency: config.ui?.dependency || null,
        };
      },
    });

// Export the filter function as the default export.
export default filter;
