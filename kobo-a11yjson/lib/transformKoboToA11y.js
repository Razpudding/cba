"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformKoboToA11y = void 0;
const lodash_1 = require("lodash");
const parseValue = (data, field, type) => {
    const rawValue = data[field];
    if (rawValue === null || typeof rawValue === 'undefined') {
        return rawValue;
    }
    if (typeof rawValue !== 'string') {
        return undefined;
    }
    if (type === 'yesno') {
        if (rawValue === 'true') {
            return true;
        }
        return rawValue === 'false' ? false : undefined;
    }
    if (type === 'float') {
        return parseFloat(rawValue);
    }
    if (type === 'int') {
        return parseInt(rawValue, 10);
    }
    return undefined;
};
const parseYesNo = (data, field) => {
    return parseValue(data, field, 'yesno');
};
const parseHasWithDefault = (data, field, existsValue, doesNotExistValue) => {
    const value = parseValue(data, field, 'yesno');
    if (value === true) {
        return existsValue;
    }
    if (value === false) {
        return doesNotExistValue;
    }
    return undefined;
};
const parseHasArray = (data, field) => {
    return parseHasWithDefault(data, field, [], null);
};
const parseHasEntry = (data, field) => {
    return parseHasWithDefault(data, field, {}, null);
};
const parseIsAnyOfWithDefault = (data, field, list, existsValue, doesNotExistValue) => {
    const rawValue = data[field];
    if (rawValue === null || typeof rawValue === 'undefined') {
        return rawValue;
    }
    return (0, lodash_1.includes)(list, rawValue) ? existsValue : doesNotExistValue;
};
const parseIsAnyOf = (data, field, list) => {
    return parseIsAnyOfWithDefault(data, field, list, true, false);
};
const parseIsAnyOfEntry = (data, field, list) => {
    return parseIsAnyOfWithDefault(data, field, list, {}, undefined);
};
const parseFloatUnit = (data, field, unit, operator) => {
    const value = parseValue(data, field, 'float');
    // remove undefined values
    const unitValue = (0, lodash_1.pickBy)({
        operator,
        unit,
        value
    });
    return value && !isNaN(value) ? unitValue : undefined;
};
const parseIntUnit = (data, field, unit, operator) => {
    const value = parseValue(data, field, 'int');
    // remove undefined values
    const unitValue = (0, lodash_1.pickBy)({
        operator,
        unit,
        value
    });
    return value && !isNaN(value) ? unitValue : undefined;
};
const parseMultiSelect = (data, field) => {
    const rawValue = data[field];
    if (rawValue === null || typeof rawValue === 'undefined') {
        return rawValue;
    }
    if (typeof rawValue !== 'string') {
        return undefined;
    }
    return rawValue.split(' ');
};
const transformKoboToA11y = (data) => {
    const usedLengthUnit = data['user/user_measuring'] || 'cm';
    const mapping = {
        geometry: data._geolocation ? { coordinates: data._geolocation.reverse(), type: 'Point' } : {},
        'properties.originalId': data._id && `${data._id}`,
        'properties.infoPageUrl': null,
        'properties.originalData': JSON.stringify(data),
        // basic place data
        'properties.name': data['outside/name'],
        'properties.phoneNumber': data['place_phone_number'] || data['phone_number'],
        'properties.emailAddress': data['place_email_address'],
        'properties.placeWebsiteUrl': data['place_website_url'],
        'properties.category': data['outside/category/category_top'] || data['outside/category/category_sub'] || 'undefined',
        'properties.description': data['wheelchair_comment'],
        'properties.accessibility.accessibleWith.wheelchair': {
            true: true,
            false: false,
            partially: false,
            undefined: undefined
        }[data['is_wheelchair_accessible']],
        'properties.accessibility.partiallyAccessibleWith.wheelchair': data['is_wheelchair_accessible'] === 'partially' ? true : undefined,
        // entrances
        'properties.accessibility.isWellLit': parseYesNo(data, 'inside/is_well_lit'),
        'properties.accessibility.isQuiet': parseYesNo(data, 'inside/is_quiet'),
        'properties.accessibility.entrances': parseHasArray(data, 'outside/entrance/has_entrance'),
        'properties.accessibility.entrances.0': parseHasEntry(data, 'outside/entrance/has_entrance'),
        'properties.accessibility.entrances.0.hasFixedRamp': parseYesNo(data, 'outside/entrance/has_fixed_ramp'),
        // stairs
        'properties.accessibility.entrances.0.stairs': parseHasArray(data, 'outside/entrance/has_steps'),
        'properties.accessibility.entrances.0.stairs.0': parseHasEntry(data, 'outside/entrance/has_steps'),
        'properties.accessibility.entrances.0.stairs.0.count': parseValue(data, 'outside/entrance/steps_count', 'int'),
        // 'properties.accessibility.entrances.0.stairs.0.stepHeight':
        //   parseFloatUnit(data, 'outside/entrance/steps_height', usedLengthUnit) ||
        //   parseHasWithDefault(data, 'outside/entrance/steps_low_height', flatStepHeight, undefined),
        'properties.accessibility.entrances.0.hasRemovableRamp': parseYesNo(data, 'outside/entrance/has_mobile_ramp'),
        // doors
        'properties.accessibility.entrances.0.doors': parseHasArray(data, 'outside/entrance/has_door'),
        'properties.accessibility.entrances.0.doors.0': parseHasEntry(data, 'outside/entrance/has_door'),
        'properties.accessibility.entrances.0.doors.0.isAutomaticOrAlwaysOpen': parseYesNo(data, 'outside/entrance/has_automatic_door'),
        // restrooms
        'properties.accessibility.restrooms': parseHasArray(data, 'inside/toilet/has_toilet'),
        'properties.accessibility.restrooms.0': parseHasEntry(data, 'inside/toilet/has_toilet'),
        // entrance
        'properties.accessibility.restrooms.0.entrance.isLevel': parseYesNo(data, 'inside/toilet/stepless_access'),
        'properties.accessibility.restrooms.0.entrance.door.width': parseFloatUnit(data, 'inside/toilet/door_width', usedLengthUnit),
        // toilet
        'properties.accessibility.restrooms.0.toilet': parseHasEntry(data, 'inside/toilet/has_toilet'),
        'properties.accessibility.restrooms.0.toilet.heightOfBase': parseFloatUnit(data, 'inside/toilet/seat_height', usedLengthUnit),
        'properties.accessibility.restrooms.0.toilet.spaceOnUsersLeftSide': parseFloatUnit(data, 'inside/toilet/free_space_left', usedLengthUnit),
        'properties.accessibility.restrooms.0.toilet.spaceOnUsersRightSide': parseFloatUnit(data, 'inside/toilet/free_space_right', usedLengthUnit),
        'properties.accessibility.restrooms.0.toilet.spaceInFront': parseFloatUnit(data, 'inside/toilet/free_space_front', usedLengthUnit),
        // bars
        'properties.accessibility.restrooms.0.toilet.hasGrabBars': parseIsAnyOf(data, 'inside/toilet/has_arm_rests', ['left_and_right', 'right', 'left']),
        'properties.accessibility.restrooms.0.toilet.grabBars': parseIsAnyOfEntry(data, 'inside/toilet/has_arm_rests', ['left_and_right', 'right', 'left']),
        'properties.accessibility.restrooms.0.toilet.grabBars.onUsersLeftSide': parseIsAnyOf(data, 'inside/toilet/has_arm_rests', ['left_and_right', 'left']),
        'properties.accessibility.restrooms.0.toilet.grabBars.onUsersRightSide': parseIsAnyOf(data, 'inside/toilet/has_arm_rests', ['left_and_right', 'right']),
        // washBasin
        'properties.accessibility.restrooms.0.washBasin': parseHasEntry(data, 'inside/toilet/has_basin'),
        'properties.accessibility.restrooms.0.washBasin.accessibleWithWheelchair': parseYesNo(data, 'inside/toilet/basin_wheelchair_reachable'),
        // 'properties.accessibility.restrooms.0.washBasin.spaceBelow': parseHasWithDefault(
        //   data,
        //   'inside/toilet/basin_wheelchair_fits_belows',
        //   wheelChairWashBasin,
        //   null
        // ),
        'properties.accessibility.restrooms.0.washBasin.isLocatedInsideRestroom': parseYesNo(data, 'inside/toilet/basin_inside_cabin'),
        // animal policy
        'properties.accessibility.animalPolicy.allowsServiceAnimals': parseYesNo(data, 'inquire/are_service_animals_allowed'),
        // staff
        'properties.accessibility.staff.isTrainedForDisabilities': parseYesNo(data, 'inquire/staff_has_disabled_training'),
        'properties.accessibility.staff.spokenLanguages': parseMultiSelect(data, 'inquire/staff_spoken_sign_langs'),
        'properties.accessibility.staff.isTrainedInSigning': parseYesNo(data, 'inquire/staff_can_speak_sign_lang'),
        // media
        'properties.accessibility.media.isLargePrint': parseYesNo(data, 'inquire/media/has_large_print'),
        'properties.accessibility.media.isAudio': parseYesNo(data, 'inquire/media/has_audio'),
        'properties.accessibility.media.isBraille': parseYesNo(data, 'inquire/media/has_braille')
    };
    const result = {
        properties: {
            hasAccessibility: true
        }
    };
    // if there is a null in the history, do not set a value
    const customizedSetter = (currValue) => (currValue === null ? null : undefined);
    for (const [key, value] of (0, lodash_1.entries)(mapping)) {
        if (typeof value !== 'undefined') {
            (0, lodash_1.setWith)(result, key, value, customizedSetter);
        }
    }
    const userDefinedA11y = data['is_wheelchair_accessible'];
    /* Commented out because it relies on wheelmap functionality not included in repo, see notes
    if (!userDefinedA11y || userDefinedA11y === 'undefined') {
      // rate place a11y automatically
  
      const a11y = evaluateWheelmapA11y(result);
  
      // Currently, these fields are exlusive.
      if (a11y === 'yes') {
        set(result, 'properties.accessibility.accessibleWith.wheelchair', true);
        unset(result, 'properties.accessibility.partiallyAccessibleWith.wheelchair');
      } else if (a11y === 'partial') {
        unset(result, 'properties.accessibility.accessibleWith.wheelchair');
        set(result, 'properties.accessibility.partiallyAccessibleWith.wheelchair', true);
      } else if (a11y === 'no') {
        set(result, 'properties.accessibility.accessibleWith.wheelchair', false);
        unset(result, 'properties.accessibility.partiallyAccessibleWith.wheelchair');
      }
    } else {
      // ensure that only one value is set to true
      if (get(result, 'properties.accessibility.accessibleWith.wheelchair') === true) {
        unset(result, 'properties.accessibility.partiallyAccessibleWith.wheelchair');
      } else if (
        get(result, 'properties.accessibility.partiallyAccessibleWith.wheelchair') === true
      ) {
        unset(result, 'properties.accessibility.accessibleWith.wheelchair');
      }
    }
    */
    if (Object.keys((0, lodash_1.get)(result, 'properties.accessibility.accessibleWith') || {}).length === 0) {
        (0, lodash_1.unset)(result, 'properties.accessibility.accessibleWith');
    }
    if (Object.keys((0, lodash_1.get)(result, 'properties.accessibility.partiallyAccessibleWith') || {}).length === 0) {
        (0, lodash_1.unset)(result, 'properties.accessibility.partiallyAccessibleWith');
    }
    /* Commented out because it relies on wheelmap functionality not included in repo, see notes
    // rate place a11y
    const toiletA11y = evaluateToiletWheelmapA11y(result);
  
    // rate toilet a11y
    // TODO this field doesn't exist in ac format! Clarify & align with wheelmap frontend & a11yjson
    if (toiletA11y === 'yes') {
      setWith(
        result,
        'properties.accessibility.restrooms.0.isAccessibleWithWheelchair',
        true,
        customizedSetter
      );
    } else if (toiletA11y === 'no') {
      setWith(
        result,
        'properties.accessibility.restrooms.0.isAccessibleWithWheelchair',
        false,
        customizedSetter
      );
    }
    */
    return result;
};
exports.transformKoboToA11y = transformKoboToA11y;
