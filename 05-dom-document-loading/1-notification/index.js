export default class NotificationMessage {

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
    const notifications = element.getElementsByClassName('notification');
    for (const notification of notifications) {
      notification.remove();
    }
    element.append(this.element);
    setTimeout(() => this.remove(), this.duration * 0.99);
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
