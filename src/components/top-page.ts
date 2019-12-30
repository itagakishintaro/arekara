import { html, css, customElement, property } from 'lit-element';
import { PageViewElement } from './page-view-element.js';

import { connect } from 'pwa-helpers/connect-mixin.js';

// This element is connected to the Redux store.
import { store, RootState } from '../store.js';

// These are the actions needed by this element.
import { navigate } from '../actions/app.js';

// We are lazy loading its reducer.
import user from '../reducers/user.js';
import routines from '../reducers/routines.js';
store.addReducers({
  user, routines
});

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles.js';

// compornents
import '../utils/loading-image.js';
import '@polymer/paper-dialog/paper-dialog.js';
import './routine-register.js';
import './routine-list.js';

@customElement('top-page')
export class TopPage extends connect(store)(PageViewElement) {
  @property({ type: String })
  private loadingDisplay = 'block';

  @property({ type: Object })
  private user = {};

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
      `
    ];
  }

  protected render() {
    return html`
      <section>
        <routine-list></routine-list>
        <button @click="${this.openRoutineRegister}">追加</button>
      </section>

      <paper-dialog id="modal" class="modal" modal>
        <routine-register></routine-register>
      </paper-dialog>

      <loading-image loadingDisplay="${this.loadingDisplay}"></loading-image>
    `
  }

  constructor() {
    super();
  }

  private openRoutineRegister() {
    this.shadowRoot.getElementById("modal").open();
  }

  // This is called every time something is updated in the store.
  stateChanged(state: RootState) {
    console.log('State Changed', state, state.user, state.routines);
    if((state.app.page !== "login") && (!state.user || !state.user.uid)){
      store.dispatch(navigate("/login"));
    }
    this.setAttribute('loadingDisplay', 'none');
    this.user = state.user;

    if(this.shadowRoot.getElementById("modal")){
      this.shadowRoot.getElementById("modal").close();
    }
  }
}
