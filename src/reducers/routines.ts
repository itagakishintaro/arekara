import { Reducer } from 'redux';
import { SET_CURRENT } from '../actions/routines.js';
import { RootAction } from '../store.js';

export interface RoutinesState {
  routines: Array,
  current: Object
}

const INITIAL_STATE: RoutinesState = {};

const routines: Reducer<RoutinesState, RootAction> = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_CURRENT:
      return {
        ...state,
        current: action.routine
      };
    default:
      return state;
  }
};

export default routines;
