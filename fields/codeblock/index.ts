import { controller as _controller } from "@keystone-6/core/fields/types/text/views";
import {
  type FieldTypeFunc,
  type BaseListTypeInfo,
  JSONValue,
} from "@keystone-6/core/types";
import { TextFieldConfig, text } from "@keystone-6/core/fields";
import { CodeBlockFieldConfig } from "./types";

const codeblock =
  <ListTypeInfo extends BaseListTypeInfo>({
    ...config
  }: CodeBlockFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> =>
  (data) => {
    const _config = {...config};
    const context = text({ ...(_config as TextFieldConfig<ListTypeInfo>) })(
      data
    );
    const AdminMeta = context.getAdminMeta;
    context.views = "./fields/codeblock/wrapper";
    context.getAdminMeta = () => {
      const _meta = AdminMeta ? AdminMeta() : {};
      const meta: any = { ...(typeof _meta === "object" ? _meta : {}) };
      meta["viewProps"] = {
        widget: config.ui?.widget || "monaco",
        language: config.ui?.language,
        theme: config.ui?.theme,
        options: config.ui?.options,
      };
      return meta as JSONValue;
    };
    return context;
  };

export default codeblock;
