import { list } from "@keystone-6/core";
import { text } from "../../fields";
import { allowAll } from "@keystone-6/core/access";

const Tag = list({
  access: allowAll,
  fields: {
    title: text({
      validation: { isRequired: true },
      isIndexed: "unique",
    }),
  },
});

export default Tag;
