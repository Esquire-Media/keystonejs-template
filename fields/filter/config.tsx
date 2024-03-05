import { mergeDeep } from "@apollo/client/utilities";
import ListInputConfig from "./widgets/ListInput";
import RelativePeriodConfig from "./widgets/RelativePeriod";
import { BasicFuncs } from '@react-awesome-query-builder/ui';

const Config = mergeDeep(ListInputConfig, RelativePeriodConfig, {
  funcs: {
    ...BasicFuncs,
  },
  widgets: {
    date: {
      dateFormat: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD"
    },
    datetime: {
      timeFormat: "HH:mm:ss",
      dateFormat: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
    },
    time: {
      timeFormat: "HH:mm:ss",
      valueFormat: "HH:mm:ss",
    },
  },
});

export default Config;
