import { Reducer } from 'redux';
import { SET_TARGET_ROUTINE } from '../actions/setting.js';
import { RootAction } from '../store.js';

export interface SettingState {
  routines: Object;
}

const INITIAL_STATE: SettingState = {};

const setting: Reducer<SettingState, RootAction> = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_TARGET_ROUTINE:
      return {
        ...state,
        targetRoutine: action.targetRoutine
      };
    default:
      return state;
  }
};

export default setting;
