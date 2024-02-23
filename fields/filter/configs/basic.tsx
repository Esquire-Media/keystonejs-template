import React from 'react';
import { mergeDeep } from "@apollo/client/utilities";
import type { Config, WidgetProps } from "@react-awesome-query-builder/ui";
import { BasicConfig } from "@react-awesome-query-builder/ui";
import ListInputWidget from "../widgets/ListInput";
import '@react-awesome-query-builder/ui/css/styles.css';

export default (init: Config = BasicConfig): Config =>
  mergeDeep(init, {
    operators: {
      in: {
        elasticSearchQueryType: "term",
        jsonLogic: "in",
        label: "Any In",
        labelForFormat: "IN",
        formatOp: (field, op, value: string, valueSrc, valueType, opDef) => {
          console.log(field, op, value, valueSrc, valueType, opDef)
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
  });
