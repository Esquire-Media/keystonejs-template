import { JsonFieldConfig, json } from "@keystone-6/core/fields";
import {
  BaseListTypeInfo,
  CommonFieldConfig,
  FieldTypeFunc,
} from "@keystone-6/core/types";

type GeoframeFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo>;

export const geoframe =
  <ListTypeInfo extends BaseListTypeInfo>({
    ...config
  }: GeoframeFieldConfig<ListTypeInfo>): FieldTypeFunc<ListTypeInfo> =>
  (data) => {
    const _config = { ...config };
    const context = json({ ...(_config as JsonFieldConfig<ListTypeInfo>) })(
      data
    );
    const AdminMeta = context.getAdminMeta;
    context.views = "./fields/geoframe/wrapper";
    context.getAdminMeta = () => {
      const _meta = AdminMeta ? AdminMeta() : {};
      const meta: any = { ...(typeof _meta === "object" ? _meta : {}) };
      return meta;
    };
    return context;
  };

export default geoframe;
