import React, { useState, useCallback } from "react";
import type {
  JsonGroup,
  Config,
  ImmutableTree,
  BuilderProps,
} from "@react-awesome-query-builder/ui";
import { Query, Builder, Utils as QbUtils } from "@react-awesome-query-builder";
import { FilterOptions } from "."; // Make sure this import path is correct
import "antd/dist/antd.css"; // Import styles if you're using Ant Design
import "@react-awesome-query-builder/css/styles.scss";
import "@react-awesome-query-builder/css/compact_styles.scss"; // or import compact styles

export type InterfaceProps = {
  value: string | null;
  config: FilterOptions;
  onChange?: (value: string | null) => void;
  autoFocus?: boolean;
};

export default function Interface(props: InterfaceProps) {
  const [state, setState] = useState({
    tree: QbUtils.checkTree(QbUtils.loadTree(props.value), props.config),
    config: props.config,
  });

  const onChange = useCallback(
    (immutableTree: ImmutableTree, config: Config) => {
      setState((prevState) => ({
        ...prevState,
        tree: immutableTree,
        config: config,
      }));

      if (props.onChange) {
        props.onChange(QbUtils.getTree(immutableTree));
      }
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
        {...props.config}
        value={state.tree}
        onChange={onChange}
        renderBuilder={renderBuilder}
      />
    </div>
  );
}
