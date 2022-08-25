import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  chartHeight = 50;
  url;
  range;
  label;
  link;
  formatHeading;
  data = {};

  constructor(
    {
      url = '', range = {from: new Date(), to: new Date()},
      label = '', link = '', formatHeading = data => data
    } = {}
  ) {
    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.render();
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.element.classList.add('column-chart_loading');
    this.update();
    this.subElements = this.getSubElements();
  }

  getTemplate() {
    return `<div class="dashboard__chart_${this.label}}">
                <div class="column-chart" style="--chart-height: ${this.chartHeight}">
                  <div class="column-chart__title">
                    Total ${this.label}
                    <a class="column-chart__link" href="${this.link}">View all</a>
                  </div>
                  <div class="column-chart__container">
                    <div data-element="header" class="column-chart__header"></div>
                    <div data-element="body" class="column-chart__chart"></div>
                  </div>
                </div>
             </div>`;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");
    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }

  update(from = this.range.from, to = this.range.to) {
    fetchJson(BACKEND_URL + '/' + this.url + '?' + new URLSearchParams({
      from: from.toISOString(),
      to: to.toISOString(),
    }))
      .then(data => {
        this.data = data;
        this.reload();
      });
  }

  reload() {
    const {header, body} = this.subElements;
    const values = Object.values(this.data);
    if (values.length === 0) {
      this.element.classList.add('column-chart_loading');
    } else {
      this.element.classList.remove('column-chart_loading');
    }
    header.innerHTML = values.reduce((a, b) => a + b, 0);
    body.innerHTML = this.getCharts();
  }

  getCharts() {
    const entries = Object.entries(this.data);
    const max = Math.max(...Object.values(this.data));
    const scale = this.chartHeight / max;
    return entries
      .map(item => {
        return `<div style="--value: ${Math.floor(item[1] * scale)}" data-tooltip="${(item[1] / max * 100).toFixed(0)}%"></div>`;
      })
      .join('');
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
