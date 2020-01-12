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
import { periodMap, calcPace } from "../utils/utils.js";
import "./routine-header.js";
import "./routine-figures.js";
import "@polymer/paper-dialog/paper-dialog.js";
import "@polymer/iron-icons/iron-icons.js";
import "@polymer/paper-icon-button/paper-icon-button.js";

declare var moment: any;
interface Modal extends HTMLElement {
  open: Function,
  close: Function
}
@customElement("history-page")
export class HistoryPage extends connect(store)(PageViewElement) {
  @property({ type: String })
  private loadingDisplay = "none";

  @property({ type: Object })
  private routine = { records: Object, id: "" };

  @property({ type: Object })
  private user = { uid: "" };

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
        .back {
          width: 100%;
          text-align: right;
          margin-top: 1em;
        }
        .back-icon {
          width: 4em;
          height: 4em;
          color: var(--app-drawer-selected-color);
        }
        .button-area {
          padding: 0 24px;
        }
        .main-btn {
          background-color: var(--app-primary-color);
          color: white;
        }
        .delete {
          margin-top: 3em;
          text-align: right;
          color: var(--app-dark-text-color);
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
          ${this.routine.records
            ? Object.keys(this.routine.records)
                .sort()
                .reverse()
                .map(
                  datetime => html`
                    <li
                      class="history-item"
                      @click="${this.openCalendar}"
                      data-datetime="${datetime}"
                    >
                      <div>
                        ${moment(datetime).format("YYYY/MM/DD HH:mm")}
                      </div>
                      <paper-icon-button
                        class="right-icon"
                        icon="chevron-right"
                      ></paper-icon-button>
                    </li>
                  `
                )
            : ""}
        </ul>
        <div class="back">
          <paper-icon-button
            class="back-icon"
            icon="subdirectory-arrow-left"
            @click="${this.back}"
          ></paper-icon-button>
        </div>
      </section>
      <paper-dialog id="modalCalendar" class="modal" modal>
        <paper-input id="datetime" type="datetime-local"></paper-input>
        <div class="button-area">
          <paper-button raised class="main-btn" @click="${this.updateRecord}"
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

        <div class="delete">
          <a @click="${this.deleteHistory}">削除する</a>
        </div>
      </paper-dialog>
      <loading-image loadingDisplay="${this.loadingDisplay}"></loading-image>
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

    if (
      this.user &&
      this.user.uid &&
      state.routines &&
      state.routines.current &&
      (!this.routine.id || this.routine.id !== state.routines.current.id)
    ) {
      this.watchRoutine(state.routines.current.id);
    }
  }

  private openCalendar(e: any) {
    this.setAttribute("selected", e.currentTarget.dataset.datetime);
    (<HTMLInputElement>(
      this.shadowRoot!.getElementById("datetime")
    )).value = this.selected.substring(0, 16);
    (<Modal>this.shadowRoot!.getElementById("modalCalendar")).open();
  }

  private closeCalendar() {
    (<Modal>this.shadowRoot!.getElementById("modalCalendar")).close();
  }

  private updateRecord() {
    const oldDatetime = this.selected;
    const newDatetime = moment(
      (<HTMLInputElement>this.shadowRoot!.getElementById("datetime")).value
    ).format();
    firebase
      .firestore()
      .collection("users")
      .doc(this.user.uid)
      .collection("routines")
      .doc(this.routine.id)
      .set(
        {
          records: {
            [oldDatetime]: firebase.firestore.FieldValue.delete(),
            [newDatetime]: true
          }
        },
        { merge: true }
      );
    this.closeCalendar();
  }

  private watchRoutine(id: string) {
    firebase
      .firestore()
      .collection("users")
      .doc(this.user.uid)
      .collection("routines")
      .doc(id)
      .onSnapshot((doc: { exists: Boolean; data: Function; id: string }) => {
        if (!doc.exists) {
          return;
        }
        const r: {
          records: Object;
          period: "day" | "week" | "month" | "year";
        } = doc.data();
        const additional = {
          id: doc.id,
          pace: calcPace(r),
          periodDisplay: periodMap[r.period].display
        };
        this.setAttribute(
          "routine",
          JSON.stringify(Object.assign(r, additional))
        );
      });
  }

  private deleteHistory() {
    const oldDatetime = this.selected;
    firebase
      .firestore()
      .collection("users")
      .doc(this.user.uid)
      .collection("routines")
      .doc(this.routine.id)
      .set(
        { records: { [oldDatetime]: firebase.firestore.FieldValue.delete() } },
        { merge: true }
      );
    this.closeCalendar();
  }

  private back() {
    scrollTo(0, 0);
    store.dispatch(navigate("/top"));
  }
}
