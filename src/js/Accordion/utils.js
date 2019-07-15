export const accordionRowActive = 'accordion__row--active';

export const querySelector = (selector, ctx = document) => ctx.querySelector(selector);
export const querySelectorAll = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];


export const resetRows = (rows, excluding) => {
    rows.filter(row => row !== excluding).forEach(row => {
        const content = querySelector('.accordion__content', row);
        content.classList.remove('accordion__content--active');
        row.classList.remove(accordionRowActive);
        content.style.maxHeight = `0px`;
    })
};


export function scrollIntoView(parent, top) {
    const from = parent.scrollTop;
    const distance = Math.max(0, from + top);
    parent.scroll({ top: distance });
}
