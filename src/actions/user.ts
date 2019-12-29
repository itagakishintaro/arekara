import { Action, ActionCreator } from 'redux';
export const UPDATE = 'UPDATE';

export interface UserActionUpdate extends Action<'UPDATE'> {};
export type UserAction = UserActionUpdate;

export const update: ActionCreator<UserActionUpdate> = user => {
  return {
    type: UPDATE,
    user
  };
};
