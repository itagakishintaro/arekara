import { LitElement, html, css, customElement, property } from "lit-element";

import { connect } from "pwa-helpers/connect-mixin.js";

// This element is connected to the Redux store.
import { store } from "../store.js";

// These are the actions needed by this element.
import { setRoutines } from "../actions/routines";

// We are lazy loading its reducer.
import user from "../reducers/user.js";
import routines from "../reducers/routines";
store.addReducers({
  user, routines
});

// These are the shared styles needed by this element.
import { SharedStyles } from "./shared-styles.js";

// Firebase
import firebase from "../utils/firebase.js";

// compornents
import "../utils/loading-image.js";
import "./routine-item.js";

@customElement("routine-list")
export class RoutineList extends connect(store)(LitElement) {
  @property({ type: String })
  private loadingDisplay = "none";

  @property({ type: Object })
  private user = {};

  @property({ type: Array })
  private routines = [];

  @property({ type: Object })
  private periodMap = {
    day: { display: "日", days: 1 },
    week: { display: "週", days: 7 },
    month: { display: "月", days: 30 },
    year: { display: "年", days: 365 }
  };

  @property({ type: Boolean })
  private watching = false;

  static get styles() {
    return [SharedStyles, css``];
  }

  protected render() {
    this.routines.sort((a, b) => {
      if (a.times - a.pace < b.times - b.pace) {
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
    if(state.routine && state.routines.routiens){
      this.setAttribute("routines", JSON.stringify(state.routines.routines));
    }
  }

  private watchRoutines() {
    this.watching = true;
    firebase
      .firestore()
      .collection("users")
      .doc(this.user.uid)
      .collection("routines")
      .onSnapshot(snapshot => {
        if (snapshot.empty) {
          return;
        }
        this.routines = snapshot.docs.map(doc => {
          const r = doc.data();
          const additional = {
            id: doc.id,
            pace: this.calcPace(r),
            periodDisplay: this.periodMap[r.period].display
          };
          return Object.assign(r, additional);
        });

        store.dispatch(setRoutines(this.routines));
      });
  }

  private calcPace(r) {
    if (!r || !r.records) {
      return;
    }
    const firstDay = Object.keys(r.records).reduce(
      (pre, cur) => (pre > cur ? cur : pre),
      moment().format()
    );
    const fromFirstDay = moment().diff(moment(firstDay), "days");
    const times = Object.keys(r.records).length;
    let period = this.periodMap[r.period].days;
    return Math.round((times / (fromFirstDay + 1)) * period * 10) / 10;
  }
}
