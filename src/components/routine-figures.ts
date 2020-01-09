import { LitElement, html, css, customElement, property } from "lit-element";

// These are the shared styles needed by this element.
import { SharedStyles } from "./shared-styles.js";

@customElement("routine-figures")
export class RoutineFigures extends LitElement {
  @property({ type: Object })
  private routine = {};

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
          border-radius: 2px;
          background-color: var(--app-primary-color);
          color: var(--app-light-text-color);
          text-align: center;
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
        <div class="item"><p class="category">あれから</p><p class="number">
          ${this.fromLastDay(this.routine.records)}
        </p></div>
        <div class="item"><p class="category">ペース</p><p class="number">
          ${this.routine.pace}
        </p></div>
      </div>
    `;
  }

  private fromLastDay(records) {
    if (!records || !Object.keys(records)) {
      return;
    }
    const lastDay = Object.keys(records).reduce(
      (pre, cur) => (pre < cur ? cur : pre),
      ""
    );
    return moment().diff(moment(lastDay), "days");
  }
}