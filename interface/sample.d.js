/**
 * this is desc of SampleNameSpace1
 * @namespace SampleNameSpace1
 */

/**
 * this is desc of SampleNameSpace2
 * @namespace SampleNameSpace2
 */

/**
 * this is desc of SampleNameSpace3
 * @namespace SampleNameSpace3
 * @memberof SampleNameSpace1
 */

/**
 * this is desc of sample member0.
 * @member {string[]}
 * @example
 * sampleMember0 = ['Alice', 'Bob'];
 */
var sampleMember0;

/**
 * this is desc of sample member1.
 * @memberof SampleNameSpace1
 * @member {string}
 */
var sampleMember1;

/**
 * this is sample function0.
 * @param {number} arg1 this is number argument.
 * @param {string} arg2 this is string argument.
 * @return {string[]} this is string array.
 * @example
 * var result0 = sampleFunction0(123, 'foo');
 * var result1 = sampleFunction0(0, 'bar');
 * @example
 * var result0 = sampleFunction0(123, 'foo');
 * var result1 = sampleFunction0(0, 'bar');
 */
function sampleFunction0(arg1, arg2){}

/**
 * this is sample function1.
 * @param {number} arg1 this is number argument.
 * @param {string} arg2 this is string argument.
 * @return {string[]} this is string array.
 * @memberof SampleNameSpace1
 */
function sampleFunction1(arg1, arg2) {}

/**
 * this is sample function2.
 * @memberof SampleNameSpace
 * @param {number} arg1 this is number argument.
 * @param {string} arg2 this is string argument.
 * @return {string[]} this is string array.
 */
function sampleFunction2(arg1, arg2) {}

/**
 * @classdesc this is classdesc of SampleClass0.
 * @fileexample var hoge = 10;
 * var foo = new Sample(123, 'foo');
 * foo.method1(true, {flag: false});
 * foo.member1 = 'bar';
 *
 * var foo = 123;
 * @class
 * @desc this is desc of SampleClass1.
 * @param {number} arg1 this is number argument.
 * @param {string} arg2 this is string argument.
 * @example
 * var foo = new SampleClass0(123, 'foo');
 */
function SampleClass0(arg1, arg2) {
  /**
   * this is desc of member1.
   * @member {string}
   */
  this.member1 = null;

  /**
   * this is desc of methods1.
   * @param {boolean} arg1 this is boolean argument.
   * @param {Object} arg2 this is Object argument.
   */
  this.method1 = function(arg1, arg2){};
}

/**
 * @classdesc this is classdesc of SampleClass1.
 * @class
 * @desc this is desc of SampleClass1.
 * @param {number} arg1 this is number argument.
 * @param {string} arg2 this is string argument.
 * @memberof SampleNameSpace1
 */
function SampleClass1(arg1, arg2) {
  /**
   * this is desc of member1.
   * @member {string}
   */
  this.member1 = null;

  /**
   * this is desc of methods1.
   * @param {boolean} arg1 this is boolean argument.
   * @param {Object} arg2 this is Object argument.
   */
  this.method1 = function(arg1, arg2){};
}

/**
 * this is desc of staticMethod1.
 * @param {boolean} arg1 this is boolean argument.
 * @param {Object} arg2 this is Object argument.
 * @return {string[]} this is string array.
 */
SampleClass1.staticMethod1 = function(arg1, arg2){};

/**
 * this is desc of staticMember1.
 * @member {string}
 */
SampleClass1.staticMember1;

/**
 * this is desc sampleFunctionX
 * @namespace
 * @fileexample
 * var x = sampleFunction();
 */
function sampleFunctionX(){}

/**
 * this is desc of sampleFunctionY.
 * @memberof sampleFunctionX
 */
function sampleFunctionY(){}
