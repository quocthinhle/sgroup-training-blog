import EventEmitter from "events";

interface Source {
  get: () => Promise<EventEmitter>;
}

export {
  Source,
}