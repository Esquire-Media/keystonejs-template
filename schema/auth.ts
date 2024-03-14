import { BaseFields } from "@keystone-6/core";
import { timestamp, relationship } from "../fields";
import { BaseItem } from "@keystone-6/core/types";
import type { Lists } from ".keystone/types";

export const adminRoleTitle = process.env.ADMIN_ROLE_TITLE || "Administrator";

export type Session = {
  itemId: string;
  data: {
    name: string;
    email: string;
    role?: any;
  };
};

export const hasSession = ({ session }: { session?: Session }) => {
  return Boolean(session);
};

export const isAdmin = ({ session }: { session?: Session }) => {
  if (session && session.data.role?.title === adminRoleTitle) return true;
  return false;
};

const isOwner = ({
  session,
  item,
}: {
  session?: Session;
  item: BaseItem & { createdBy: string };
}) => {
  if (session && session.itemId === item.createdBy) return true;
  return false;
};

export const auditable: BaseFields<any> = {
  createdBy: relationship({
    ref: "User",
    ui: {
      listView: { fieldMode: "hidden" },
      createView: { fieldMode: "hidden" },
      itemView: { fieldMode: "read" },
    },
    hooks: {
      async resolveInput({ context, operation, resolvedData }) {
        if (operation === "create") {
          const [user] = await context.db.User.findMany({
            where: { id: { equals: context.session?.itemId } },
          });

          if (user) {
            return { connect: { id: user.id } };
          }
        }
        return resolvedData.createdBy;
      },
    },
  }),
  createdAt: timestamp({
    ui: {
      listView: { fieldMode: "hidden" },
      createView: { fieldMode: "hidden" },
      itemView: { fieldMode: "read" },
    },
    hooks: {
      async resolveInput({ resolvedData, operation }) {
        if (operation === "create") {
          return new Date();
        }
        return resolvedData.createdAt;
      },
    },
  }),
  updatedBy: relationship({
    ref: "User",
    ui: {
      listView: { fieldMode: "hidden" },
      createView: { fieldMode: "hidden" },
      itemView: { fieldMode: "read" },
    },
    hooks: {
      async resolveInput({ context, resolvedData }) {
        const [user] = await context.db.User.findMany({
          where: { id: { equals: context.session?.itemId } },
        });
        if (user) {
          return { connect: { id: user.id } };
        }
        return resolvedData.updatedBy;
      },
    },
  }),
  updatedAt: timestamp({
    ui: {
      listView: { fieldMode: "hidden" },
      createView: { fieldMode: "hidden" },
      itemView: { fieldMode: "read" },
    },
    hooks: {
      async resolveInput() {
        return new Date();
      },
    },
  }),
};
