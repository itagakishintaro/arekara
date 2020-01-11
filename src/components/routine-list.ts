import { LitElement, html, css, customElement, property } from "lit-element";

import { connect } from "pwa-helpers/connect-mixin.js";

// This element is connected to the Redux store.
import { store, RootState } from "../store.js";

// These are the actions needed by this element.
import { setRoutines } from "../actions/routines";

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

// compornents
import "../utils/loading-image.js";
import { periodMap, calcPace } from "../utils/utils.js";
import "./routine-item.js";
import "@polymer/paper-toast/paper-toast.js";

@customElement("routine-list")
export class RoutineList extends connect(store)(LitElement) {
  @property({ type: String })
  private loadingDisplay = "none";

  @property({ type: Object })
  private user = {uid: ""};

  @property({ type: Array })
  private routines = [{times: Number, pace: Number}];

  @property({ type: Boolean })
  private watching = false;

  static get styles() {
    return [SharedStyles, css``];
  }

  protected render() {
    this.routines.sort((a, b) => {
      if (+a.times - +a.pace < +b.times - +b.pace) {
        return 1;
      } else {
        return -1;
      }
    });
    return html`
      <div>
        ${this.routines.map(
          r => html`
            <routine-item .routine="${r}"></routine-item>
          `
        )}
      </div>
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
    this.user = state.user;
    if (this.user.uid && !this.watching) {
      this.watchRoutines();
    }
    this.setAttribute("routines", JSON.stringify(state.routines.routines));
  }

  private watchRoutines() {
    this.watching = true;
    firebase
      .firestore()
      .collection("users")
      .doc(this.user.uid)
      .collection("routines")
      .onSnapshot( (snapshot: {empty: Boolean, docs: Array<{data: Function, id: String}>}) => {
        if (snapshot.empty) {
          return;
        }
        if(this.routines.length){
          //@ts-ignore
          this.shadowRoot!.getElementById("toastOk")!.open();
        }
        //@ts-ignore
        this.routines = snapshot.docs.map(doc => {
          const r: {records: Object, period: "day"|"week"|"month"|"year"} = doc.data();
          const additional = {
            id: doc.id,
            pace: calcPace(r),
            periodDisplay: r.period? periodMap[r.period].display: ""
          };
          return Object.assign(r, additional);
        });

        store.dispatch(setRoutines(this.routines));
      });
  }
}
