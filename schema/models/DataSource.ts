import { list } from "@keystone-6/core";
import { text, codeblock, relationship } from "../../fields";
import { allowAll } from "@keystone-6/core/access";
import { auditable } from "../auth";

const DataSource = list({
  access: allowAll,
  fields: {
    ...auditable,
    dataType: relationship({
      ref: "DataType",
      ui: {
        labelField: "title",
      },
    }),
    title: text({
      validation: { isRequired: true },
      isIndexed: "unique",
    }),
    filtering: codeblock({
      ui: {
        // language: "json",
        options: {
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          formatOnPaste: true,
          formatOnType: true,
          scrollBeyondLastLine: false,
        },
      },
    }),
  },
});

export default DataSource