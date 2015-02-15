/**
 * @classdesc
 * ReadableStream represents a source of data, from which you can read.
 * In other words, data comes out of a readable stream.
 *
 * @fileexample
 * function getReadableStream() {
 *   return new Streams.ReadableStream({start});
 *
 *   var count = 0;
 *   var stop = false;
 *
 *   function start(enqueue, close, error) {
 *     var id = setInterval(()=>{
 *       if (stop) return;
 *
 *       var result = enqueue({count: count});
 *       if (result) {
 *         stop = true;
 *         return;
 *       }
 *
 *       count++;
 *       if (count === 10) {
 *         close();
 *         clearInterval(id);
 *       }
 *     }, 100);
 *   }
 *
 *   function pull(enqueue, close, error) {
 *     stop = false;
 *   }
 *
 * }
 *
 * var rs = getReadableStream();
 *
 * rs.closed.then(()=> console.log('finish')).catch(e => console.log('error!', e));
 *
 * pump();
 *
 * function pump() {
 *   while(rs.state === 'readable') {
 *     console.log(rs.read());
 *   }
 *
 *   if (rs.state === 'waiting') {
 *     rs.ready.then(pump);
 *   }
 * }
 *
 * @class
 * @desc Constructs a new stream instance with underlying source.
 * @param {Object} [underlyingSource] represent underlying source.
 *
 * @param {function} [underlyingSource.start] this stream is started. initialize underlying source in this function. this function is called only once.<br/>
 * ``start(enqueue, close, chunk)`` each arguments are
 * - ``enqueue(chunk: Object): boolean`` enqueue the chunk to internal queues. if results is false, need to back pressure.
 * - ``close(): void`` close this stream. can not enqueue after closed.
 * - ``error(e: Object): void`` error occur on stream. can not enqueue after error.
 *
 * @param {function} [underlyingSource.pull] this stream is required chunk. resume underlying source in this function.<br/>
 * ``pull(enqueue, close, error)`` each arguments are same as ``start(enqueue, close, chunk)``
 *
 * @param {function} [underlyingSource.cancel] this stream is canceled. finalize underlying source int this function. this function is called when consumer cancel to read from this</br>
 * ``cancel(reason)`` each arguments are
 * - ``reason: Object`` a reason of canceling.
 *
 * @param {{size: function, shouldApplyBackpressure: function}} [underlyingSource.strategy] specify queuing strategy. if does not specify it, {@link Streams.CountQueuingStrategy} is used with highWaterMark = 1.
 */
Streams.ReadableStream = function(underlyingSource) {
  /**
   * Observe the state becoming closed or errored.
   * @member {Promise}
   */
  this.closed;

  /**
   * Observe the state becoming readable, closed or errored.
   * @member {Promise}
   */
  this.ready;

  /**
   * A stream state is
   * - ``waiting`` wait to read data.
   * - ``readable`` can read data.
   * - ``closed`` stream is closed.
   * - ``errored`` stream is errored.
   * @member {string}
   */
  this.state;

  /**
   * Cancel reading from stream.
   * @param {*} [reason] cancel reason.
   */
  this.cancel = function(reason){};

  /**
   * Get exclusive reader and lock this stream.
   * After this calling, can not read from this stream.
   * @return {ExclusiveReader} exclusive reader for this stream.
   */
  this.getReader = function(){};

  /**
   * Through this stream in a transform stream.
   * @param {Object} transform
   * @param {WritableStream} transform.writable to write data that is read from stream.
   * @param {ReadableStream} transform.readable to read transformed data.
   * @param {Object} [options]
   * @param {boolean} [options.preventClose] if true, prevent close ``writable`` when ``readable`` is closed.
   * @param {boolean} [options.preventAbort] if true, prevent abort ``writable`` when ``readable`` is errored.
   * @param {boolean} [options.preventCancel] if true, prevent cancel ``readable`` when ``writable`` is errored.
   * @return {ReadableStream} for read transformed data.
   */
  this.pipeThrough = function(transform, options){};

  /**
   * Write data in this stream to writable stream.
   * @param {WritableStream} dest for write data.
   * @param {Object} options same as {@link Streams.ReadableStream#pipeThrough}.
   */
  this.pipeTo = function(dest, options){};

  /**
   * Read data from this stream. if this stream's state is not readable, throw a exception.
   * @return {*} data of this stream.
   */
  this.read = function(){};
};
