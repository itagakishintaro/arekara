import { LitElement, html, css, customElement, property } from "lit-element";

// These are the shared styles needed by this element.
import { SharedStyles } from "./shared-styles.js";

@customElement("routine-header")
export class RoutineHeader extends LitElement {
  @property({ type: Object })
  private routine = {};

  static get styles() {
    return [
      SharedStyles,
      css`
        .title {
          font-size: var(--app-large-text-size);
          font-weight: normal;
        }

        .lead {
          font-size: var(--app-small-text-size);
          color: var(--app-drawer-selected-color);
          margin: 0;
        }
      `
    ];
  }

  protected render() {
    return html`
      <div>
        <b class="title">${this.routine.name}</b>
        <p class="lead">
          ${this.routine.periodDisplay} ${this.routine.times}ペース
        </p>
      </div>
    `;
  }
}