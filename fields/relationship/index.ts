import {
  Field as _Field,
  controller as _controller,
} from "@keystone-6/core/fields/types/relationship/views";
import {
  type FieldTypeFunc,
  type BaseListTypeInfo,
  JSONValue,
} from "@keystone-6/core/types";
import { relationship as _relationship } from "@keystone-6/core/fields";
import type { RelationshipFieldConfig } from "./types";

const relationship =
  <ListTypeInfo extends BaseListTypeInfo>({
    ref,
    ...config
  }: RelationshipFieldConfig<ListTypeInfo>): FieldTypeFunc<ListTypeInfo> =>
  (data) => {
    const context = _relationship({ ref, ...config })(data);
    const AdminMeta = context.getAdminMeta;
    context.views = "./fields/relationship/wrapper";
    context.getAdminMeta = () => {
      const _meta = AdminMeta ? AdminMeta() : {};
      const meta = { ...(typeof _meta === "object" ? _meta : {}) };
      if (config.refOrderBy) meta["refOrderBy"] = config.refOrderBy;
      if (config.ui?.displayMode === "cards" && config.ui.orderBy)
        meta["orderBy"] = config.ui.orderBy;

      return meta as JSONValue;
    };
    return context;
  };

export default relationship;
