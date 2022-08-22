class Tooltip {
  static instance = null;

  element;

  constructor() {
    if (!Tooltip.instance) {
      Tooltip.instance = this;
    }
    return Tooltip.instance;
  }

  initialize () {
    document.body.addEventListener('pointerover', event => {
      const parent = event.target.closest('div[data-tooltip]');
      if (parent) {
        this.render(parent.dataset.tooltip);
        document.addEventListener('pointermove', event => {
          const shift = 10;
          const left = event.clientX + shift;
          const top = event.clientY + shift;
          this.element.style.left = `${left}px`;
          this.element.style.top = `${top}px`;
        });
      }
    });
    document.body.addEventListener('pointerout', event => {
      const parent = event.target.closest('div[data-tooltip]');
      if (parent) {
        this.destroy();
      }
    });
  }

  render(text = '') {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate(text);
    this.element = wrapper.firstElementChild;
    document.body.append(this.element);
  }

  getTemplate(text = '') {
    return `
      <div class="tooltip">${text}</div>
    `;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}

export default Tooltip;
