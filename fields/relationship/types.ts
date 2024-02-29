import {
  type FieldController,
  type FieldControllerConfig,
  type BaseListTypeInfo,
  CommonFieldConfig,
} from "@keystone-6/core/types";

// This is the default display mode for Relationships
type SelectDisplayConfig = {
  ui?: {
    // Sets the relationship to display as a Select field
    displayMode?: "select";
    /**
     * The path of the field to use from the related list for item labels in the select.
     * Defaults to the labelField configured on the related list.
     */
    labelField?: string;
    searchFields?: string[];
  };
};
type CardInlineMode = {
  fields: readonly string[];
  sort?: string;
};
type CardsDisplayConfig = {
  ui?: {
    // Sets the relationship to display as a list of Cards
    displayMode: "cards";
    /* The set of fields to render in the default Card component **/
    cardFields: readonly string[];
    /** Causes the default Card component to render as a link to navigate to the related item */
    linkToItem?: boolean;
    /** Determines whether removing a related item in the UI will delete or unlink it */
    removeMode?: "disconnect" | "none"; // | 'delete';
    /** Configures inline create mode for cards (alternative to opening the create modal) */
    inlineCreate?: CardInlineMode;
    /** Configures inline edit mode for cards */
    inlineEdit?: CardInlineMode;
    /** Configures whether a select to add existing items should be shown or not */
    inlineConnect?:
      | boolean
      | {
          /**
           * The path of the field to use from the related list for item labels in the inline connect
           * Defaults to the labelField configured on the related list.
           */
          labelField: string;
          searchFields?: string[];
        };
  };
};
type CountDisplayConfig = {
  many: true;
  ui?: {
    // Sets the relationship to display as a count
    displayMode: "count";
  };
};
type OneDbConfig = {
  many?: false;
  db?: {
    extendPrismaSchema?: (field: string) => string;
    foreignKey?:
      | true
      | {
          map: string;
        };
  };
};
type ManyDbConfig = {
  many: true;
  db?: {
    relationName?: string;
    extendPrismaSchema?: (field: string) => string;
  };
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
type CardsDisplayModeOptions = {
  cardFields: readonly string[];
  linkToItem: boolean;
  removeMode: "disconnect" | "none";
  inlineCreate: CardInlineMode | null;
  inlineEdit: CardInlineMode | null;
  inlineConnect: boolean;
};
type OrderBy = [Record<string, "asc" | "desc">];

type ConfigBase = {
  many: boolean;
  hideCreate: boolean;
  refFieldKey?: string;
  refLabelField: string;
  refListKey: string;
  refSearchFields: string[];
  refOrderBy?: OrderBy;
};
type ConfigDisplayDefault = {
  displayMode: "select" | "count";
};
type ConfigDisplayCards = CardsDisplayModeOptions & {
  displayMode: "cards";
};

type RelationshipControllerConfig = FieldControllerConfig<
  ConfigBase & (ConfigDisplayDefault | ConfigDisplayCards)
>;

type RelationshipController = FieldController<
  | ManyRelationshipValue
  | SingleRelationshipValue
  | CardsRelationshipValue
  | CountRelationshipValue,
  string
> &
  ConfigBase & {
    display: "count" | "cards-or-select";
    listKey: string;
  };

type RelationshipFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    many?: boolean;
    ref: string;
    refOrderBy?: OrderBy;
    ui?: {
      hideCreate?: boolean;
    };
  } & (OneDbConfig | ManyDbConfig) &
    (SelectDisplayConfig | CardsDisplayConfig | CountDisplayConfig);

export {
  RelationshipFieldConfig,
  RelationshipController,
  RelationshipControllerConfig,
};
