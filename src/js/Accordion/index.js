import { OPEN_NAVIGATION, SET_DESKTOP, SET_TOP } from '../constants';
import { accordionRowActive, querySelector, querySelectorAll, resetRows } from './utils';
import { connectToStore } from '../state';


export class Accordion {
    constructor() {

        this.accordions = querySelectorAll('.accordion');

        this.eachAccordion(({ header, content, row, rows }) => {

            content.addEventListener('transitionend', () => {
                if (row.classList.contains(accordionRowActive)) {
                    const { top } = header.getBoundingClientRect();
                    this.action.setTop(top - header.offsetHeight);
                }
            });

            header.addEventListener('click', () => {

                resetRows(rows, row);

                if (!row.classList.contains(accordionRowActive)) {
                    row.classList.add(accordionRowActive);
                    content.style.maxHeight = `${content.scrollHeight}px`;
                } else {
                    row.classList.remove(accordionRowActive);
                    content.style.maxHeight = `0px`;
                }

            })
        });


    }

    onUpdate(navigationState, lastNavigationState) {

        const hasTransitionedToMobile = !navigationState.isDesktop && lastNavigationState.isDesktop;

        if (hasTransitionedToMobile) {
            this.eachAccordion(({ rows }) => {
                resetRows(rows);
            });
        }
    }

    eachAccordion(callback) {
        this.accordions.forEach(accordion => {

            const rows = querySelectorAll('.accordion__row', accordion);

            rows.forEach(row => {
                const header = querySelector('.accordion__header', row);
                const content = querySelector('.accordion__content', row);
                callback({ header, content, row, accordion, rows });
            });
        });
    }
}


export default connectToStore(
    ({ navigation }) => navigation,
    {
        setTop: (top) => ({
            type: SET_TOP,
            payload: top
        })
    }
)(Accordion)
