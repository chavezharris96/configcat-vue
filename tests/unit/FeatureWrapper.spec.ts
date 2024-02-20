import { mount } from "@vue/test-utils";
import { test, expect } from "vitest";

// Mock Component
import {
  ClientCacheState,
  FeatureWrapper,
  HookEvents,
  IConfigCatClientSnapshot,
  OverrideBehaviour,
  SettingTypeOf,
  SettingValue,
  User,
  createFlagOverridesFromMap,
} from "../../src";
import ConfigCatPlugin, {
  type PluginOptions,
} from "../../src/plugins/ConfigCatPlugin";
import {
  ConfigCatClientMockBase,
  ConfigCatClientSnapshotMockBase,
} from "../mocks/ConfigCatClientMocks";

test("The default slot should render when the isFeatureFlagEnabled value is true", () => {
  const featureFlagKey = "isFeatureFlagEnabled";

  const pluginOptions: PluginOptions = {
    sdkKey: "local-only",
    clientOptions: {
      flagOverrides: createFlagOverridesFromMap(
        { [featureFlagKey]: true },
        OverrideBehaviour.LocalOnly
      ),
    },
  };

  const wrapper = mount(FeatureWrapper, {
    global: {
      plugins: [[ConfigCatPlugin, pluginOptions]],
    },
    props: {
      featureKey: featureFlagKey,
    },
    slots: {
      default: "<div>the new feature</div>",
      else: "<div>feature is not enabled</div>",
      loading: "<div>component is loading</div>",
    },
  });

  try {
    // Assert the rendered text of the component
    expect(wrapper.html()).toContain("<div>the new feature</div>");
  } finally {
    wrapper.unmount();
  }
});

test("The else slot should render when the isFeatureFlagEnabled value is false", () => {
  const featureFlagKey = "isFeatureFlagEnabled";

  const pluginOptions: PluginOptions = {
    sdkKey: "local-only",
    clientOptions: {
      flagOverrides: createFlagOverridesFromMap(
        { [featureFlagKey]: false },
        OverrideBehaviour.LocalOnly
      ),
    },
  };

  const wrapper = mount(FeatureWrapper, {
    global: {
      plugins: [[ConfigCatPlugin, pluginOptions]],
    },
    props: {
      featureKey: featureFlagKey,
    },
    slots: {
      default: "<div>the new feature</div>",
      else: "<div>feature is not enabled</div>",
      loading: "<div>component is loading</div>",
    },
  });

  try {
    // Assert the rendered text of the component
    expect(wrapper.html()).toContain("<div>feature is not enabled</div>");
  } finally {
    wrapper.unmount();
  }
});

test("The loading slot should render when the client is still initializing", () => {
  const featureFlagKey = "isFeatureFlagEnabled";

  // To test this scenario, we can't use flag overrides because there's no initialization period in that case,
  // feature flag values provided by flag overrides are available immediately.
  // So, we have to take the hard way: we need to provide a mock implementation of `IConfigCatClient` to the component.

  const clientMock = new (class extends ConfigCatClientMockBase {
    snapshot() {
      // Returning a snapshot with NoFlagData will cause the component to take the "async" way on component initialization (see onBeforeMount).
      return new ConfigCatClientSnapshotMockBase(ClientCacheState.NoFlagData);
    }

    getValueAsync<T extends SettingValue>(
      key: string,
      defaultValue: T,
      user?: User | undefined
    ): Promise<SettingTypeOf<T>> {
      if (key === featureFlagKey) {
        return new Promise((_) => {}); // by returning a Promise which never fullfils, we can make the initialization period infinite
      }

      return super.getValueAsync(key, defaultValue, user);
    }

    off<TEventName extends keyof HookEvents>(
      eventName: TEventName,
      listener: (...args: HookEvents[TEventName]) => void
    ): this {
      if (eventName == "configChanged") {
        // The component unsubscribes from this event on component teardown (see onUnmounted).
        // This is irrelevant in the case of this test, so a no-op will be fine.
        return this;
      }

      return super.off(eventName, listener);
    }
  })();

  const wrapper = mount(FeatureWrapper, {
    global: {
      provide: {
        configCatClient: clientMock,
      },
    },
    props: {
      featureKey: featureFlagKey,
    },
    slots: {
      default: "<div>the new feature</div>",
      else: "<div>feature is not enabled</div>",
      loading: "<div>component is loading</div>",
    },
  });

  try {
    // Assert the rendered text of the component
    expect(wrapper.html()).toContain("<div>component is loading</div>");
  } finally {
    wrapper.unmount();
  }
});

