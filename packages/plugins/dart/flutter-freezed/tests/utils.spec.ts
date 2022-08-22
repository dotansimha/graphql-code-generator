import { CustomDecorator } from "../src/config";
import {
  getCustomDecorators,
  getFreezedConfigValue,
  transformCustomDecorators
} from "../src/utils";
import { customDecoratorsConfig, defaultConfig, typeConfig } from "./config";

/** utils test */
describe("flutter-freezed: utils & helpers", () => {
  test("getFreezedConfigValue(): returns the expected value for globalFreezedConfig and typeSpecificFreezedConfig", () => {
    const Starship = "Starship";

    expect(getFreezedConfigValue("alwaysUseJsonKeyName", defaultConfig)).toBe(
      false
    );
    expect(
      getFreezedConfigValue("alwaysUseJsonKeyName", typeConfig, Starship)
    ).toBe(true);

    expect(getFreezedConfigValue("copyWith", defaultConfig)).toBe(undefined);
    expect(getFreezedConfigValue("copyWith", typeConfig, Starship)).toBe(false);

    expect(
      getFreezedConfigValue("customDecorators", defaultConfig)
    ).toMatchObject({});
    expect(getFreezedConfigValue("equal", defaultConfig)).toBe(undefined);
    expect(getFreezedConfigValue("fromJsonToJson", defaultConfig)).toBe(true);
    expect(getFreezedConfigValue("immutable", defaultConfig)).toBe(true);
    expect(
      getFreezedConfigValue("makeCollectionsUnmodifiable", defaultConfig)
    ).toBe(undefined);
    expect(getFreezedConfigValue("mergeInputs", defaultConfig)).toMatchObject(
      []
    );
    expect(getFreezedConfigValue("mutableInputs", defaultConfig)).toBe(true);
    expect(
      getFreezedConfigValue("privateEmptyConstructor", defaultConfig)
    ).toBe(false);
    expect(getFreezedConfigValue("unionKey", defaultConfig)).toBe(undefined);

    expect(getFreezedConfigValue("unionValueCase", defaultConfig)).toBe(
      undefined
    );
    expect(getFreezedConfigValue("unionValueCase", typeConfig, Starship)).toBe(
      "FreezedUnionCase.pascal"
    );
  });

  describe("customDecorators", () => {
    const globalCustomDecorators = getCustomDecorators(customDecoratorsConfig, [
      "class"
    ]);

    const droidCustomDecorators = getCustomDecorators(
      customDecoratorsConfig,
      ["class", "union_factory"],
      "Droid"
    );

    const idCustomDecorators = getCustomDecorators(
      customDecoratorsConfig,
      ["union_factory_parameter"],
      "Droid",
      "id"
    );

    test("getCustomDecorators()", () => {
      expect(globalCustomDecorators).toMatchObject<CustomDecorator>({
        "@JsonSerializable(explicitToJson: true)": {
          applyOn: ["class"],
          mapsToFreezedAs: "custom"
        }
      });

      expect(droidCustomDecorators).toMatchObject<CustomDecorator>({
        "@JsonSerializable(explicitToJson: true)": {
          applyOn: ["class"],
          mapsToFreezedAs: "custom"
        },
        "@FreezedUnionValue": {
          applyOn: ["union_factory"],
          arguments: ["'BestDroid'"],
          mapsToFreezedAs: "custom"
        }
      });

      expect(idCustomDecorators).toMatchObject<CustomDecorator>({
        "@NanoId": {
          applyOn: ["union_factory_parameter"],
          arguments: ["size: 16", "alphabets: NanoId.ALPHA_NUMERIC"],
          mapsToFreezedAs: "custom"
        }
      });
    });

    test("transformCustomDecorators()", () => {
      expect(transformCustomDecorators(globalCustomDecorators)).toMatchObject([
        "@JsonSerializable(explicitToJson: true)\n"
      ]);

      /*
      expect(transformCustomDecorators(droidCustomDecorators, 'Droid')).toMatchObject([
        '@JsonSerializable(explicitToJson: true)\n',
        "@FreezedUnionValue('BestDroid')\n",
      ]);

      expect(transformCustomDecorators(idCustomDecorators, 'Droid', 'id')).toMatchObject([
        '@NanoId(size: 16, alphabets: NanoId.ALPHA_NUMERIC)\n',
      ]);
      */
    });
  });
});
