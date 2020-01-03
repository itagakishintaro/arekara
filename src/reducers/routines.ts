import { Reducer } from 'redux';
import { REGIST, SET_TARGET } from '../actions/routines.js';
import { RootAction } from '../store.js';

export interface RoutineState {
  routines: Array;
}

const INITIAL_STATE: RoutineState = [];

const routines: Reducer<RoutineState, RootAction> = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case REGIST:
    case SET_TARGET:
      return action.id;
    default:
      return state;
  }
};

export default routines;
