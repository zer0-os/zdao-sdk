export const timestamp = (d: Date) => parseInt((d.getTime() / 1e3).toFixed());

export const sleep = (m: number) => new Promise((r) => setTimeout(r, m));
