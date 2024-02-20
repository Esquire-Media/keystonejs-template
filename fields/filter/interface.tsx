import React from "react";
import { FilterOptions } from ".";

export type InterfaceProps = {
  value: string | null;
  filterOptions: FilterOptions;
  onChange?: (value: string | null) => void;
  autoFocus?: boolean;
};

export default function Interface(props: InterfaceProps) {
  return (
    <div>
      <div>{JSON.stringify(props.filterOptions)}</div>
      <div>{props.value}</div>
    </div>
  );
}
