import { list } from "@keystone-6/core";
import { text, relationship } from "../../fields";
import { allowAll } from "@keystone-6/core/access";
import { auditable } from "../auth";

const Role = list({
  access: allowAll,
  fields: {
    ...auditable,
    title: text({
      validation: { isRequired: true },
      isIndexed: "unique",
    }),
    users: relationship({
      ref: "User.role",
      many: true,
      ui: {
        displayMode: "cards",
        cardFields: ["name", "email"],
        inlineConnect: true,
      },
    }),
  },
});

export default Role