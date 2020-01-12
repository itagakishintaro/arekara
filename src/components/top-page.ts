import { html, css, customElement, property } from "lit-element";
import { PageViewElement } from "./page-view-element.js";

import { connect } from "pwa-helpers/connect-mixin.js";

// This element is connected to the Redux store.
import { store, RootState } from "../store.js";

// These are the actions needed by this element.
import { navigate } from "../actions/app.js";

// We are lazy loading its reducer.
import user from "../reducers/user.js";
import routines from "../reducers/routines.js";
store.addReducers({
  user,
  routines
});

// These are the shared styles needed by this element.
import { SharedStyles } from "./shared-styles.js";

// compornents
import "@polymer/paper-dialog/paper-dialog.js";
import "@polymer/iron-icons/iron-icons.js";
import "@polymer/paper-icon-button/paper-icon-button.js";
import "./routine-register.js";
import "./routine-list.js";

interface Modal extends HTMLElement {
  open: Function,
  close: Function
}
@customElement("top-page")
export class TopPage extends connect(store)(PageViewElement) {
  @property({ type: String })
  private loadingDisplay = "block";

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

        .control {
          text-align: right;
        }
        .add-btn {
          width: 4em;
          height: 4em;
          padding: 0;
          color: var(--app-dark-text-color);
        }
      `
    ];
  }

  protected render() {
    return html`
      <section>
        <routine-list></routine-list>
        <div class="control">
          <paper-icon-button
            class="add-btn"
            icon="add-circle-outline"
            @click="${this.openRoutineRegister}"
            >追加</paper-icon-button
          >
        </div>
      </section>

      <paper-dialog id="modal" class="modal" modal>
        <routine-register></routine-register>
      </paper-dialog>

      <loading-image loadingDisplay="${this.loadingDisplay}"></loading-image>
    `;
  }

  constructor() {
    super();
  }

  private openRoutineRegister() {
    (<Modal>this.shadowRoot!.getElementById("modal")).open();
  }

  // This is called every time something is updated in the store.
  stateChanged(state: RootState) {
    if (state.app.page !== "login" && (!state.user || !state.user.uid)) {
      store.dispatch(navigate("/login"));
    }
    this.setAttribute("loadingDisplay", "none");
    
    if (this.shadowRoot!.getElementById("modal")) {
      (<Modal>this.shadowRoot!.getElementById("modal")).close();
    }
  }
}
