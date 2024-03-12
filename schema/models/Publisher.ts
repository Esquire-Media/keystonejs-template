import { list } from "@keystone-6/core";
import { text } from "../../fields";
import { allowAll } from "@keystone-6/core/access";
import { auditable } from "../auth";

const Publisher = list({
  access: allowAll,
  fields: {
    ...auditable,
    title: text({
      validation: { isRequired: true },
      isIndexed: "unique",
    }),
  },
});

export default Publisher;
