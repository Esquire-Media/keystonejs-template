import React from "react";
import type { WidgetProps } from "@react-awesome-query-builder/ui";
import ListInputWidget from "./widgets/ListInput";

export const Config = {
    operators: {
      in: {
        elasticSearchQueryType: "term",
        jsonLogic: "in",
        label: "Any In",
        labelForFormat: "IN",
        formatOp: (field, op, value: string, valueSrc, valueType, opDef) => {
          const formattedValues = value
            .split(",")
            .map((v) => `'${v}'`)
            .join(", ");
          return `${field} NOT IN (${formattedValues})`;
        },
        reversedOp: "not_in",
        valueSources: ["value", "values"],
        valueTypes: ["text"],
      },
      not_in: {
        elasticSearchQueryType: "term",
        jsonLogic: "in",
        label: "Not In",
        labelForFormat: "NOT IN",
        formatOp: (field, op, value: string, valueSrc, valueType, opDef) => {
          const formattedValues = value
            .split(",")
            .map((v) => `'${v}'`)
            .join(", ");
          return `${field} NOT IN (${formattedValues})`;
        },
        reversedOp: "in",
        valueSources: ["value", "values"],
        valueTypes: ["text"],
      },
    },
    types: {
      text: {
        widgets: {
          listInput: {
            operators: [
              "in",
              "not_in",
            ]
          }
        },
      },
    },
    widgets: {
      listInput: {
        type: 'text',
        valueSrc: 'value',
        factory: (props: WidgetProps) => <ListInputWidget {...props} />,
      },
    }
  }