import { html, customElement, property } from 'lit-element';
import { PageViewElement } from './page-view-element.js';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles.js';

// Firebase
import firebase from "../utils/firebase.js";

// loading
import '../utils/loading-image.js';

@customElement('login-page')
export class LoginPage extends PageViewElement {
  @property({ type: String })
  loadingDisplay = 'block';

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

  constructor() {
    super();
    // Auth Changed
    firebase.auth().onAuthStateChanged(async user => {
      this.setAttribute('loadingDisplay', 'none');
    }
  }

  private _googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithRedirect(provider);
  }
}
