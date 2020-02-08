import { LitElement, html, css, customElement, property } from "lit-element";

import { connect } from "pwa-helpers/connect-mixin.js";

// This element is connected to the Redux store.
import { store, RootState } from "../store.js";

// These are the actions needed by this element.
import { navigate } from "../actions/app.js";
import { setCurrent } from "../actions/routines";

// We are lazy loading its reducer.
import user from "../reducers/user.js";
import routines from "../reducers/routines";
store.addReducers({
  user,
  routines
});

// These are the shared styles needed by this element.
import { SharedStyles } from "./shared-styles.js";

// Firebase
import firebase from "../utils/firebase.js";

import "../utils/loading-image.js";
import "./routine-header.js";
import "./routine-figures.js";
import "@polymer/iron-collapse/iron-collapse.js";
import "@polymer/paper-card/paper-card.js";
import "@polymer/paper-dialog/paper-dialog.js";
import "@polymer/iron-icons/iron-icons.js";
import "@polymer/paper-icon-button/paper-icon-button.js";
import "@polymer/paper-toast/paper-toast.js";

declare var moment: any;
interface Modal extends HTMLElement {
  open: Function,
  close: Function
}
interface Collapse extends HTMLElement {
  toggle: Function;
}
@customElement("routine-item")
export class RoutineItem extends connect(store)(LitElement) {
  @property({ type: String })
  private loadingDisplay = "none";

  @property({ type: Object })
  private user = { uid: "" };

  @property({ type: Object })
  private routine = { records: Object, id: String };

  @property({ type: Boolean })
  private opened = false;

  static get styles() {
    return [
      SharedStyles,
      css`
        .card {
          display: block;
          margin: 0 0 20px;
          border-top: 6px solid var(--app-primary-color);
        }

        .button-wrapper {
          display: flex;
          justify-content: space-around;
          margin: 2em 0 0;
        }
        .main-icon {
          display: block;
          width: 80px;
          height: 80px;
        }

        .card-header {
          margin: 0;
          padding: 0.5em 1em;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .toggle-icon {
          box-sizing: content-box;
          width: 2em;
          height: 2em;
          color: var(--app-dark-text-color);
          margin: 0;
          padding: 0;
        }
        .history-header {
          margin: 1em 0 0 0;
          border-bottom: 1px solid #eee;
        }
        .history-jump-icon {
          margin: 0;
          padding: 0;
          width: 1em;
          height: 1em;
        }
        .history {
          list-style: none;
          margin: 0;
          padding: 0;
          height: 5em;
          overflow-y: hidden;
        }
        .history-item {
          border-bottom: 1px solid #eee;
        }
        .history-more {
          text-align: center;
          margin: 1em 0;
          font-size: var(--app-small-text-size);
          color: var(--app-drawer-selected-color);
        }
        .button-area {
          padding: 0 24px;
        }
        .main-btn {
          background-color: var(--app-primary-color);
          color: white;
        }
      `
    ];
  }

