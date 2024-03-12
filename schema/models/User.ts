import { list } from "@keystone-6/core";
import { password, text, relationship } from "../../fields";
import { allowAll } from "@keystone-6/core/access";
import { Session, auditable, hasSession, isAdmin } from "../auth";
import { BaseItem } from "@keystone-6/core/types";

const isSelf = ({ session, item }: { session?: Session; item: BaseItem }) => {
  if (session && session.itemId === item.id) return true;
  return false;
};

const User = list({
  access: {
    operation: {
      create: allowAll,
      query: allowAll,
      update: hasSession, // only allow users to update _anything_, but what they can update is limited by the access.filter.* and access.item.* access controls
      delete: isAdmin, // only allow admins to delete users
    },
    filter: {
      query: (context) => {
        if (isAdmin(context)) {
          return {};
        } else if (hasSession(context)) {
          return {
            id: {
              equals: context.session.itemId,
            },
          };
        } else {
          return false;
        }
      },
      update: (context) => {
        if (isAdmin(context)) {
          return {};
        } else if (hasSession(context)) {
          return {
            id: {
              equals: context.session.itemId,
            },
          };
        } else {
          return false;
        }
      },
    },
    item: {
      update: (context) => isAdmin(context) || isSelf(context), // this is redundant as ^filter.update should stop unauthorised updates we include it anyway as a demonstration
    },
  },
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
      access: {
        read: (context) => isAdmin(context) || isSelf(context),
        create: (context) => isAdmin(context),
        update: (context) => isAdmin(context),
      },
      ref: "Role.users",
      ui: {
        labelField: "title",
        // only admins can edit this field
        createView: {
          fieldMode: args => (isAdmin(args) ? 'edit' : 'hidden'),
        },
        itemView: {
          fieldMode: args => (isAdmin(args) ? 'edit' : 'read'),
        },
        hideCreate: false,
      },
    }),
  },
  ui: {
    hideDelete: (args) => !isAdmin(args), // only show deletion options for admins
    listView: {
      initialColumns: ["name", "email", "role"],
    },
  },
});

export default User;
