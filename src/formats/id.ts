let counter = 0;

export const getUniqueId = (): string => {
    counter += 1;
    return `timestamp${Math.floor(performance.timeOrigin + performance.now())}counter${counter}`;
};
