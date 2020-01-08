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
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-icon-button/paper-icon-button.js';

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

        paper-card {
          display: block;
          margin : 0 0 20px;
          border-top: 6px solid var(--app-primary-color);
        }

        paper-card .title {
          font-size: var(--app-large-text-size);
          font-weight: normal;
        }

        paper-card .lead {
          font-size: var(--app-small-text-size);
          color: var(--app-drawer-selected-color);
          margin: 0;
        }

        paper-card .item-wrapper {
          display: flex;
          justify-content: center;
          margin: 20px 0 0;
        }

        paper-card .item-wrapper .item {
          width: 20%;
          min-width: 80px;
          padding: 15px 10px;
          margin: 0 5px;
          border-radius: 2px;
          background-color: var(--app-primary-color);
          color: var(--app-light-text-color);
          text-align: center;
        }

        paper-card .item-wrapper .category {
          margin: 0;
          font-size: var(--app-small-text-size);
        }

        paper-card .item-wrapper .number {
          margin: 0;
          font-size: 30px;
        }
        paper-card .button-wrapper {
          display: flex;
          justify-content: space-around;
          margin: 40px 0 0;
        }
        paper-icon-button {
          display: block;
          width: 80px;
          height: 80px;
        }
        `
    ];
  }

  protected render() {
    return html`
      <paper-card>
        <div class="card-content">
          <b class="title" @click="${ this.toggleCollapse }">${ this.routine.name }</b>
          <p class="lead">${ this.periodShortName(this.routine.period) } ${ this.routine.times }ペース</p>

          <div class="item-wrapper">
            <div class="item"><p class="category">あれから</p><p class="number">${ this.fromLastDay(this.routine.records) }</p></div>
            <div class="item"><p class="category">ペース</p><p class="number">${ this.calcPace(this.routine) }</p></div>
          </div>

          <iron-collapse class="button-wrapper" id="collapse" opend="false">
            <paper-icon-button icon="check-circle" title="チェック" @click="${this.record}">Record</paper-icon-button>
            <paper-icon-button icon="date-range" title="カレンダー登録" @click="${this.openCalendar}">Calendar</paper-icon-button>
            <paper-icon-button icon="settings" title="設定" @click="${this.openSetting}">Setting</paper-icon-button>
            <!--<paper-icon-button icon="history" title="履歴" @click="${this.moveToHistory}">History</paper-icon-button>-->
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

  private periodShortName(period){
    switch(period){
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
    let period;
    switch(r.period){
      case 'day':
        period = 1;
        break;
      case 'week':
        period = 7;
        break;
      case 'month':
        period = 30;
        break;
      case 'year':
        period = 365;
        break;
      default:
        period = 1;
        break
    }
    return times / (fromFirstDay + 1) * period;
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
