export default class ColumnChart {
  chartHeight = 50;

  constructor(
    {data = [], label = '', link = '', value = 0, formatHeading = data => data} = {}
  ) {
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = formatHeading(value);
    this.render();
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
  }

  getTemplate() {
    return `<div class="dashboard__chart_${this.label} ${this.data.length === 0 ? "column-chart_loading" : ""}">
                <div class="column-chart" style="--chart-height: ${this.chartHeight}">
                  <div class="column-chart__title">
                    Total ${this.label}
                    <a class="column-chart__link" href="${this.link}">View all</a>
                  </div>
                  <div class="column-chart__container">
                    <div data-element="header" class="column-chart__header">${this.value}</div>
                    <div data-element="body" class="column-chart__chart">${this.getCharts()}</div>
                  </div>
                </div>
             </div>`;
  }

  getCharts() {
    const max = Math.max(...this.data);
    const scale = this.chartHeight / max;
    return this.data
      .map(item =>
        `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${(item / max * 100).toFixed(0)}%"></div>`)
      .join('');
  }

  update(data) {
    this.data = data;
    const body = document.querySelector(".column-chart__chart");
    body.innerHTML = this.getCharts();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
