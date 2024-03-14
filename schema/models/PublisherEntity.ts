import { list } from "@keystone-6/core";
import { select, text, relationship } from "../../fields";
import { allowAll } from "@keystone-6/core/access";
import { auditable } from "../auth";

const PublisherEntity = list({
  access: allowAll,
  fields: {
    ...auditable,
    publisher: relationship({
      ref: "Publisher",
      ui: {
        listView: { fieldMode: "hidden" },
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
      many: false,
    }),
    entityType: select({
      type: "enum",
      options: [{ label: "Audience", value: "audience" }],
      defaultValue: "audience",
    }),
    entityId: text({
      validation: { isRequired: true },
    })
  },
  db: {
    extendPrismaSchema: (schema) => {
      return schema.replace(
        /(model [^}]+)}/g,
        "$1@@unique([publisherId, entityType, entityId])\n}"
      );
    },
  },
});

export default PublisherEntity;
