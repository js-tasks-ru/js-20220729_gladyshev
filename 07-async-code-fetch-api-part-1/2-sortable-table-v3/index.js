import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  static PRODUCTS_URL = BACKEND_URL + '/products/';
  static SORTABLE_HEADER_CLASS = 'sortable-table__cell';
  static EMPTY_TABLE_PLACEHOLDER = 'sortable-table__empty-placeholder';
  static LOADING_LINE_CLASS = 'sortable-table_loading';

  element;
  start = 0;
  offset = 20;
  sortArrowElement;
  isSortLocally;

  constructor(headersConfig, {
    data = [],
    sorted = {},
    url = '',
    isSortLocally = false
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.isSortLocally = isSortLocally;
    this.sorted = sorted;
    this.url = new URL(url, BACKEND_URL);
    this.setUrlSearchParams();
    this.render();
  }

  setUrlSearchParams() {
    this.url.searchParams.set('_start', this.start.toString());
    this.url.searchParams.set('_end', (this.start + this.offset).toString());
    this.url.searchParams.set('_sort', this.sorted.id);
    this.url.searchParams.set('_order', this.sorted.order);
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
    this.setSortArrowElement();
    this.initListeners();
    await this.loadData();
  }

  setSortArrowElement() {
    this.sortArrowElement = this.getSortArrowElement();
    const id = this.sorted.id;
    if (id) {
      const sortedHeaderElement = this.subElements.header.querySelector(`[data-id=${id}]`);
      sortedHeaderElement.append(this.sortArrowElement);
    }
  }

  async loadData() {
    this.data = await fetchJson(this.url);
    if (this.data.length === 0) {
      this.subElements.emptyPlaceholder.classList.remove(SortableTable.EMPTY_TABLE_PLACEHOLDER);
    } else {
      this.subElements.emptyPlaceholder.classList.add(SortableTable.EMPTY_TABLE_PLACEHOLDER);
      this.subElements.body.innerHTML = this.getTableBody();
    }
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

  getTemplate() {
    return `
        <div data-element="productsContainer" class="products-list__container">
            <div class="sortable-table">
                <div data-element="header" class="sortable-table__header sortable-table__row">
                    ${this.getHeaderRow()}
                </div>
                <div data-element="body" class="sortable-table__body">
                    ${this.getTableBody()}
                </div>
                <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
                <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
                    <div>
                        <p>No products satisfies your filter criteria</p>
                        <button type="button" class="button-primary-outline">Reset all filters</button>
                    </div>
                </div>
            </div>
        </div>
    `;
  }

  getHeaderRow() {
    return this.headersConfig.map(header =>
      `<div class="${SortableTable.SORTABLE_HEADER_CLASS}" data-id="${header.id}"
            data-sortable="${header.sortable}" data-order="asc">
          <span>${header.title}</span>
      </div>`
    ).join('');
  }

  getTableBody(data = this.data) {
    return data.map(row =>
      `<a href="${SortableTable.PRODUCTS_URL + row.id}" class="sortable-table__row">
            ${this.getBodyCell(row)}
      </a>`
    ).join('');
  }

  getBodyCell(bodyRow) {
    return this.headersConfig.map(header =>
      header.template ? header.template(bodyRow[header.id])
        : `<div class="${SortableTable.SORTABLE_HEADER_CLASS}">${bodyRow[header.id]}</div>`
    ).join('');
  }

  getSortArrowElement() {
    const sortArrowElement = document.createElement('div');
    sortArrowElement.innerHTML = this.getSortArrowTemplate();
    return sortArrowElement.firstElementChild;
  }

  getSortArrowTemplate() {
    return `
        <span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
        </span>
    `;
  }

  sortOnClient(id, order) {
    const header = this.headersConfig.find(e => e.id === id);
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];

    if (header.sortType === 'string') {
      this.data.sort((a, b) =>
        direction * a[id].localeCompare(b[id], ['ru', 'en'], {caseFirst: 'upper'}));
    } else {
      this.data.sort((a, b) => direction * (a[id] - b[id]));
    }
    this.subElements.body.innerHTML = this.getTableBody();
  }

  sortOnServer(id, order) {
    this.sorted.id = id;
    this.sorted.order = order;
    this.start = 0;
    this.setUrlSearchParams();
    this.loadData();
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointerdown', this.onPointerDown);
    document.removeEventListener('scroll', this.onScroll);
  }

  initListeners() {
    const {header} = this.subElements;
    header.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('scroll', this.onScroll);
  }

  onPointerDown = event => {
    this.setPointerDownListenerForElement(event.target);
    this.setPointerDownListenerForElement(event.target.parentElement);
  }

  onScroll = async () => {
    while (true) {
      let windowRelativeBottom = document.documentElement.getBoundingClientRect().bottom;
      if (windowRelativeBottom > document.documentElement.clientHeight) {
        break;
      }
      this.element.firstElementChild.classList.add(SortableTable.LOADING_LINE_CLASS);
      this.start += this.offset;
      this.setUrlSearchParams();
      const response = await fetchJson(this.url);
      Array.prototype.push.apply(this.data, response);
      const loadedWrapper = document.createElement('div');
      loadedWrapper.innerHTML = this.getTableBody(response);
      this.subElements.body.append(...loadedWrapper.children);
      this.element.firstElementChild.classList.remove(SortableTable.LOADING_LINE_CLASS);
    }
  }

  setPointerDownListenerForElement(element) {
    if (this.isElementSortable(element)) {
      let {order} = element.dataset;
      if (element !== this.sortArrowElement.parentElement) {
        element.append(this.sortArrowElement);
      } else {
        order = order === 'asc' ? 'desc' : 'asc';
      }
      element.dataset.order = order;
      if (this.isSortLocally) {
        this.sortOnClient(element.dataset.id, order);
      } else {
        this.sortOnServer(element.dataset.id, order);
      }
    }
  }

  isElementSortable(element) {
    return element.classList.contains(SortableTable.SORTABLE_HEADER_CLASS) && element.dataset.sortable === 'true';
  }
}
