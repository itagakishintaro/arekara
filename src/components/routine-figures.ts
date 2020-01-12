import { LitElement, html, css, customElement, property } from "lit-element";

// These are the shared styles needed by this element.
import { SharedStyles } from "./shared-styles.js";

// import * as moment from "moment";

@customElement("routine-figures")
export class RoutineFigures extends LitElement {
  @property({ type: Object })
  private routine = { records: {}, pace: Number, times: Number };

  static get styles() {
    return [
      SharedStyles,
      css`
        .item-wrapper {
          display: flex;
          justify-content: center;
          margin: 20px 0 0;
        }

        .item-wrapper .item {
          width: 20%;
          min-width: 80px;
          padding: 15px 10px;
          margin: 0 5px;
          border-radius: 6px;
          border: 3px solid var(--app-drawer-selected-color);
          color: var(--app-dark-text-color);
          text-align: center;
        }
        .item-wrapper .item.warning {
          background-color: var(--paper-orange-100);
          border-width: 0;
        }
        .item-wrapper .item.danger {
          background-color: var(--paper-red-100);
          border-width: 0;
        }

        .item-wrapper .category {
          margin: 0;
          font-size: var(--app-small-text-size);
        }

        .item-wrapper .number {
          margin: 0;
          font-size: 30px;
        }
      `
    ];
  }

  protected render() {
    return html`
      <div class="item-wrapper">
        <div class="item">
          <p class="category">あれから</p>
          <p class="number">
            ${Object.keys(this.routine.records).length?this.fromLastDay(this.routine.records):""}
          </p>
        </div>
        <div class="item ${this.evaluate()}">
          <p class="category">ペース</p>
          <p class="number">
          ${Object.keys(this.routine.records).length?this.routine.pace:""}
          </p>
        </div>
      </div>
    `;
  }

  private fromLastDay(records: Object) {
    if (!records || !Object.keys(records)) {
      return;
    }
    const lastDay = Object.keys(records).reduce(
      (pre, cur) => (pre < cur ? cur : pre),
      ""
    );
    //@ts-ignore
    return moment().diff(moment(lastDay), "days");
  }

  private evaluate() {
    if (!this.routine.pace) {
      return "ok";
    }
    const diff = +this.routine.times - +this.routine.pace;
    if (diff < 0) {
      return "ok";
    } else if (0.5 < +this.routine.pace / +this.routine.times) {
      return "warning";
    } else {
      return "danger";
    }
  }
}
