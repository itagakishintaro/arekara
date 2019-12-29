import { html, customElement, property } from 'lit-element';
import { PageViewElement } from './page-view-element.js';

import { connect } from 'pwa-helpers/connect-mixin.js';

// This element is connected to the Redux store.
import { store, RootState } from '../store.js';

// These are the actions needed by this element.
import { update } from '../actions/user.js';

// page
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

// loading
import '../utils/loading-image.js';

@customElement('login-page')
export class LoginPage extends connect(store)(PageViewElement) {
  @property({ type: String })
  loadingDisplay = 'block';

  @property({ type: Object })
  user = {};

  @property({type: String})
  private _page = 'login';

  static get styles() {
    return [
      SharedStyles
    ];
  }

  protected render() {
    return html`
      <section>
        <button @click="${this._googleLogin}">Google でログイン</buttion>
      </section>

      <loading-image loadingDisplay="${this.loadingDisplay}"></loading-image>
    `
  }

  private _googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithRedirect(provider);
  }

  // This is called every time something is updated in the store.
  stateChanged(state: RootState) {
    console.log('State Changed', state);
    this.setAttribute('loadingDisplay', 'none');
  }
}
