import { list } from "@keystone-6/core";
import { password, text, relationship } from "../../fields";
import { allowAll } from "@keystone-6/core/access";
import { auditable } from "../auth";

const User = list({
  access: allowAll,
  fields: {
    ...auditable,
    name: text({ validation: { isRequired: true } }),
    email: text({
      validation: { isRequired: true },
      isIndexed: "unique",
    }),
    password: password({ validation: { isRequired: true } }),
    advertisers: relationship({
      ref: "Advertiser.users",
      many: true,
      ui: {
        labelField: "title",
        linkToItem: true,
        hideCreate: true,
      },
    }),
    role: relationship({
      ref: "Role.users",
      ui: {
        labelField: "title",
        hideCreate: false,
      },
    }),
  },
});

export default User