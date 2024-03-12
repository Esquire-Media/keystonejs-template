import { list } from "@keystone-6/core";
import { text, relationship } from "../../fields";
import { allowAll } from "@keystone-6/core/access";
import { auditable } from "../auth";

const Advertiser = list({
  access: allowAll,
  fields: {
    ...auditable,
    title: text({
      validation: { isRequired: true },
      isIndexed: "unique",
    }),
    users: relationship({
      ref: "User.advertisers",
      many: true,
      ui: {
        displayMode: "cards",
        cardFields: ["name", "email"],
        inlineConnect: true,
        hideCreate: true,
      },
    }),
    audiences: relationship({
      ref: "Audience.advertisers",
      many: true,
      ui: {
        displayMode: "cards",
        cardFields: ["tags", "dataSource"],
        linkToItem: true,
      },
    }),
  },
});

export default Advertiser