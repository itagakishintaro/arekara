import { LitElement, html, css, customElement, property } from 'lit-element';

import { connect } from 'pwa-helpers/connect-mixin.js';

// This element is connected to the Redux store.
import { store } from '../store.js';

// Actions
import { regist } from '../actions/routines.js';

// We are lazy loading its reducer.
import user from '../reducers/user.js';
store.addReducers({
  user
});

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles.js';

// Firebase
import firebase from "../utils/firebase.js";

// compornents
import '../utils/loading-image.js';

@customElement('routine-register')
export class RoutineRegister extends connect(store)(LitElement) {
  @property({ type: String })
  private loadingDisplay = 'none';  

  @property({ type: Object })
  private user = {};

  static get styles() {
    return [
      SharedStyles,
      css`
        input, select {
          display: block;
          border: 1px solid black;
        }
      `
    ];
  }

  protected render() {
    return html`
      <div>
        <label>名前</label>
        <input id="name" type="text"></input>
        <label>ペース</label>
        <select id="span">
          <option value="day">日</option>
          <option value="week">週</option>
          <option value="month">月</option>
          <option value="year">年</option>
        </select>
        <span>に</span>
        <input id="frequency" type="number"></input>
        <span>回</span>
        <div class="buttons">
          <button @click="${this.registRoutine}">登録する</button>
          <button dialog-confirm autofocus>キャンセル</button>
        </div>

        <loading-image loadingDisplay="${this.loadingDisplay}"></loading-image>
      </div>
    `
  }

  private registRoutine(){
    const name = this.shadowRoot.getElementById("name").value;
    const span = this.shadowRoot.getElementById("span").value;
    const frequency = this.shadowRoot.getElementById("frequency").value;
    const routine = { name, span, frequency };
    console.log(this.user.uid);
    firebase
      .firestore()
      .collection("users")
      .doc(this.user.uid)
      .collection("routines")
      .add(routine);
    store.dispatch(regist());
    // this.shadowRoot.parentNode.close();
  }

    // This is called every time something is updated in the store.
    stateChanged(state: RootState) {
      this.user = state.user;
      console.log(state);
    }
}
