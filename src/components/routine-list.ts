import { LitElement, html, css, customElement, property } from 'lit-element';

import { connect } from 'pwa-helpers/connect-mixin.js';

// This element is connected to the Redux store.
import { store } from '../store.js';

// Actions
import { regist } from '../actions/routines.js';

// We are lazy loading its reducer.
import user from '../reducers/user.js';
store.addReducers({
  user
});

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles.js';

// Firebase
import firebase from "../utils/firebase.js";

// compornents
import '../utils/loading-image.js';

@customElement('routine-list')
export class RoutineList extends connect(store)(LitElement) {
  @property({ type: String })
  private loadingDisplay = 'none';  

  @property({ type: Object })
  private user = {};

  @property({ type: Array })
  private routines = [];

  static get styles() {
    return [
      SharedStyles,
      css`
      `
    ];
  }

  protected render() {
    return html`
      <div>
        ${this.routines.map(r => html`
          <div>${ r.name }</div>
          <div>${ this.spanShortName(r.span) } ${ r.frequency }ペース</div>
          <div>${ this.fromLastDay(r.records) }</div>
          <div>${ this.calcPace(r) }</div>
        `)}
      </div>
      <loading-image loadingDisplay="${this.loadingDisplay}"></loading-image>
    `
  }

  constructor() {
    super();
    
  }

  // This is called every time something is updated in the store.
  stateChanged(state: RootState) {
    this.user = state.user;
    console.log(state);
    if(this.user.uid){
      this.watchRoutines();
    }
  }

  private watchRoutines() {
    firebase.firestore().collection("users").doc(this.user.uid).collection("routines")
    .onSnapshot(snapshot => {
        console.log("Current data: ", snapshot.docs);
        if(snapshot.empty){
          return;
        }
        this.routines = snapshot.docs.map(doc => doc.data());
    });
  }

  private spanShortName(span){
    switch(span){
      case 'day':
        return '日';
        break;
      case 'week':
        return '週';
        break;
      case 'month':
        return '月';
        break;
      case 'year':
        return '年';
        break;
      default:
        return '';
        break
    }
  }

  private fromLastDay(records){
    const lastDay = Object.keys(records).reduce( (pre, cur) => pre < cur? cur: pre, '' );
    return moment().diff(moment(lastDay), 'days');
  }

  private calcPace(r){
    const firstDay = Object.keys(r.records).reduce( (pre, cur) => pre > cur? cur: pre, moment().format() );
    const fromFirstDay = moment().diff(moment(firstDay), 'days');
    const times = Object.keys(r.records).length;
    let span;
    switch(r.span){
      case 'day':
        span = 1;
        break;
      case 'week':
        span = 7;
        break;
      case 'month':
        span = 30;
        break;
      case 'year':
        span = 365;
        break;
      default:
        span = 1;
        break
    }
    return times / (fromFirstDay + 1) * span;
  }
}
