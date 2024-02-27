import React from "react";
import type { WidgetProps } from "@react-awesome-query-builder/ui";
import { RelativePeriodSelector } from ".";

export const Config = {
  operators: {
    within_last: {
      label: "Within Last",
      valueSources: ["value"],
      reversedOp: "not_within_last",
      jsonLogic: (field, op, value) => ({
        within_last: [field, { unit: value.unit, amount: value.amount }],
      }),
    },
    not_within_last: {
      label: "Not Within Last",
      valueSources: ["value"],
      reversedOp: "within_last",
      jsonLogic: (field, op, value) => ({
        not_within_last: [field, { unit: value.unit, amount: value.amount }],
      }),
    },
  },
  types: {
    date: {
      widgets: {
        relativePeriodSelector: {
          operators: ["within_last", "not_within_last"],
        },
      },
    },
    datetime: {
      widgets: {
        relativePeriodSelector: {
          operators: ["within_last", "not_within_last"],
        },
      },
    },
    time: {
      widgets: {
        relativePeriodSelector: {
          operators: ["within_last", "not_within_last"],
        },
      },
    },
  },
  widgets: {
    relativePeriodSelector: {
      valueSrc: "value",
      factory: (props: WidgetProps) => <RelativePeriodSelector {...props} />,
      defaultValue: { amount: 1, unit: "months" },
    },
  },
};

export default Config;
