import { Action, ActionCreator } from 'redux';
export const REGIST = 'REGIST';

export interface RoutineActionRegist extends Action<'REGIST'> {};
export type RoutineAction = RoutineActionRegist;

export const regist: ActionCreator<RoutineActionRegist> = () => {
  return {
    type: REGIST
  };
};
