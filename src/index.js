import ByteLengthQueuingStrategy from './whatwg-streams/byte-length-queuing-strategy.js';
import CountQueuingStrategy from './whatwg-streams/count-queuing-strategy.js';
import ReadableStream from './whatwg-streams/readable-stream.js';
import TransformStream from './whatwg-streams/transform-stream.js';
import WritableStream from './whatwg-streams/writable-stream.js';

var Streams = {
  ByteLengthQueuingStrategy,
  CountQueuingStrategy,
  ReadableStream,
  TransformStream,
  WritableStream
};
export default Streams;
