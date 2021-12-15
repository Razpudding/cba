import { unset, set, setWith, entries, pickBy, includes, get } from 'lodash';

type YesNoResult = 'true' | 'false' | 'undefined';
type YesNoPartiallyResult = 'true' | 'partially' | 'false' | 'undefined';

//Detailed typing of a result from Kobo
export type KoboResult = {
  _id: number;
  _uuid: string;
  _notes?: unknown[];
  _tags?: unknown[];
  _status: string;
  _validation_status: unknown;
  _submission_time: unknown;
  _submitted_by: unknown | null;
  // actual form values
  'Survey/Survey_Type': string;
  'Parking/count': string;
  'Parking/forWheelchairUsers': YesNoResult;
  'Parking/WheelchairParking/count_001': string;
  'Parking/WheelchairParking/location': string,
  'Parking/WheelchairParking/distance': string,
  'Parking/WheelchairParking/hasDedicatedSignage': YesNoResult,
  'Parking/WheelchairParking/length': string,
  'Parking/WheelchairParking/width': string,
  'Parking/WheelchairParking/type': string,
  'Parking/WheelchairParking/isLocatedInside': YesNoResult,
  'Parking/WheelchairParking/maxVehicleHeight': string,
  'Parking/WheelchairParking/neededParkingPermits': string,
  'Parking/WheelchairParking/paymentBySpace': YesNoResult,
  'Parking/WheelchairParking/paymentByZone': YesNoResult,
  'Parking/KissAndRide': YesNoResult,
  'Parking/notes': string,
  'Entrances/count_002': string,
  'Entrances/isMainEntrance': YesNoResult,
  'Entrances/name': string
  'Entrances/isLevel_001': YesNoResult,
  'Entrances/hasFixedRamp': YesNoResult,
  'Entrances/hasRemovableRamp': YesNoResult,
  'Entrances/Ramp/Explanation_001': string,
  'Entrances/hasElevator': YesNoResult,
  'Entrances/ElevatorEquipmentId/Explanation_002': string,
  'Entrances/hasStairs': YesNoResult,
  'Entrances/Stairs/Explanation_003': string,
  'Entrances/hasDoor': YesNoResult,
  'Entrances/door/width_001': string,
  'Entrances/door/isRevolving': YesNoResult,
  'Entrances/door/isSliding': YesNoResult,
  'Entrances/door/isAutomaticOrAlwaysOpen': YesNoResult,
  'Entrances/door/isEasyToHoldOpen': YesNoResult,
  'Entrances/door/hasErgonomicDoorHandle': YesNoResult,
  'Entrances/door/DoorOpensToOutside': YesNoResult,
  'Entrances/door/turningSpaceInFront': string,
  'Entrances/hasIntercom': YesNoResult,
  'Ground/distanceToDroppedCurb': string,
  'Ground/evenPavement': YesNoResult,
  'Ground/isLevel': YesNoResult,
  'Ground/sidewalkConditions': string,
  'Ground/slopeAngle': string,
  'Ground/turningSpace': string,
  'Ground/notes_001': string,
  'Floors/HasFloors': YesNoResult,
  'Floors/count_003': string,
  'Floors/elevator': YesNoResult,
  'Floors/ElevatorEquipmentId_001/Explanation_004': string,
  'Floors/escalator': YesNoResult,
  'Floors/EscalatorEquipmentID/Explanation_005': string,
  'Floors/fixedRamp': YesNoResult,
  'Floors/Ramp_001/Explanation_006': string,
  'Floors/Stairs_001': YesNoResult,
  'Floors/Stairs_002/Explanation_007': string,
  'Floors/notes_003': string,

  //The generic key below is necessary to allow dynamically looking up properties
  [key: string]: any,
}
/*
export interface KoboDoorData {
  'width': string,
  'isRevolving': YesNoResult,
  'isSliding': YesNoResult,
  'isAutomaticOrAlwaysOpen': YesNoResult,
  'isEasyToHoldOpen': YesNoResult,
  'hasErgonomicDoorHandle': YesNoResult,
  'DoorOpensToOutside': YesNoResult,
  'turningSpaceInFront': string,
}

export interface KoboGroundData {
  'distanceToDroppedCurb': string,
  'evenPavement': YesNoResult,
  'isLevel': YesNoResult,
  'sidewalkConditions': string,
  'slopeAngle': string,
  'turningSpace': string,
  [key: string]: FieldTypes
}

//Testing a TS setup
// If each InterfaceInputData gets its own TS interface, can we make a general function
//  which gets data from one of these objects.
// Item.hasOwnProperty('name') is mss oplossing of generic types https://stackoverflow.com/questions/46100709/how-to-get-property-of-generic-type/46107617
export const parseVal = (data: KoboDoorData | KoboGroundData, field: string, type: FieldTypes) => {
  if (data.hasOwnProperty(field)){
    const rawValue = data[field];
  }

  if (data typeof KoboDoorData){
    let x = data as KoboDoorData;
    return x[field]
  }
  
}
*/

