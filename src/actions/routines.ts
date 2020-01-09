import { Action, ActionCreator } from 'redux';
export const SET_CURRENT = 'SET_CURRENT';
export const SET_ROUTINES = 'SET_ROUTINES';

export interface RoutinesActionSetCurrent extends Action<'SET_CURRENT'> {};
export interface RoutinesActionSetRoutines extends Action<'SET_ROUTINES'> {};
export type RoutinesAction = RoutinesActionSetCurrent | RoutinesActionSetRoutines;

export const setCurrent: ActionCreator<RoutinesActionSetCurrent> = routine => {
  return {
    type: SET_CURRENT,
    routine
  };
};

export const setRoutines: ActionCreator<RoutinesActionSetRoutines> = routines => {
  return {
    type: SET_ROUTINES,
    routines
  };
};