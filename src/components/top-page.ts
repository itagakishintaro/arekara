import { html, css, customElement, property } from 'lit-element';
import { PageViewElement } from './page-view-element.js';

import { connect } from 'pwa-helpers/connect-mixin.js';

// This element is connected to the Redux store.
import { store, RootState } from '../store.js';

// These are the actions needed by this element.
import { navigate } from '../actions/app.js';

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
import '@polymer/paper-dialog/paper-dialog.js';

@customElement('top-page')
export class TopPage extends connect(store)(PageViewElement) {
  @property({ type: String })
  loadingDisplay = 'block';

  @property({ type: Object })
  user = {};

  static get styles() {
    return [
      SharedStyles,
      css`
        .modal {
          position: fixed;
          top: 5vh;
          left: 5vw;
          width: 90vw;
          max-width: 90vw;
          height: 90vh;
          overflow: auto;
          margin: 0;
        }

        input, select {
          display: block;
          border: 1px solid black;
        }
      `
    ];
  }

  protected render() {
    return html`
      <section>
        <button @click="${this._openRoutineRegister}">追加</buttion>
      </section>

      <paper-dialog id="modal" class="modal" modal>
        <label>タイトル</label>
        <input type="text"></input>
        <label>ペース</label>
        <select>
          <option value="day">日</option>
          <option value="week">週</option>
          <option value="month">月</option>
          <option value="year">年</option>
        </select>
        <span>に</span>
        <input type="number"></input>
        <span>回</span>
        <div class="buttons">
          <button>登録する</button>
          <button dialog-confirm autofocus>キャンセル</button>
        </div>
      </paper-dialog>

      <loading-image loadingDisplay="${this.loadingDisplay}"></loading-image>
    `
  }

  constructor() {
    super();
  }

  private _openRoutineRegister(e) {
    console.log('_openRoutineRegister', this.shadowRoot.getElementById("modal"));
    this.shadowRoot.getElementById("modal").open();
    // e.target.open()
  }

  // This is called every time something is updated in the store.
  stateChanged(state: RootState) {
    console.log('State Changed', state);
    this.setAttribute('loadingDisplay', 'none');
    if((state.app.page !== "login") && (!state.user || !state.user.uid)){
      store.dispatch(navigate("/login"));
    }

  }
}
