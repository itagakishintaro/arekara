import { html, css, customElement, property } from 'lit-element';
import { PageViewElement } from './page-view-element.js';

import { connect } from 'pwa-helpers/connect-mixin.js';

// This element is connected to the Redux store.
import { store, RootState } from '../store.js';

// These are the actions needed by this element.
import { navigate } from '../actions/app.js';

// We are lazy loading its reducer.
import user from '../reducers/user.js';
import routines from '../reducers/routines.js';
store.addReducers({
  user, routines
});

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles.js';

// compornents
import '../utils/loading-image.js';
import '@polymer/paper-dialog/paper-dialog.js';
import './routine-register.js';
import './routine-list.js';

@customElement('history-page')
export class HistoryPage extends connect(store)(PageViewElement) {
  @property({ type: String })
  private loadingDisplay = 'none';

  @property({ type: Object })
  private user = {};

  @property({ type: Array })
  private records = [];

  static get styles() {
    return [
      SharedStyles,
      css`
      `
    ];
  }

  protected render() {
    return html`
      <section>
        <ul>
          ${this.records.map(datetime => html`
            <li>${datetime}</li>
          `)}
        </ul>
      </section>

      <loading-image loadingDisplay="${this.loadingDisplay}"></loading-image>
    `
  }

  constructor() {
    super();
  }

  // This is called every time something is updated in the store.
  stateChanged(state: RootState) {
    console.log("-----", Object.keys(state.setting.targetRoutine.records)[0]);
    this.record = Object.keys(state.setting.targetRoutine.records);
    console.log("=====", this.record);
    // this.setAttribute('records', Object.keys(state.setting.targetRoutine.records));
  }
}
