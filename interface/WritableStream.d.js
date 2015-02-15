/**
 * @classdesc
 * WritableStream represents a destination for data, into which you can write.
 * In other words, data goes in to a writable stream.
 *
 * @fileexample
 * function getWritableStream() {
 *   return new Streams.WritableStream({start, write});
 *
 *   function start(error) {
 *     if (!console || typeof console.log !== 'function') {
 *       error(new Error('console.log is not found');
 *     }
 *   }
 *
 *   function write(chunk) {
 *     return new Promise((resolve) =>{
 *       setTimeout(()=>{
 *         console.log(chunk);
 *         resolve();
 *       }, 100);
 *     });
 *   }
 * }
 *
 * var data = [1, 2, 3];
 * var ws = getWritableStream();
 *
 * pour();
 *
 * function pour(){
 *   while(ws.state === 'writable') {
 *     ws.write(data.shift());
 *   }
 *
 *   if (ws.state === 'waiting') {
 *     ws.ready.then(pour);
 *   }
 * }
 *
 * @class
 * @desc Constructs a new stream instance with underlying sink.
 * @param {Object} underlyingSink
 * @param {function} [underlyingSink.start] this stream is started. initialize underlying sink in this function.
 * this function is called only once. if returns Promise, wait for Promise is resolved.<br/>
 *
 * ``start(error)`` each arguments are
 * - ``error(e: Object)`` error occur on this stream. can not write chunk after error.
 *
 * @param {function} [underlyingSink.write] this stream is written chunk. write chunk to underlying sink in this function.
 * this function is called when producer write chunk to this stream. if returns Promise, wait for Promise is resolved.<br/>
 *
 * ``write(chunk)`` each arguments are
 * - ``chunk: Object`` chunk of data.
 *
 * @param {function} [underlyingSink.close] this stream is closed. finalize underlying sink in this function.
 * this function is called when producer cancel writing data. if returns Promise, wait for Promise is resolved.<br/>
 *
 * ``close(reason)`` each arguments are
 * - ``reason: Object`` reason of canceling.
 *
 * @param {{size: function, shouldApplyBackpressure: function}} [underlyingSink.strategy] specify queuing strategy. if does not specify it, {@link Streams.CountQueuingStrategy} is used with highWaterMark = 1.
 */
Streams.WritableStream = function(underlyingSink) {
  /**
   * Observe the state becoming closed or errored.
   * @member {Promise}
   */
  this.closed;

  /**
   * Observe the state becoming writable, closed, closing or errored.
   * @member {Promise}
   */
  this.ready;

  /**
   * A stream state is
   * - ``waiting`` writing chunk to underlying sink.
   * - ``writable`` can write chunk.
   * - ``closing`` closing underlying sink.
   * - ``closed`` stream is closed.
   * - ``errored`` stream is errored.
   * @member {string}
   */
  this.state;

  /**
   * Abort writing data.
   * @param {Object} [reason] reason of abort.
   */
  this.abort = function(reason){};

  /**
   * Close this stream.
   */
  this.close = function(){};

  /**
   * Write chunk to this stream.
   * @param {Object} chunk chunk of data.
   */
  this.write = function(chunk){};
};
