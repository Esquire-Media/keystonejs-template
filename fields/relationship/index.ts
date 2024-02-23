import {
  Field as _Field,
  controller as _controller,
} from "@keystone-6/core/fields/types/relationship/views";
import {
  type FieldController,
  type FieldControllerConfig,
  type FieldProps,
  type FieldTypeFunc,
  type BaseListTypeInfo,
} from "@keystone-6/core/types";
import {
  relationship as _relationship,
  type RelationshipFieldConfig,
} from "@keystone-6/core/fields";

type RelationshipExtensions = { refSortField?: string };

type RelationshipFieldControllerConfig = FieldControllerConfig<
  {
    refFieldKey?: string;
    refListKey: string;
    many: boolean;
    hideCreate: boolean;
    refLabelField: string;
    refSearchFields: string[];
  } & RelationshipExtensions &
    (
      | {
          displayMode: "select";
        }
      | {
          displayMode: "cards";
          cardFields: readonly string[];
          linkToItem: boolean;
          removeMode: "disconnect" | "none";
          inlineCreate: { fields: readonly string[] } | null;
          inlineEdit: { fields: readonly string[] } | null;
          inlineConnect: boolean;
        }
      | {
          displayMode: "count";
        }
    )
>;

type CardsDisplayModeOptions = {
  cardFields: readonly string[];
  linkToItem: boolean;
  removeMode: "disconnect" | "none";
  inlineCreate: { fields: readonly string[] } | null;
  inlineEdit: { fields: readonly string[] } | null;
  inlineConnect: boolean;
};
type SingleRelationshipValue = {
  kind: "one";
  id: null | string;
  initialValue: { label: string; id: string } | null;
  value: { label: string; id: string } | null;
};
type ManyRelationshipValue = {
  kind: "many";
  id: null | string;
  initialValue: { label: string; id: string }[];
  value: { label: string; id: string }[];
};
type CardsRelationshipValue = {
  kind: "cards-view";
  id: null | string;
  itemsBeingEdited: ReadonlySet<string>;
  itemBeingCreated: boolean;
  initialIds: ReadonlySet<string>;
  currentIds: ReadonlySet<string>;
  displayOptions: CardsDisplayModeOptions;
};
type CountRelationshipValue = {
  kind: "count";
  id: null | string;
  count: number;
};
type RelationshipController = FieldController<
  | ManyRelationshipValue
  | SingleRelationshipValue
  | CardsRelationshipValue
  | CountRelationshipValue,
  string
> &
  RelationshipExtensions & {
    display: "count" | "cards-or-select";
    listKey: string;
    refListKey: string;
    refFieldKey?: string;
    refLabelField: string;
    refSearchFields: string[];
    hideCreate: boolean;
    many: boolean;
  };

const relationship =
  <ListTypeInfo extends BaseListTypeInfo & RelationshipExtensions>({
    ref,
    ...config
  }: RelationshipFieldConfig<ListTypeInfo> &
    RelationshipExtensions): FieldTypeFunc<ListTypeInfo> =>
  (data) => {
    const original = _relationship({ ref, ...config })(data);
    const _getAdminMeta = original.getAdminMeta;
    original.getAdminMeta = () => {
      return {
        ...(_getAdminMeta ? _getAdminMeta.apply(this) : {}),
        refSortField: config.refSortField,
      };
    };
    return original;
  };

export { RelationshipFieldControllerConfig, RelationshipController };
export default relationship;
