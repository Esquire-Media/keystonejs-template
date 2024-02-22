import React, { useState, useCallback, useEffect } from "react";
import type {
  Config,
  ImmutableTree,
  BuilderProps,
} from "@react-awesome-query-builder/ui";
import { Utils as QbUtils } from "@react-awesome-query-builder/core";
import { Query, Builder } from "@react-awesome-query-builder/ui";
import "@react-awesome-query-builder/ui/css/styles.css";
import InitConfig from "./config";

// Define TypeScript interface for component props.
export type InterfaceProps = {
  value?: Object; // Optional prop to specify the initial value of the query builder.
  fields?: any; // Optional prop to specify the fields available in the query builder.
  onChange?: (value: string | null) => void; // Optional prop to handle changes in the query builder value.
};

// Define the Interface component.
export default function Interface(props: InterfaceProps) {
  // State for the query builder configuration, initialized with the initial configuration and fields.
  const [config, setConfig] = useState<Config>({ ...InitConfig(), fields: {} });

  // Effect hook to update fields in the configuration whenever props.fields change.
  useEffect(() => {
    if (props.fields && Object.keys(props.fields).length > 0) {
      setConfig((prev) => ({ ...prev, fields: props.fields }));
    }
  }, [props.fields]);

  // State for the query builder tree, initialized with a default group node.
  const [tree, setTree] = useState<ImmutableTree>(
    QbUtils.loadTree({
      id: QbUtils.uuid(), // Generate a unique ID for the root node.
      type: "group", // Set the node type to "group".
    })
  );

  // Effect hook to update the query builder tree whenever the config changes.
  useEffect(() => {
    if (
      Object.keys(config.fields).length > 0 &&
      props.value &&
      Object.keys(props.value).length > 0
    ) {
      setTree((prev) => {
        return props.value
          ? QbUtils.loadFromJsonLogic(props.value, config) || prev
          : prev;
      });
    }
  }, [config]);

  // Callback to handle changes in the query builder's state.
  const onChange = useCallback(
    (value: ImmutableTree, config: Config) => {
      setTree(value);
      if (props.onChange) {
        const logic = QbUtils.jsonLogicFormat(value, config)["logic"];
        if (logic) props.onChange(JSON.stringify(logic));
      }
    },
    [props.onChange]
  );

  // Callback to render the query builder UI.
  const renderBuilder = useCallback((props: BuilderProps) => {
    return (
      <div className="query-builder-container">
        <div className="query-builder qb-lite">
          <Builder {...props} />
        </div>
      </div>
    );
  }, []);

  // Render the Query component with the current configuration and tree, or null if no fields are defined.
  return Object.keys(config.fields).length > 0 ? (
    <div>
      <Query
        {...config}
        value={tree}
        onChange={onChange}
        renderBuilder={renderBuilder}
      />
    </div>
  ) : null;
}
