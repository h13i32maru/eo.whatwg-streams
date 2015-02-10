describe('Streams: ', ()=>{
  it('has streams class.', ()=>{
    assert.equal(typeof Streams.ByteLengthQueuingStrategy, 'function');
    assert.equal(typeof Streams.CountQueuingStrategy, 'function');
    assert.equal(typeof Streams.ReadableStream, 'function');
    assert.equal(typeof Streams.TransformStream, 'function');
    assert.equal(typeof Streams.WritableStream, 'function');
  });
});
