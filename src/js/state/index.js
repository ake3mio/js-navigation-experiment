const noop = () => void 0;

class EventDispatcher {

    constructor(onComplete = noop) {
        this.listeners = [];
        this.onComplete = onComplete;
    }

    notify(payload) {
        this.listeners.forEach((callback) => callback.call(null, payload));
        this.onComplete();
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }
}

const compose = (...fns) => (...args) => fns.reduceRight((res, fn) => [fn.call(null, ...res)], args)[0];
const copy = data => JSON.parse(JSON.stringify(data));

export const createStore = (reducers = {}, middleware = []) => {

    let lastState = {};
    let state = {};

    const onCompleteListeners = [];
    const notify = listener => listener({ ...state }, { ...lastState });
    const onComplete = () => onCompleteListeners.forEach(notify);
    const eventDispatcher = new EventDispatcher(onComplete);
    const dispatch = eventDispatcher.notify.bind(eventDispatcher);

    const nextFns = middleware.map(fn => fn({
        getState: () => state,
        dispatch
    }));

    for (let name in reducers) {

        state[name] = reducers[name](undefined, {});

        eventDispatcher.subscribe((payload) => {

            lastState = copy(state);

            state[name] = reducers[name](state[name], payload);
        });
    }

    return {
        getState: () => state,
        dispatch: compose(...nextFns)(dispatch),
        subscribe: listener => onCompleteListeners.push(listener)
    };
};

export const connectToStore = (select = noop, actions = {}) => Component => store => {

    const initialState = select(store.getState());
    const action = {};

    for (let name in actions) {

        if (typeof actions[name] === 'function') {
            action[name] = function () {
                store.dispatch(actions[name].apply(null, arguments));
            }
        }
    }

    class Consumer {

        constructor() {
            this.action = action;
            this.onUpdate = Component.prototype.onUpdate || noop;
            this.__proto__ = Component.prototype;
            this.__proto__.name = `Consumer(${Component.name})`;
            Component.prototype.constructor.apply(this, arguments);
        }
    }

    Object.defineProperty(Consumer, 'name', {
        value: `Consumer(${Component.name})`
    });

    const clazz = new Consumer(initialState);

    store.subscribe((newState, oldState) => {
        clazz.onUpdate(select(newState), select(oldState))
    });
};
