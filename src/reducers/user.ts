import { Reducer } from 'redux';
import { UPDATE } from '../actions/user.js';
import { RootAction } from '../store.js';

export interface UserState {
  uid: String;
}

const INITIAL_STATE: UserState = {};

const user: Reducer<UserState, RootAction> = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case UPDATE:
      return action.user;
    default:
      return state;
  }
};

export default user;
