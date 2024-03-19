import { SelectFieldConfig } from "@keystone-6/core/fields";
import { BaseListTypeInfo } from "@keystone-6/core/types";

export const DataType: SelectFieldConfig<BaseListTypeInfo> = {
  type: "enum",
  options: [
    { label: "Addresses", value: "addresses" },
    { label: "Device IDs", value: "device_ids" },
    { label: "Polygons", value: "polygons" },
  ],
};

export const Publisher: SelectFieldConfig<BaseListTypeInfo> = {
  type: "enum",
  options: [
    { label: "Meta", value: "meta" },
    { label: "OneView", value: "oneview" },
    { label: "Xandr", value: "xandr" },
  ],
};

export const PublisherEntityType: SelectFieldConfig<BaseListTypeInfo> = {
  type: "enum",
  options: [
    { label: "Advertiser", value: "advertiser" },
    { label: "Campaign", value: "campaign" },
    { label: "Ad Set", value: "adset" },
    { label: "Creative", value: "creative" },
    { label: "Audience", value: "audience" },
  ],
};
