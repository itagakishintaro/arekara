import { LitElement, html, css, customElement, property } from 'lit-element';

import { connect } from 'pwa-helpers/connect-mixin.js';

// This element is connected to the Redux store.
import { store } from '../store.js';

// These are the actions needed by this element.
import { navigate } from '../actions/app.js';

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
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-dialog/paper-dialog.js';

@customElement('routine-item')
export class RoutineItem extends connect(store)(LitElement) {
  @property({ type: String })
  private loadingDisplay = 'none';  

  @property({ type: Object })
  private user = {};

  @property({ type: Object })
  private routine = {};

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
      `
    ];
  }

  protected render() {
    return html`
      <paper-card>
        <div class="card-content">
          <div @click="${ this.toggleCollapse }">${ this.routine.name }</div>
          <div>${ this.spanShortName(this.routine.span) } ${ this.routine.frequency }ペース</div>

          <div>${ this.fromLastDay(this.routine.records) }</div>
          <div>${ this.calcPace(this.routine) }</div>

          <iron-collapse id="collapse" opend="false">
            <button @click="${this.record}">Record</button>
            <button @click="${this.openCalendar}">Calendar</button>
            <button @click="${this.openSetting}">Setting</button>
            <button @click="${this.moveToHistory}">History</button>
          </iron-collapse>
        </div>
      </paper-card>

      <paper-dialog id="modalCalendar" class="modal" modal>
        <input id="datetime" type="datetime-local" value="${moment().format("YYYY-MM-DD" + "T00:00")}"></input>
        <button @click="${this.recordWithDatetime}">完了</button>
        <button @click="${this.closeCalendar}">キャンセル</button>
      </paper-dialog>

      <paper-dialog id="modalSetting" class="modal" modal>
        <routine-register .routine="${this.routine}"></routine-register>
      </paper-dialog>

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

    if(this.shadowRoot.getElementById("modalSetting")){
      this.shadowRoot.getElementById("modalSetting").close();
    }
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
    if(!records || !Object.keys(records)){
      return;
    }
    const lastDay = Object.keys(records).reduce( (pre, cur) => pre < cur? cur: pre, '' );
    return moment().diff(moment(lastDay), 'days');
  }

  private calcPace(r){
    if(!r || !r.records){
      return;
    }
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

  private toggleCollapse() {
    this.shadowRoot.getElementById('collapse').toggle();
  }

  private record(){
    const datetime = moment().format();
    this.recordToFirebase(datetime);
  }

  private recordWithDatetime(){
    const datetime = moment(this.shadowRoot.getElementById("datetime").value).format();
    this.recordToFirebase(datetime);
    this.closeCalendar();
  }

  private recordToFirebase(datetime){
    firebase.firestore()
      .collection('users')
      .doc(this.user.uid)
      .collection('routines')
      .doc(this.routine.id)
      .set( {records: {[datetime]: true} }, { merge: true } );
  }

  private openCalendar(){
    this.shadowRoot.getElementById("modalCalendar").open();
  }

  private closeCalendar(){
    this.shadowRoot.getElementById("modalCalendar").close();
  }

  private openSetting(){
    this.shadowRoot.getElementById("modalSetting").open();
  }

  private closeSetting(){
    this.shadowRoot.getElementById("modalSetting").close();
  }

  private moveToHistory(){
    store.dispatch(setTargetRoutine(this.routine));
    store.dispatch(navigate("/history"));
  }
}
