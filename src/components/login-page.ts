import { html, css, customElement, property } from 'lit-element';
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

  static get styles() {
    return [
      SharedStyles,
      css`
      .login-button {
        background-color: var(--app-primary-color);
        color: var(--app-light-text-color);
        padding: 10px 32px 10px 8px;
        margin: 0 auto;
        font-size: 16px;
        vertical-align: middle;
      }

      .login-button::before {
        content: "";
        display: inline-block;
        height: 46px;
        width: 46px;
        margin: 0 24px 0 0;
        background:url(/images/g_normal.svg) no-repeat;
        background-size:contain;
        vertical-align: middle;
      }

      .login-button:focus::before {
        background:url(/images/g_focus.svg) no-repeat;
      }

      .login-button:active::before {
        background:url(/images/g_pressed.svg) no-repeat;
      }
      `
    ];
  }

  protected render() {
    return html`
      <section>
        <button class="login-button" @click="${this._googleLogin}">Sign up with Google</buttion>
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
