import { Action, ActionCreator } from 'redux';
export const SET_TARGET_ROUTINE = 'SET_TARGET_ROUTINE';

export interface RoutineActionSetTargetRoutine extends Action<'SET_TARGET_ROUTINE'> {};
export type RoutineAction = RoutineActionSetTargetRoutine;

export const setTargetRoutine: ActionCreator<RoutineActionSetTargetRoutine> = id => {
  return {
    type: SET_TARGET_ROUTINE,
    targetRoutine: id
  };
};