  protected render() {
    return html`
      <paper-card class="card">
        <div class="card-header" @click="${this.toggleCollapse}">
          <routine-header .routine="${this.routine}"></routine-header>
          <div>
            ${this.opened
              ? html`
                  <paper-icon-button
                    class="toggle-icon"
                    icon="expand-less"
                  ></paper-icon-button>
                `
              : html`
                  <paper-icon-button
                    class="toggle-icon"
                    icon="expand-more"
                  ></paper-icon-button>
                `}
          </div>
        </div>
        <div class="card-content">
          <routine-figures .routine="${this.routine}"></routine-figures>

          <iron-collapse id="collapse" opend="false">
            <div class="button-wrapper">
              <paper-icon-button
                class="main-icon"
                icon="check-circle"
                title="チェック"
                @click="${this.record}"
                >Record</paper-icon-button
              >
              <paper-icon-button
                class="main-icon"
                icon="date-range"
                title="カレンダー登録"
                @click="${this.openCalendar}"
                >Calendar</paper-icon-button
              >
              <paper-icon-button
                class="main-icon"
                icon="settings"
                title="設定"
                @click="${this.openSetting}"
                >Setting</paper-icon-button
              >
            </div>
            ${ this.routine.records && Object.keys(this.routine.records).length
              ? html`
                  <div class="history-header">
                    <span>履歴</span>
                    <paper-icon-button
                      class="history-jump-icon"
                      icon="launch"
                      @click="${this.moveToHistory}"
                    ></paper-icon-button>
                  </div>
                  <ul class="history">
                    ${Object.keys(this.routine.records)
                      .sort()
                      .reverse()
                      .map(
                        datetime => html`
                          <li class="history-item">
                            ${moment(datetime).format("YYYY/MM/DD HH:mm")}
                          </li>
                        `
                      )}
                  </ul>
                  ${3 <= Object.keys(this.routine.records).length
                    ? html`
                        <div
                          class="history-more"
                          @click="${this.moveToHistory}"
                        >
                          もっと見る
                        </div>
                      `
                    : ""}
                `
              : ""}
          </iron-collapse>
        </div>
      </paper-card>

      <paper-dialog id="modalCalendar" class="modal" modal>
        <paper-input
          id="datetime"
          type="datetime-local"
          value="${moment().format("YYYY-MM-DD" + "T00:00")}"
        ></paper-input>
        <div class="button-area">
          <paper-button
            raised
            class="main-btn"
            @click="${this.recordWithDatetime}"
            >完了</paper-button
          >
          <paper-button
            raised
            dialog-confirm
            autofocus
            @click="${this.closeCalendar}"
            >キャンセル</paper-button
          >
        </div>
      </paper-dialog>

      <paper-dialog id="modalSetting" class="modal" modal>
        <routine-register .routine="${this.routine}"></routine-register>
      </paper-dialog>

      <loading-image loadingDisplay="${this.loadingDisplay}"></loading-image>
      <paper-toast id="toastOk" text="OK!"></paper-toast>
      <paper-toast id="toastNg" text="Something wrong!!!"></paper-toast>
    `;
  }

  constructor() {
    super();
  }

  // This is called every time something is updated in the store.
  stateChanged(state: RootState) {
    if (state.user) {
      this.user = state.user;
    }

    if (this.shadowRoot!.getElementById("modalSetting")) {
      (<Modal>this.shadowRoot!.getElementById("modalSetting")).close();
    }
  }

  private toggleCollapse() {
    this.opened = !this.opened;
    (<Collapse>this.shadowRoot!.getElementById("collapse")).toggle();
  }

  private record() {
    const datetime = moment().format();
    this.recordToFirebase(datetime);
  }

  private recordWithDatetime() {
    const datetime = moment(
      (<HTMLInputElement>this.shadowRoot!.getElementById("datetime")).value
    ).format();
    this.recordToFirebase(datetime);
    this.closeCalendar();
  }

  private recordToFirebase(datetime: String) {
    firebase
      .firestore()
      .collection("users")
      .doc(this.user.uid)
      .collection("routines")
      .doc(this.routine.id)
      .set({ records: { [datetime as string]: true } }, { merge: true })
      .then(() => {
        (<Modal>this.shadowRoot!.getElementById("toastOk")).open();
        this.toggleCollapse();
      })
      .catch(() => {
        (<Modal>this.shadowRoot!.getElementById("toastNg")).open();
      });
  }

  private openCalendar() {
    (<Modal>this.shadowRoot!.getElementById("modalCalendar")).open();
  }

  private closeCalendar() {
    (<Modal>this.shadowRoot!.getElementById("modalCalendar")).close();
  }

  private openSetting() {
    (<Modal>this.shadowRoot!.getElementById("modalSetting")).open();
  }

  private moveToHistory() {
    store.dispatch(setCurrent(this.routine));
    store.dispatch(navigate("/history"));
  }
}
