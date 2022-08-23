export default class DoubleSlider {
  min;
  max;
  from;
  to;
  element;
  subElements = {};

  constructor({
                min = 0, max = 100,
                selected = {from: min, to: max}, formatValue = value => value
              } = {}) {
    this.min = min;
    this.max = max;
    this.from = selected.from;
    this.to = selected.to;
    this.formatValue = formatValue;
    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.element.ondragstart = () => false;
    this.subElements = this.getSubElements(wrapper);
    this.initListeners();
    this.update();
  }

  initListeners() {
    const { thumbLeft, thumbRight } = this.subElements;
    thumbLeft.addEventListener('pointerdown', event => this.onThumbPointerDown(event));
    thumbRight.addEventListener('pointerdown', event => this.onThumbPointerDown(event));
  }

  update() {
    const rangeTotal = this.max - this.min;
    const left = Math.floor((this.from - this.min) / rangeTotal * 100) + '%';
    const right = Math.floor((this.max - this.to) / rangeTotal * 100) + '%';

    this.subElements.progress.style.left = left;
    this.subElements.progress.style.right = right;

    this.subElements.thumbLeft.style.left = left;
    this.subElements.thumbRight.style.right = right;
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll("[data-element]");
    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }

  onThumbPointerDown(event) {
    const thumbElem = event.target;

    event.preventDefault();

    const { left, right } = thumbElem.getBoundingClientRect();

    if (thumbElem === this.subElements.thumbLeft) {
      this.shiftX = right - event.clientX;
    } else {
      this.shiftX = left - event.clientX;
    }

    this.dragging = thumbElem;

    this.element.classList.add('range-slider_dragging');

    document.addEventListener('pointermove', this.onThumbPointerMove);
    document.addEventListener('pointerup', this.onThumbPointerUp);
  }

  getTemplate() {
    return `
        <div class="range-slider">
            <span data-element="from">${this.formatValue(this.from || this.min)}</span>
            <div data-element="inner" class="range-slider__inner">
                <span data-element="progress" class="range-slider__progress"></span>
                <span data-element="thumbLeft" class="range-slider__thumb-left"></span>
                <span data-element="thumbRight" class="range-slider__thumb-right"></span>
            </div>
            <span data-element="to">${this.formatValue(this.to || this.max)}</span>
        </div>
    `;
  }

  onThumbPointerMove = event => {
    event.preventDefault();

    const { left: innerLeft, right: innerRight, width } = this.subElements.inner.getBoundingClientRect();

    if (this.dragging === this.subElements.thumbLeft) {
      let newLeft = (event.clientX - innerLeft + this.shiftX) / width;

      if (newLeft < 0) {
        newLeft = 0;
      }
      newLeft *= 100;
      const right = parseFloat(this.subElements.thumbRight.style.right);

      if (newLeft + right > 100) {
        newLeft = 100 - right;
      }

      this.dragging.style.left = this.subElements.progress.style.left = newLeft + '%';
      this.subElements.from.innerHTML = this.formatValue(this.getValue().from);
    }

    if (this.dragging === this.subElements.thumbRight) {
      let newRight = (innerRight - event.clientX - this.shiftX) / width;

      if (newRight < 0) {
        newRight = 0;
      }
      newRight *= 100;

      const left = parseFloat(this.subElements.thumbLeft.style.left);

      if (left + newRight > 100) {
        newRight = 100 - left;
      }
      this.dragging.style.right = this.subElements.progress.style.right = newRight + '%';
      this.subElements.to.innerHTML = this.formatValue(this.getValue().to);
    }
  };

  onThumbPointerUp = () => {
    this.element.classList.remove('range-slider_dragging');

    document.removeEventListener('pointermove', this.onThumbPointerMove);
    document.removeEventListener('pointerup', this.onThumbPointerUp);

    this.element.dispatchEvent(new CustomEvent('range-select', {
      detail: this.getValue(),
      bubbles: true
    }));
  };

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointermove', this.onThumbPointerMove);
    document.removeEventListener('pointerup', this.onThumbPointerUp);
  }

  getValue() {
    const rangeTotal = this.max - this.min;
    const { left } = this.subElements.thumbLeft.style;
    const { right } = this.subElements.thumbRight.style;

    const from = Math.round(this.min + parseFloat(left) * 0.01 * rangeTotal);
    const to = Math.round(this.max - parseFloat(right) * 0.01 * rangeTotal);

    return { from, to };
  }
}
