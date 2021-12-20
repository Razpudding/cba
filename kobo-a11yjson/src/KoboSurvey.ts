type YesNoResult = 'true' | 'false' | 'undefined';

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

type FieldTypes = 'yesno' | 'float' | 'int';

//Safely parse a yes/no question and return a boolean or undefined
export const parseYesNo = (value:string) => {
  if (value === 'true') {
    return true;
  }
  return value === 'false' ? false : undefined;
};

//Safely parse an 'amount' question and return a number or undefined
export const parseNumber = (value:string) => {
  if (typeof value !== 'string' || value === '') {
    return undefined;
  }
  return parseInt(value, 10);
}