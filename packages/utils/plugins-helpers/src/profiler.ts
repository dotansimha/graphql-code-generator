export interface ProfilerEvent {
  /** The name of the event, as displayed in Trace Viewer */
  name: string;
  /** The event categories. This is a comma separated list of categories for the event. The categories can be used to hide events in the Trace Viewer UI. */
  cat: string;
  /** The event type. This is a single character which changes depending on the type of event being output. The valid values are listed in the table below. We will discuss each phase type below. */
  ph: string;
  /** The tracing clock timestamp of the event. The timestamps are provided at microsecond granularity. */
  ts: number;
  /** Optional. The thread clock timestamp of the event. The timestamps are provided at microsecond granularity. */
  tts?: string;
  /** The process ID for the process that output this event. */
  pid: number;
  /** The thread ID for the thread that output this event. */
  tid: number;
  /** Any arguments provided for the event. Some of the event types have required argument fields, otherwise, you can put any information you wish in here. The arguments are displayed in Trace Viewer when you view an event in the analysis section. */
  args?: any;
  /** duration */
  dur: number;
  /** A fixed color name to associate with the event. If provided, cname must be one of the names listed in trace-viewer's base color scheme's reserved color names list */
  cname?: string;
}

export interface Profiler {
  run<T>(fn: () => Promise<T>, name: string, cat?: string): Promise<T>;
  collect(): ProfilerEvent[];
}

export function createNoopProfiler(): Profiler {
  return {
    run(fn) {
      return Promise.resolve().then(() => fn());
    },
    collect() {
      return [];
    },
  };
}

export function createProfiler(): Profiler {
  const events: ProfilerEvent[] = [];

  return {
    collect() {
      return events;
    },
    run(fn, name, cat) {
      let startTime: [number, number];

      return Promise.resolve()
        .then(() => {
          startTime = process.hrtime();
        })
        .then(() => fn())
        .then(value => {
          const duration = process.hrtime(startTime);

          // Trace Event Format documentation:
          // https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/preview
          const event: ProfilerEvent = {
            name,
            cat,
            ph: 'X',
            ts: hrtimeToMicroseconds(startTime),
            pid: 1,
            tid: 0,
            dur: hrtimeToMicroseconds(duration),
          };

          events.push(event);

          return value;
        });
    },
  };
}

function hrtimeToMicroseconds(hrtime: any) {
  return (hrtime[0] * 1e9 + hrtime[1]) / 1000;
}
