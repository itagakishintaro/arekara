import { Reducer } from 'redux';
import { REGIST } from '../actions/routines.js';
import { RootAction } from '../store.js';

export interface RoutineState {
  routines: Array;
}

const INITIAL_STATE: RoutineState = [];

const routines: Reducer<RoutineState, RootAction> = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case REGIST:
      return state;
    default:
      return state;
  }
};

export default routines;
