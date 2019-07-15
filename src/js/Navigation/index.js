import { OPEN_NAVIGATION, SET_DESKTOP } from '../constants';
import { isElementInPath, throttle, toggleClassName } from './utils';
import { connectToStore } from '../state';
import { scrollIntoView } from '../Accordion/utils';

class Navigation {

    constructor(state) {

        this.state = state;
        this.header = document.querySelector('.header');
        this.burger = document.querySelector('.burger');
        this.offcanvas = document.querySelector('.offcanvas');
        this.content = document.querySelector('.offcanvas__content');
        this.contentOverlay = this.createContentOverlay();
        this.toggleMenu = this.toggleMenu.bind(this);
        this.setOffCanvasClosed = toggleClassName(this.offcanvas, 'offcanvas--closed');
        this.setHeaderInactive = toggleClassName(this.header, 'header--inactive');
        this.setBurgerActive = toggleClassName(this.burger, 'burger--active');
        this.lockScroll = toggleClassName(document.body, 'scroll-lock');

        this.bindEvents();
    }

    onUpdate(navigationState, lastNavigationState) {

        this.state = navigationState;

        const updates = [
            ({ isOpen }) => this.setOffCanvasClosed(!isOpen),
            this.updateContentOverlay,
            this.updateBurger,
            ({ isOpen }) => this.setHeaderInactive(isOpen),
            ({ isOpen }) => this.lockScroll(isOpen),
            ({ isDesktop, isOpen }) => isDesktop && isOpen && this.action.closeNavigation(),
            ({ offsetTop }, lastState) => {

                const didOffsetTopUpdate = offsetTop && lastState.offsetTop !== offsetTop;

                if (didOffsetTopUpdate) {
                    scrollIntoView(this.content, offsetTop);
                }
            }
        ];

        updates.forEach(update => update.call(this, navigationState, lastNavigationState));
    }

    bindEvents() {

        const onMouseEnter = event => isElementInPath(event.currentTarget, event.target) && this.lockScroll(true);

        this.burger.addEventListener('click', this.toggleMenu);
        this.offcanvas.addEventListener('mouseenter', onMouseEnter, true);
        this.offcanvas.addEventListener('mouseout', () => !this.state.isOpen && this.lockScroll(false), true);
        this.contentOverlay.addEventListener('click', this.toggleMenu);

        window.addEventListener('scroll', this.hideHeader());
        window.addEventListener('resize', throttle(this.action.setDesktop, 50));
    }

    toggleMenu(event) {

        event.preventDefault();

        const { isOpen } = this.state;

        const action = isOpen
            ? this.action.closeNavigation
            : this.action.openNavigation;

        action();
    };

    createContentOverlay() {
        const overlay = document.createElement('div');
        overlay.classList.add('offcanvas-content-overlay');
        return overlay;
    }

    updateContentOverlay({ isOpen, isDesktop }, lastState) {
        if (lastState.isOpen === isOpen) return;
        this.toggleOverlay(isOpen);
    }

    toggleOverlay(shouldOpen) {
        if (shouldOpen) {
            this.header.parentNode.insertBefore(this.contentOverlay, this.header);
        } else {
            this.header.parentNode.removeChild(this.contentOverlay);
        }
    }

    updateBurger({ isOpen }) {

        if (isOpen) {
            this.moveBurgerToElement(this.offcanvas);
        } else {
            this.moveBurgerToElement(this.header);
        }

        setTimeout(() => this.setBurgerActive(isOpen), 10);
    }

    moveBurgerToElement(element) {
        element.insertBefore(this.burger, element.firstElementChild);
    }

    hideHeader() {

        let lastY = window.scrollY;

        const onScroll = () => {

            const threshold = 200;
            const { isOpen } = this.state;
            const headerHidden = 'header--hidden';
            const isVisible = !this.header.classList.contains(headerHidden);
            const isClosed = !isOpen;
            const shouldDisplayHeader = window.scrollY < lastY;

            const shouldHideHeader =
                window.scrollY > threshold
                && isClosed
                && isVisible
                && !shouldDisplayHeader;

            lastY = window.scrollY;

            if (shouldHideHeader) {
                return this.header.classList.add(headerHidden);
            }

            if (shouldDisplayHeader) {
                return this.header.classList.remove(headerHidden);
            }
        };

        return throttle(onScroll, 500);
    }
}

export default connectToStore(
    ({ navigation }) => navigation,
    {
        setDesktop: () => ({ type: SET_DESKTOP }),
        openNavigation: () => ({ type: OPEN_NAVIGATION, payload: true }),
        closeNavigation: () => ({ type: OPEN_NAVIGATION, payload: false })
    }
)(Navigation)
