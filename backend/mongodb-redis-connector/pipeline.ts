import { Sink } from "./sink";
import { Source } from "./source";

type Transformer = (data: any) => Promise<any>;

interface Operator {
  run: (data: any) => Promise<any>;
}

class Pipeline {
  source: Source;
  sink: Sink;
  operators: Operator[];

  constructor(source: Source, sink: Sink, operators: Operator[]) {
    this.source = source;
    this.sink = sink;
    this.operators = operators;
  }

  async run() {
    const eventEmitter = await this.source.get();

    eventEmitter.on('change', async (data) => {
      console.log('[Pipeline] Received data:', data);

      for (const operator of this.operators) {
        data = await operator.run(data);
      }

      console.log('[Pipeline] Transformed data:', data);
      await this.sink.save(data);
    });
  }
}

export {
  Pipeline,
  Transformer,
  Operator,
};
