/**
 * @classdesc
 * ByteLengthQueuingStrategy uses chunk byte for queue size.
 * this strategy is only used for chunk that has ``.byteLength`` property.
 *
 * @filesexample
 * var strategy = new Streams.ByteLengthQueuingStrategy({highWaterMark: 1024});
 * var rs = new Streams.ReadableStream({strategy});
 *
 * @class
 * @param {Object} options
 * @param {number} options.highWaterMark maximum total chunk byte in internal queue.
 */
Streams.ByteLengthQueuingStrategy = function(options) {
  /**
   * Determines back pressure by chunk byte and high water mark.
   * Stop queuing chunk to internal queue at ReadableStream.
   * State is changed to waiting at WritableStream.
   * @param {number} queueSize current total chunk byte in queue.
   * @return {boolean} if returns true, should apply back pressure.
   */
  this.shouldApplyBackpressure = function(queueSize){};

  /**
   * Calculate chunk byte by chunk.byteLength.
   * @param {Object} chunk
   * @return {number} byte of chunk.
   */
  this.size = function(chunk){};
};
