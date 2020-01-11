import { LitElement, html, css, customElement, property } from "lit-element";

import { connect } from "pwa-helpers/connect-mixin.js";

// This element is connected to the Redux store.
import { store, RootState } from "../store.js";

// We are lazy loading its reducer.
import user from "../reducers/user.js";
store.addReducers({
  user
});

// These are the shared styles needed by this element.
import { SharedStyles } from "./shared-styles.js";

// Firebase
import firebase from "../utils/firebase.js";

// compornents
// import * as moment from "moment";
import "../utils/loading-image.js";
import "@polymer/paper-input/paper-input.js";
import "@polymer/paper-button/paper-button.js";

@customElement("routine-register")
export class RoutineRegister extends connect(store)(LitElement) {
  @property({ type: String })
  private loadingDisplay = "none";

  @property({ type: Object })
  private user = { uid: "" };

  @property({ type: Object, reflect: true })
  private routine = {
    name: "",
    period: "",
    times: Number,
    id: "",
    pace: Number,
    periodDisplay: "",
    datetime: ""
  };

  static get styles() {
    return [
      SharedStyles,
      css`
        .select-area {
          padding: 20px 0 0;
        }
        .select-area > .title {
          font-size: var(--app-medium-text-size);
        }
        .select-area > .inner {
          overflow: hidden;
        }
        .select-area > .inner select {
          width: 100%;
          padding-right: 1em;
          cursor: pointer;
          text-indent: 0.01px;
          text-overflow: ellipsis;
          border: none;
          outline: none;
          background: transparent;
          background-image: none;
          box-shadow: none;
          -webkit-appearance: none;
          appearance: none;
        }

        .select-area > .inner select::-ms-expand {
          display: none;
        }

        .select-area > .inner {
          position: relative;
          border-radius: 2px;
          border: 1px solid var(--app-secondary-color);
          background: white;
        }

        .select-area > .inner::before {
          position: absolute;
          top: 0.8em;
          right: 0.8em;
          width: 0;
          height: 0;
          padding: 0;
          content: "";
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid var(--app-secondary-color);
          pointer-events: none;
        }

        .select-area > .inner select {
          padding: 10px 40px 10px 10px;
          font-size: var(--app-medium-text-size);
          color: var(--app-secondary-color);
        }

        .button-area {
          padding: 20px 0 0;
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
      <section>
        <form>
          <paper-input
            label="Name"
            id="name"
            type="text"
            value="${this.routine.name ? this.routine.name : ""}"
          ></paper-input>

          <div class="select-area">
            <label class="title" for="period">Period</label>
            <div class="inner">
              <select id="period">
                <option value="">--Please choose an option--</option>
                ${// formatter
                //@ts-ignore
                this.routine.period === "day"
                  ? html`
                      <option value="day" selected>日</option>
                    `
                  : html`
                      <option value="day">日</option>
                    `}
                ${// formatter
                //@ts-ignore
                this.routine.period === "week"
                  ? html`
                      <option value="week" selected>週</option>
                    `
                  : html`
                      <option value="week">週</option>
                    `}
                ${// formatter
                //@ts-ignore
                this.routine.period === "month"
                  ? html`
                      <option value="month" selected>月</option>
                    `
                  : html`
                      <option value="month">月</option>
                    `}
                ${// formatter
                //@ts-ignore
                this.routine.period === "year"
                  ? html`
                      <option value="year" selected>年</option>
                    `
                  : html`
                      <option value="year">年</option>
                    `}
              </select>
            </div>
          </div>

          <paper-input
            label="Times"
            id="times"
            type="number"
            value="${this.routine.times ? this.routine.times : ""}"
          ></paper-input>

          <div class="button-area">
            ${this.routine.id
              ? html`
                  <paper-button
                    raised
                    class="main-btn"
                    @click="${this.updateRoutine}"
                    >更新する</paper-button
                  >
                `
              : html`
                  <paper-button
                    raised
                    class="main-btn"
                    @click="${this.registRoutine}"
                    >登録する</paper-button
                  >
                `}
            <paper-button raised dialog-confirm autofocus
              >キャンセル</paper-button
            >
          </div>
        </form>

        <loading-image loadingDisplay="${this.loadingDisplay}"></loading-image>
      </section>
    `;
  }

  private registRoutine() {
    const name = (<HTMLInputElement>this.shadowRoot!.getElementById("name"))
      .value;
    const period = (<HTMLInputElement>this.shadowRoot!.getElementById("period"))
      .value;
    const times = (<HTMLInputElement>this.shadowRoot!.getElementById("times"))
      .value;
    //@ts-ignore
    const datetime = moment().format();
    const routine = { name, period, times, datetime };
    firebase
      .firestore()
      .collection("users")
      .doc(this.user.uid)
      .collection("routines")
      .add(routine);
  }

  private updateRoutine() {
    let newRoutine = this.routine;
    delete newRoutine.pace;
    delete newRoutine.periodDisplay;
    //@ts-ignore
    newRoutine.name = (<HTMLInputElement>(
      this.shadowRoot!.getElementById("name")
    )).value;
    //@ts-ignore
    newRoutine.period = (<HTMLInputElement>(
      this.shadowRoot!.getElementById("period")
    )).value;
    //@ts-ignore
    newRoutine.times = (<HTMLInputElement>(
      this.shadowRoot!.getElementById("times")
    )).value;
    //@ts-ignore
    newRoutine.datetime = moment().format();
    firebase
      .firestore()
      .collection("users")
      .doc(this.user.uid)
      .collection("routines")
      .doc(this.routine.id)
      .set(newRoutine);
  }

  // This is called every time something is updated in the store.
  stateChanged(state: RootState) {
    if (state.user) {
      this.user = state.user;
    }
  }
}
