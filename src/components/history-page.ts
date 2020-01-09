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

// Firebase
import firebase from "../utils/firebase.js";

// compornents
import "../utils/loading-image.js";
import "./routine-header.js";
import "./routine-figures.js";
import "@polymer/paper-dialog/paper-dialog.js";
import "@polymer/iron-icons/iron-icons.js";
import "@polymer/paper-icon-button/paper-icon-button.js";

@customElement("history-page")
export class HistoryPage extends connect(store)(PageViewElement) {
  @property({ type: String })
  private loadingDisplay = "none";

  @property({ type: Object })
  private routine = {};

  @property({ type: Object })
  private user = {};

  @property({ type: String })
  private selected = "";

  static get styles() {
    return [
      SharedStyles,
      css`
        .history-header {
          margin: 2em 0 0 0;
          border-bottom: 1px solid #eee;
        }
        .history {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .history-item {
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5em 0;
        }
        .right-icon {
          color: var(--app-drawer-selected-color);
          margin: 0;
          padding: 0;
          box-sizing: content-box;
          width: 1em;
          height: 1em;
        }
      `
    ];
  }

  protected render() {
    return html`
      <section>
        <routine-header .routine="${this.routine}"></routine-header>
        <routine-figures .routine="${this.routine}"></routine-figures>
        <div class="history-header">履歴</div>
        <ul class="history">
          ${Object.keys(this.routine.records).map(
            datetime => html`
              <li
                class="history-item"
                @click="${this.openCalendar}"
                data-datetime="${datetime}"
              >
                <div>${moment(datetime).format("YYYY/MM/DD HH:mm")}</div>
                <paper-icon-button
                  class="right-icon"
                  icon="chevron-right"
                ></paper-icon-button>
              </li>
            `
          )}
        </ul>
      </section>

      <paper-dialog id="modalCalendar" class="modal" modal>
        <input id="datetime" type="datetime-local"></input>
        <button @click="${this.updateRecord}">完了</button>
        <button @click="${this.closeCalendar}">キャンセル</button>
      </paper-dialog>

      <loading-image loadingDisplay="${this.loadingDisplay}"></loading-image>
    `;
  }

  constructor() {
    super();
  }

  // This is called every time something is updated in the store.
  stateChanged(state: RootState) {
    this.user = state.user;
    if(state.routines && state.routines.current){
      this.setAttribute('routine', JSON.stringify(state.routines.current));
    }

    const newRoutine = state.routines.routines.filter(r => r.id === this.routine.id)[0];
    if( JSON.stringify(this.routine.records) !== JSON.stringify(newRoutine.records) ){
      this.setAttribute('routine', JSON.stringify(newRoutine));
    }
  }

  private openCalendar(e) {
    this.setAttribute(
      "selected",
      e.currentTarget.dataset.datetime
    );
    this.shadowRoot.getElementById("datetime").value = this.selected.substring(0, 16);
    this.shadowRoot.getElementById("modalCalendar").open();
  }

  private closeCalendar() {
    this.shadowRoot.getElementById("modalCalendar").close();
  }

  private updateRecord() {
    const oldDatetime = this.selected;
    const newDatetime = moment(
      this.shadowRoot.getElementById("datetime").value
    ).format();
    firebase
      .firestore()
      .collection("users")
      .doc(this.user.uid)
      .collection("routines")
      .doc(this.routine.id)
      .set(
        { records: { [oldDatetime]: firebase.firestore.FieldValue.delete(), [newDatetime]: true } },
        { merge: true }
      );
      this.closeCalendar();
  }
}
