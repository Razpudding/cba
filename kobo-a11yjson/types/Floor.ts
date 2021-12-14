import * as a11y from '@sozialhelden/a11yjson'
/**
 * Describes a floor/level of a place. 
 */
export interface Floor {
    /**
     * `true` if the floor is reachable by elevator.
     */
    reachableByElevator?: boolean;
    /**
     * A text elaborating on the use of the elevator.
     */
    elevatorExplanation?: a11y.LocalizedString;
    /**
     * `true` if the floor is reachable by escalator.
     */
    reachableByEscalator?: boolean;
    /**
     * A text elaborating on the use of the escalator.
     */
    escalatorExplanation?: a11y.LocalizedString;
    /**
     * `true` if this floor has a fixed ramp, false if not, undefined if unknown.
     */
    hasFixedRamp?: boolean;
    /**
     * A text elaborating on the use of the ramp.
     */
    rampExplanation?: a11y.LocalizedString;
    /**
     * Object that describes stairs that you have to take to get to this floor, undefined if unknown.
     */
    stairs?: a11y.Stairs;
    /**
     * A text elaborating on the function and or accessability of this floor
     */
    floorExplanation?: a11y.LocalizedString;
}