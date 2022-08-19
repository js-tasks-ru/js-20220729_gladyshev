export default class NotificationMessage {
  static active;

  constructor(message, {duration = 0, type = ''} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.render();
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
  }

  show(element = document.body) {
    if (NotificationMessage.active) {
      NotificationMessage.active.remove();
    }
    element.append(this.element);
    setTimeout(() => this.remove(), this.duration);

    NotificationMessage.active = this;
  }

  getTemplate() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;
  }

  remove() {
    this.destroy();
  }

  destroy() {
    this.element.remove();
  }
}
