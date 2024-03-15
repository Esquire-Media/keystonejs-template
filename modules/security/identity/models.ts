import { password, text } from "../../../fields";
import { BaseListTypeInfo, ListConfig } from "@keystone-6/core/types";
import { allowLoggedIn } from "./logic";

export const User: ListConfig<BaseListTypeInfo> = {
  access: allowLoggedIn,
  fields: {
    name: text({ validation: { isRequired: true } }),
    email: text({ validation: { isRequired: true }, isIndexed: "unique" }),
    password: password(),
  },
};
