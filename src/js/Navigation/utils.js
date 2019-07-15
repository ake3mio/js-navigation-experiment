export const throttle = (func, limit) => {
    let lastFunc;
    let lastRan;
    return function () {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now()
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function () {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now()
                }
            }, limit - (Date.now() - lastRan))
        }
    }
};

export const toggleClassName = (element, className) => condition => {
    if(condition) {
        element.classList.add(className);
    } else {
        element.classList.remove(className);
    }
};

export function isElementInPath(target, element) {
    let currentElement = element;

    if (currentElement === target) {
        return true;
    }

    while (!currentElement !== target) {

        if (!currentElement.parentElement) {
            return false;
        }

        return isElementInPath(target, currentElement.parentElement);
    }
}
