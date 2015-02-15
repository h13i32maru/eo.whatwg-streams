/**
 * @classdesc
 * CountQueuingStrategy uses chunk count for queue size.
 *
 * @fileexample
 * var strategy = new Streams.CountQueuingStrategy({highWaterMark: 32});
 * var rs = new Streams.ReadableStream({strategy});
 *
 * @class
 * @param {Object} options
 * @param {number} options.highWaterMark maximum total chunk count in internal queue.
 */
Streams.CountQueuingStrategy = function(options) {
  /**
   * Determines back pressure by chunk count and high water mark.
   * Stop queuing chunk to internal queue at ReadableStream.
   * State is changed to waiting at WritableStream.
   * @param {number} queueSize current total chunk count in queue.
   * @return {boolean} if returns true, should apply back pressure.
   */
  this.shouldApplyBackpressure = function(queueSize){};

  /**
   * Calculate size of chunk. But this strategy always returns 1.
   * @param {Object} chunk
   * @return {number} always 1.
   */
  this.size = function(chunk){};
};
