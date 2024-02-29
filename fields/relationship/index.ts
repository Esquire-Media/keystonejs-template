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
import type { RelationshipFieldConfig } from "./types"

const relationship =
  <ListTypeInfo extends BaseListTypeInfo>({
    ref,
    ...config
  }: RelationshipFieldConfig<ListTypeInfo>): FieldTypeFunc<ListTypeInfo> =>
  (data) => {
    const original = _relationship({ ref, ...config })(data);
    const AdminMeta = original.getAdminMeta;
    original.views = "./fields/relationship/wrapper";
    original.getAdminMeta = () => {
      const meta = AdminMeta ? AdminMeta() : {};
      return {
        ...(typeof meta === "object" ? meta : {}),
        refOrderBy: config.refOrderBy,
      } as JSONValue;
    };
    return original;
  };

export default relationship;
