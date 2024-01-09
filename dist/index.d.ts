import { SettingValue, FlagOverrides, OverrideBehaviour, createConsoleLogger } from "configcat-common";
export { default as ConfigCatPlugin, type PluginOptions as ConfigCatPluginOptions } from './plugins/ConfigCatPlugin';
export { default as FeatureWrapper } from './components/FeatureWrapper.vue';
export { createConsoleLogger };
export declare function createFlagOverridesFromMap(map: {
    [name: string]: NonNullable<SettingValue>;
}, behaviour: OverrideBehaviour): FlagOverrides;
export type { IOptions, IAutoPollOptions, IManualPollOptions, ILazyLoadingOptions, IConfigCatLogger, LogEventId, LogMessage, IConfigCatCache, IConfig, ISegment, SettingTypeMap, SettingValue, VariationIdValue, ISettingValueContainer, ISettingUnion, ISetting, ITargetingRule, IPercentageOption, ConditionTypeMap, IConditionUnion, ICondition, UserConditionComparisonValueTypeMap, IUserConditionUnion, IUserCondition, IPrerequisiteFlagCondition, ISegmentCondition, IConfigCatClient, IConfigCatClientSnapshot, IEvaluationDetails, SettingTypeOf, UserAttributeValue, FlagOverrides, IProvidesHooks, HookEvents } from "configcat-common";
export { PollingMode, DataGovernance, LogLevel, FormattableLogMessage, SettingType, UserComparator, PrerequisiteFlagComparator, SegmentComparator, SettingKeyValue, User, OverrideBehaviour, ClientCacheState, RefreshResult, } from "configcat-common";
