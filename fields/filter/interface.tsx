import React, { useState, useCallback } from "react";
import type {
  Config,
  ImmutableTree,
  BuilderProps,
} from "@react-awesome-query-builder/ui";
import { Utils as QbUtils } from "@react-awesome-query-builder/core";
import { Query, Builder, BasicConfig } from "@react-awesome-query-builder/ui";
import "@react-awesome-query-builder/ui/css/styles.css";

export type InterfaceProps = {
  value: Object | null;
  fields: any;
  onChange?: (value: string | null) => void;
  autoFocus?: boolean;
};

export default function Interface(props: InterfaceProps) {
  const config: Config = { ...BasicConfig, fields: props.fields };
  let tree: ImmutableTree = QbUtils.loadTree({
    id: QbUtils.uuid(),
    type: "group",
  });
  try {
    if (props.value) {
      tree = QbUtils.loadFromJsonLogic(props.value, config) || tree;
    }
  } catch {}
  const [state, setState] = useState({
    tree: QbUtils.checkTree(tree, config),
    config: config,
  });

  const onChange = useCallback(
    (immutableTree: ImmutableTree, config: Config) => {
      setState((prevState) => ({
        ...prevState,
        tree: immutableTree,
        config: config,
      }));

      if (props.onChange)
        props.onChange(
          JSON.stringify(
            QbUtils.jsonLogicFormat(immutableTree, config)["logic"]
          )
        );
    },
    []
  );

  const renderBuilder = useCallback(
    (props: BuilderProps) => (
      <div className="query-builder-container">
        <div className="query-builder qb-lite">
          <Builder {...props} />
        </div>
      </div>
    ),
    []
  );

  return (
    <div>
      <Query
        {...config}
        value={state.tree}
        onChange={onChange}
        renderBuilder={renderBuilder}
      />
    </div>
  );
}
