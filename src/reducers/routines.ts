import { Reducer } from 'redux';
import { SET_CURRENT, SET_ROUTINES } from '../actions/routines.js';
import { RootAction } from '../store.js';

export interface RoutinesState {
  routines: Array<Object>,
  current: {id: string}
}

const INITIAL_STATE: RoutinesState = {routines: [], current: {id: ""}};

//@ts-ignore
const routines: Reducer<RoutinesState, RootAction> = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_CURRENT:
      return {
        ...state,
        current: action.routine
      };
    case SET_ROUTINES:
      return {
        ...state,
        routines: action.routines
      };
    default:
      return state;
  }
};

export default routines;
