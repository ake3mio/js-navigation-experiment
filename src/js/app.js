import { createStore } from './state';
import navigationComponent from './Navigation/index';
import accordionComponent from './Accordion/index';
import { DESkTOP_WIDTH, OPEN_NAVIGATION, SET_DESKTOP, SET_TOP } from './constants';

const isDesktop = () => window.innerWidth >= DESkTOP_WIDTH;

const navState = {
    isOpen: false,
    isDesktop: isDesktop()
};

const navigation = (state = navState, { type, payload }) => {

    switch (type) {
        case OPEN_NAVIGATION:
            return {
                isOpen: payload,
                isDesktop: isDesktop()
            };
        case SET_DESKTOP:
            return {
                ...state,
                isDesktop: isDesktop()
            };
        case SET_TOP:
            return {
                ...state,
                offsetTop: payload
            };

        default:
            return state
    }

};

const middleware = store => next => action => {
    console.log(store.getState().navigation);
    next(action);
    console.log(store.getState().navigation);
};

const store = createStore({ navigation }, [
    middleware
]);

navigationComponent(store);
accordionComponent(store);






