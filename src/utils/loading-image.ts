import { LitElement, html, css, property, customElement } from 'lit-element';

@customElement('loading-image')
export class LoadingImage extends LitElement {
  @property({ type: String, reflect: true })
  loadingDisplay = 'none';

  static get styles() {
    return [
      css`
        .loading {
          position: fixed;
          top: 0;
          width: 100vw;
          height: 100vh;
          z-index: 9999;
        }

        .loading-img {
          position: absolute;
          width: 150px;
          height: 150px;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          margin: auto;
        }
      `
    ];
  }

  protected render() {
    return html`
      <div id="loading" class="loading" style="display: ${this.loadingDisplay}">
        <img src="/images/loading.svg" class="loading-img" />
      </div>
    `
  }
}