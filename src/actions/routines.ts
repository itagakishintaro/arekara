import { Action, ActionCreator } from 'redux';
export const SET_CURRENT = 'SET_CURRENT';

export interface RoutinesActionSetCurrent extends Action<'SET_CURRENT'> {};
export type RoutinesAction = RoutinesActionSetCurrent;

export const setCurrent: ActionCreator<RoutinesActionSetCurrent> = routine => {
  return {
    type: SET_CURRENT,
    routine
  };
};