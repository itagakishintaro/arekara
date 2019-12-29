import { html, customElement } from 'lit-element';
import { PageViewElement } from './page-view-element.js';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles.js';

// Firebase
import firebase from "../utils/firebase.js";

@customElement('login-page')
export class LoginPage extends PageViewElement {
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
    `
  }

  private _googleLogin() {
    console.log("google login");
    let provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithRedirect(provider)
      .finally(() => {
        console.log('logged in');
      });
  }
}
