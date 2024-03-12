import { list } from "@keystone-6/core";
import { text } from "../../fields";
import { allowAll } from "@keystone-6/core/access";
import { auditable } from "../auth";

const DataType = list({
  access: allowAll,
  fields: {
    ...auditable,
    title: text({
      validation: { isRequired: true },
      isIndexed: "unique",
    }),
  },
  ui: { labelField: "title" },
});

export default DataType