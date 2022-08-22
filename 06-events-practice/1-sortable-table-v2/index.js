export default class SortableTable {
  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.setSortableImage();
    this.render();
  }

  setSortableImage() {
    const element = document.createElement('div');
    element.innerHTML = this.getSortableArrowElement();
    this.sortArrow = element.firstElementChild;
  }

  render() {
    const sortedColumnName = this.sorted.id;
    if (sortedColumnName) {
      this.sortItems(sortedColumnName, this.sorted.order);
    }
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getContainer();
    this.element = wrapper.firstElementChild;
    document.body.append(this.element);
    this.subElements = this.getSubElements();
    this.addListeners();
    if (sortedColumnName) {
      const sortedHeader = this.subElements.header.querySelector('[data-id=' + sortedColumnName + ']');
      sortedHeader.dataset.order = this.sorted.order;
      sortedHeader.appendChild(this.sortArrow);
    }
  }

  sort(field, order) {
    this.sortItems(field, order);
    this.subElements.body.innerHTML = this.getItems();
  }

  sortItems(field, order) {
    const header = this.headersConfig.find(e => e.id === field);
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];

    if (header.sortType === 'string') {
      this.data.sort((a, b) => direction * a[field].localeCompare(b[field], ['ru', 'en'], {caseFirst: 'upper'}));
    } else {
      this.data.sort((a, b) => direction * (a[field] - b[field]));
    }
  }

  addListeners() {
    const header = this.subElements.header;
    header.addEventListener('pointerdown', event => {
      const target = event.target;
      const parent = target.parentElement;
      if (target.tagName === 'SPAN' && parent.dataset.sortable === 'true') {
        if (parent !== this.sortArrow.parentNode) {
          parent.dataset.order = 'asc';
        } else {
          parent.dataset.order = parent.dataset.order !== 'asc' ? 'asc' : 'desc';
        }
        this.sort(parent.dataset.id, parent.dataset.order);
        parent.appendChild(this.sortArrow);
      }
    });
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

  getContainer() {
    return `<div data-element="productsContainer" class="products-list__container">
                <div class="sortable-table">
                     <div data-element="header" class="sortable-table__header sortable-table__row">
                         ${this.getHeaderColumns()}
                     </div>
                     <div data-element="body" class="sortable-table__body">
                         ${this.getItems()}
                     </div>
                </div>
            </div>
    `;
  }

  getHeaderColumns() {
    return this.headersConfig.map(header => {
      return `
        <div class="sortable-table__cell" data-id="${header.id}" data-sortable="${header.sortable}" data-order="asc">
            <span>${header.title}</span>
        </div>
      `;
    }).join('');
  }

  getItems() {
    return this.data.map(item => {
      return `<a href="/products/${item.id}" class="sortable-table__row">
                  ${this.getItemData(item)}
             </a>`;
    }).join('');
  }

  getItemData(item) {
    return this.headersConfig.map(header => {
      return header.template
        ? header.template(item['images'])
        : `<div class="sortable-table__cell">${item[header.id]}</div>`;
    }).join('');
  }

  getSortableArrowElement() {
    return `
        <span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
        </span>
    `;
  }

  remove() {
    this.destroy();
  }

  destroy() {
    this.element.remove();
  }
}
