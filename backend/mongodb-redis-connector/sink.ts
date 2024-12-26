interface Sink {
  save: (data: any) => Promise<void>;
}

export {
  Sink,
}