test("The FeatureWrapper component should throw an exception when the plugin is not installed", () => {
  const featureFlagKey = "isFeatureFlagEnabled";

  try {
    const wrapper = mount(FeatureWrapper, {
      props: {
        featureKey: featureFlagKey,
      },
      slots: {
        default: "<div>the new feature</div>",
        else: "<div>feature is not enabled</div>",
        loading: "<div>component is loading</div>",
      },
    });
    // If the component was created successfully, fail the test
    expect(wrapper.exists()).toBe(false);
  } catch (error) {
    // Assert that the error is the expected exception
    expect(error.message).toContain("ConfigCatPlugin was not installed.");
  }
});

test("The FeatureWrapper component should emit flagValueChanged when the feature flag value changes", async () => {
  const featureFlagKey = "isFeatureFlagEnabled";

  const pluginOptions: PluginOptions = {
    sdkKey: "local-only",
    clientOptions: {
      flagOverrides: createFlagOverridesFromMap(
        { [featureFlagKey]: true },
        OverrideBehaviour.LocalOnly
      ),
    },
  };

  const wrapper = mount(FeatureWrapper, {
    global: {
      plugins: [[ConfigCatPlugin, pluginOptions]],
    },
    props: {
      featureKey: featureFlagKey,
    },
    slots: {
      default: "<div>the new feature</div>",
      else: "<div>feature is not enabled</div>",
      loading: "<div>component is loading</div>",
    },
  });

  // Update the ref
  wrapper.vm.isFeatureFlagEnabled = false;

  // Trigger the configChangeHandler method, which executes an emit
  wrapper.vm.configChangedHandler();

  // Check if the wrapper emitted as expected
  try {
    expect(wrapper.emitted().flagValueChanged).toBeTruthy();
  } finally {
    wrapper.unmount();
  }
});

// Transitions

test("The FeatureWrapper component should transition from loading to default", async () => {
  const featureFlagKey = "isFeatureFlagEnabled";

  const pluginOptions: PluginOptions = {
    sdkKey: "local-only",
    clientOptions: {
      flagOverrides: createFlagOverridesFromMap(
        { [featureFlagKey]: true },
        OverrideBehaviour.LocalOnly
      ),
    },
  };

  const wrapper = mount(FeatureWrapper, {
    global: {
      plugins: [[ConfigCatPlugin, pluginOptions]],
    },
    props: {
      featureKey: featureFlagKey,
    },
    slots: {
      default: "<div>the new feature</div>",
      else: "<div>feature is not enabled</div>",
      loading: "<div>component is loading</div>",
    },
  });

  // Wait for any asynchronous updates

  try {
    // Set the feature flag value to null
    wrapper.vm.isFeatureFlagEnabled = null;

    // Trigger reactivity updates
    await wrapper.vm.$nextTick();

    // The loading slot should be displayed
    expect(wrapper.html()).toContain("<div>component is loading</div>");

    // Set the feature flag value to true
    wrapper.vm.isFeatureFlagEnabled = true;

    // Trigger reactivity updates
    await wrapper.vm.$nextTick();

    // The default slot should be displayed
    expect(wrapper.html()).toContain("<div>the new feature</div>");
  } finally {
    wrapper.unmount();
  }
});
