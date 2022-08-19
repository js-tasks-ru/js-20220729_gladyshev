export default class SortableTable {
  subElements = {};

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getContainer();
    this.element = wrapper.firstElementChild;
    document.body.append(this.element);
    this.subElements = this.getSubElements();
  }

  sort(field, order) {
    const header = this.headerConfig.find(e => e.id === field);
    if (header.sortable) {
      const directions = {
        asc: 1,
        desc: -1
      };
      const direction = directions[order];

      if (header.sortType === 'string') {
        this.data.sort((a, b) => direction * a[field].localeCompare(b[field], ['ru', 'en'], {caseFirst: 'upper'}));
        this.subElements.body.innerHTML = this.getItems();
      } else if (header.sortType === 'number') {
        this.data.sort((a, b) => direction * (a[field] - b[field]));
        this.subElements.body.innerHTML = this.getItems();
      }
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
    return this.headerConfig.map(header => {
      return `
        <div class="sortable-table__cell" data-id="${header.id}" data-sortable="${header.sortable}">
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
    return this.headerConfig.map(header => {
      return header.template
        ? header.template(item['images'])
        : `<div class="sortable-table__cell">${item[header.id]}</div>`;
    }).join('');
  }

  remove() {
    this.destroy();
  }

  destroy() {
    this.element.remove();
  }
}