// make keys typesafe to prevent typos
export type KoboKey = keyof KoboResult;

type FieldTypes = 'yesno' | 'float' | 'int';

export const parseString = (value:string, type: FieldTypes) => {
  if (typeof value !== 'string') {
    return undefined;
  }

  if (type === 'yesno') {
    if (value === 'true') {
      return true;
    }
    return value === 'false' ? false : undefined;
  }

  if (type === 'float') {
    return parseFloat(value);
  }

  if (type === 'int') {
    return parseInt(value, 10);
  }
  return undefined
}

export const parseValue = (data: any, field: KoboKey, type: FieldTypes) => {
  const rawValue = data[field];
  if(rawValue === null){
    console.log("Found a null value for", field)
  }
  if (typeof rawValue === 'undefined') {
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

export const parseYesNo = (value:string) => {
  if (value === 'true') {
    return true;
  }
  return value === 'false' ? false : undefined;
};

export const parseNumber = (value:string) => {
  return parseInt(value, 10);
}

const parseHasWithDefault = (
  data: KoboResult,
  field: KoboKey,
  existsValue: any,
  doesNotExistValue: any
) => {
  const value = parseValue(data, field, 'yesno');

  if (value === true) {
    return existsValue;
  }

  if (value === false) {
    return doesNotExistValue;
  }

  return undefined;
};

const parseHasArray = (data: KoboResult, field: KoboKey) => {
  return parseHasWithDefault(data, field, [], null);
};

const parseHasEntry = (data: KoboResult, field: KoboKey) => {
  return parseHasWithDefault(data, field, {}, null);
};

const parseIsAnyOfWithDefault = (
  data: KoboResult,
  field: KoboKey,
  list: string[],
  existsValue: any,
  doesNotExistValue: any
) => {
  const rawValue = data[field];
  if (rawValue === null || typeof rawValue === 'undefined') {
    return rawValue;
  }

  return includes(list, rawValue) ? existsValue : doesNotExistValue;
};

const parseIsAnyOf = (data: KoboResult, field: KoboKey, list: string[]) => {
  return parseIsAnyOfWithDefault(data, field, list, true, false);
};

const parseIsAnyOfEntry = (data: KoboResult, field: KoboKey, list: string[]) => {
  return parseIsAnyOfWithDefault(data, field, list, {}, undefined);
};

export const parseFloatUnit = (data: KoboResult, field: KoboKey, unit: string, operator?: string) => {
  const value = parseValue(data, field, 'float') as number;
  // remove undefined values
  const unitValue = pickBy({
    operator,
    unit,
    value
  });
  return value && !isNaN(value) ? unitValue : undefined;
};

export const parseIntUnit = (data: KoboResult, field: KoboKey, unit: string, operator?: string) => {
  const value = parseValue(data, field, 'int') as number;
  // remove undefined values
  const unitValue = pickBy({
    operator,
    unit,
    value
  });
  return value && !isNaN(value) ? unitValue : undefined;
};

const parseMultiSelect = (data: KoboResult, field: KoboKey) => {
  const rawValue = data[field];
  if (rawValue === null || typeof rawValue === 'undefined') {
    return rawValue;
  }
  if (typeof rawValue !== 'string') {
    return undefined;
  }

  return rawValue.split(' ');
};

// export const transformKoboToA11y = (data: KoboResult) => {
//   const usedLengthUnit = data['user/user_measuring'] || 'cm';

//   const mapping = {
//     geometry: data._geolocation ? { coordinates: data._geolocation.reverse(), type: 'Point' } : {},
//     'properties.originalId': data._id && `${data._id}`,
//     'properties.infoPageUrl': null,
//     'properties.originalData': JSON.stringify(data),
//     // basic place data
//     'properties.name': data['outside/name'],
//     'properties.phoneNumber': data['place_phone_number'] || data['phone_number'],
//     'properties.emailAddress': data['place_email_address'],
//     'properties.placeWebsiteUrl': data['place_website_url'],
//     'properties.category':
//       data['outside/category/category_top'] || data['outside/category/category_sub'] || 'undefined',
//     'properties.description': data['wheelchair_comment'],
//     'properties.accessibility.accessibleWith.wheelchair': {
//       true: true,
//       false: false,
//       partially: false,
//       undefined: undefined
//     }[data['is_wheelchair_accessible']],
//     'properties.accessibility.partiallyAccessibleWith.wheelchair':
//       data['is_wheelchair_accessible'] === 'partially' ? true : undefined,
//     // entrances
//     'properties.accessibility.isWellLit': parseYesNo(data, 'inside/is_well_lit'),
//     'properties.accessibility.isQuiet': parseYesNo(data, 'inside/is_quiet'),
//     'properties.accessibility.entrances': parseHasArray(data, 'outside/entrance/has_entrance'),
//     'properties.accessibility.entrances.0': parseHasEntry(data, 'outside/entrance/has_entrance'),
//     'properties.accessibility.entrances.0.hasFixedRamp': parseYesNo(
//       data,
//       'outside/entrance/has_fixed_ramp'
//     ),
//     // stairs
//     'properties.accessibility.entrances.0.stairs': parseHasArray(
//       data,
//       'outside/entrance/has_steps'
//     ),
//     'properties.accessibility.entrances.0.stairs.0': parseHasEntry(
//       data,
//       'outside/entrance/has_steps'
//     ),
//     'properties.accessibility.entrances.0.stairs.0.count': parseValue(
//       data,
//       'outside/entrance/steps_count',
//       'int'
//     ),
//     // 'properties.accessibility.entrances.0.stairs.0.stepHeight':
//     //   parseFloatUnit(data, 'outside/entrance/steps_height', usedLengthUnit) ||
//     //   parseHasWithDefault(data, 'outside/entrance/steps_low_height', flatStepHeight, undefined),
//     'properties.accessibility.entrances.0.hasRemovableRamp': parseYesNo(
//       data,
//       'outside/entrance/has_mobile_ramp'
//     ),
//     // doors
//     'properties.accessibility.entrances.0.doors': parseHasArray(data, 'outside/entrance/has_door'),
//     'properties.accessibility.entrances.0.doors.0': parseHasEntry(
//       data,
//       'outside/entrance/has_door'
//     ),
//     'properties.accessibility.entrances.0.doors.0.isAutomaticOrAlwaysOpen': parseYesNo(
//       data,
//       'outside/entrance/has_automatic_door'
//     ),
//     // restrooms
//     'properties.accessibility.restrooms': parseHasArray(data, 'inside/toilet/has_toilet'),
//     'properties.accessibility.restrooms.0': parseHasEntry(data, 'inside/toilet/has_toilet'),
//     // entrance
//     'properties.accessibility.restrooms.0.entrance.isLevel': parseYesNo(
//       data,
//       'inside/toilet/stepless_access'
//     ),
//     'properties.accessibility.restrooms.0.entrance.door.width': parseFloatUnit(
//       data,
//       'inside/toilet/door_width',
//       usedLengthUnit
//     ),
//     // toilet
//     'properties.accessibility.restrooms.0.toilet': parseHasEntry(data, 'inside/toilet/has_toilet'),
//     'properties.accessibility.restrooms.0.toilet.heightOfBase': parseFloatUnit(
//       data,
//       'inside/toilet/seat_height',
//       usedLengthUnit
//     ),
//     'properties.accessibility.restrooms.0.toilet.spaceOnUsersLeftSide': parseFloatUnit(
//       data,
//       'inside/toilet/free_space_left',
//       usedLengthUnit
//     ),
//     'properties.accessibility.restrooms.0.toilet.spaceOnUsersRightSide': parseFloatUnit(
//       data,
//       'inside/toilet/free_space_right',
//       usedLengthUnit
//     ),
//     'properties.accessibility.restrooms.0.toilet.spaceInFront': parseFloatUnit(
//       data,
//       'inside/toilet/free_space_front',
//       usedLengthUnit
//     ),
//     // bars
//     'properties.accessibility.restrooms.0.toilet.hasGrabBars': parseIsAnyOf(
//       data,
//       'inside/toilet/has_arm_rests',
//       ['left_and_right', 'right', 'left']
//     ),
//     'properties.accessibility.restrooms.0.toilet.grabBars': parseIsAnyOfEntry(
//       data,
//       'inside/toilet/has_arm_rests',
//       ['left_and_right', 'right', 'left']
//     ),
//     'properties.accessibility.restrooms.0.toilet.grabBars.onUsersLeftSide': parseIsAnyOf(
//       data,
//       'inside/toilet/has_arm_rests',
//       ['left_and_right', 'left']
//     ),
//     'properties.accessibility.restrooms.0.toilet.grabBars.onUsersRightSide': parseIsAnyOf(
//       data,
//       'inside/toilet/has_arm_rests',
//       ['left_and_right', 'right']
//     ),
//     // washBasin
//     'properties.accessibility.restrooms.0.washBasin': parseHasEntry(
//       data,
//       'inside/toilet/has_basin'
//     ),
//     'properties.accessibility.restrooms.0.washBasin.accessibleWithWheelchair': parseYesNo(
//       data,
//       'inside/toilet/basin_wheelchair_reachable'
//     ),
//     // 'properties.accessibility.restrooms.0.washBasin.spaceBelow': parseHasWithDefault(
//     //   data,
//     //   'inside/toilet/basin_wheelchair_fits_belows',
//     //   wheelChairWashBasin,
//     //   null
//     // ),
//     'properties.accessibility.restrooms.0.washBasin.isLocatedInsideRestroom': parseYesNo(
//       data,
//       'inside/toilet/basin_inside_cabin'
//     ),
//     // animal policy
//     'properties.accessibility.animalPolicy.allowsServiceAnimals': parseYesNo(
//       data,
//       'inquire/are_service_animals_allowed'
//     ),
//     // staff
//     'properties.accessibility.staff.isTrainedForDisabilities': parseYesNo(
//       data,
//       'inquire/staff_has_disabled_training'
//     ),
//     'properties.accessibility.staff.spokenLanguages': parseMultiSelect(
//       data,
//       'inquire/staff_spoken_sign_langs'
//     ),
//     'properties.accessibility.staff.isTrainedInSigning': parseYesNo(
//       data,
//       'inquire/staff_can_speak_sign_lang'
//     ),
//     // media
//     'properties.accessibility.media.isLargePrint': parseYesNo(
//       data,
//       'inquire/media/has_large_print'
//     ),
//     'properties.accessibility.media.isAudio': parseYesNo(data, 'inquire/media/has_audio'),
//     'properties.accessibility.media.isBraille': parseYesNo(data, 'inquire/media/has_braille')
//   };

//   const result = {
//     properties: {
//       hasAccessibility: true
//     }
//   };
//   // if there is a null in the history, do not set a value
//   const customizedSetter = (currValue: any) => (currValue === null ? null : undefined);
//   for (const [key, value] of entries(mapping)) {
//     if (typeof value !== 'undefined') {
//       setWith(result, key, value, customizedSetter);
//     }
//   }

//   const userDefinedA11y = data['is_wheelchair_accessible'];

//   /* Commented out because it relies on wheelmap functionality not included in repo, see notes
//   if (!userDefinedA11y || userDefinedA11y === 'undefined') {
//     // rate place a11y automatically

//     const a11y = evaluateWheelmapA11y(result);

//     // Currently, these fields are exlusive.
//     if (a11y === 'yes') {
//       set(result, 'properties.accessibility.accessibleWith.wheelchair', true);
//       unset(result, 'properties.accessibility.partiallyAccessibleWith.wheelchair');
//     } else if (a11y === 'partial') {
//       unset(result, 'properties.accessibility.accessibleWith.wheelchair');
//       set(result, 'properties.accessibility.partiallyAccessibleWith.wheelchair', true);
//     } else if (a11y === 'no') {
//       set(result, 'properties.accessibility.accessibleWith.wheelchair', false);
//       unset(result, 'properties.accessibility.partiallyAccessibleWith.wheelchair');
//     }
//   } else {
//     // ensure that only one value is set to true
//     if (get(result, 'properties.accessibility.accessibleWith.wheelchair') === true) {
//       unset(result, 'properties.accessibility.partiallyAccessibleWith.wheelchair');
//     } else if (
//       get(result, 'properties.accessibility.partiallyAccessibleWith.wheelchair') === true
//     ) {
//       unset(result, 'properties.accessibility.accessibleWith.wheelchair');
//     }
//   }
//   */

//   if (Object.keys(get(result, 'properties.accessibility.accessibleWith') || {}).length === 0) {
//     unset(result, 'properties.accessibility.accessibleWith');
//   }
//   if (
//     Object.keys(get(result, 'properties.accessibility.partiallyAccessibleWith') || {}).length === 0
//   ) {
//     unset(result, 'properties.accessibility.partiallyAccessibleWith');
//   }

//   /* Commented out because it relies on wheelmap functionality not included in repo, see notes
//   // rate place a11y
//   const toiletA11y = evaluateToiletWheelmapA11y(result);

//   // rate toilet a11y
//   // TODO this field doesn't exist in ac format! Clarify & align with wheelmap frontend & a11yjson
//   if (toiletA11y === 'yes') {
//     setWith(
//       result,
//       'properties.accessibility.restrooms.0.isAccessibleWithWheelchair',
//       true,
//       customizedSetter
//     );
//   } else if (toiletA11y === 'no') {
//     setWith(
//       result,
//       'properties.accessibility.restrooms.0.isAccessibleWithWheelchair',
//       false,
//       customizedSetter
//     );
//   }
//   */

//   return result;
// };