const FunctionBuilderBase = require('../function-builder-base');
const WebGLFunctionNode = require('./function-node');
const utils = require('../../core/utils');

/**
 * @class WebGLFunctionBuilder
 *
 * @extends FunctionBuilderBase
 *
 * Builds webGl functions (shaders) from JavaScript function Strings
 *
 */
module.exports = class WebGLFunctionBuilder extends FunctionBuilderBase {
	addFunction(functionName, jsFunction, paramTypes, returnType) {
		this.addFunctionNode(
			new WebGLFunctionNode(functionName, jsFunction, paramTypes, returnType)
			.setAddFunction(this.addFunction.bind(this))
		);
	}

	/**
	 * @name getStringFromFunctionNames
	 *
	 * @param functionList {[String,...]} List of function to build the webgl string.
	 *
	 * @returns {String} The full webgl string, of all the various functions. Trace optimized if functionName given
	 *
	 */
	getStringFromFunctionNames(functionList) {
		const ret = [];
		for (let i = 0; i < functionList.length; ++i) {
			const node = this.nodeMap[functionList[i]];
			if (node) {
				ret.push(this.nodeMap[functionList[i]].getFunctionString());
			}
		}
		return ret.join('\n');
	}

	/**
	 * @name getPrototypeStringFromFunctionNames
	 * 
	 * Return webgl String of all functions converted to webgl shader form
	 *
	 * @param functionList {[String,...]} List of function names to build the webgl string.
	 * @param opt {Object} 	   Settings object passed to functionNode. See functionNode for more details.	
	 *
	 * @returns {String} Prototype String of all functions converted to webgl shader form
	 *
	 */
	getPrototypeStringFromFunctionNames(functionList, opt) {
		const ret = [];
		for (let i = 0; i < functionList.length; ++i) {
			const node = this.nodeMap[functionList[i]];
			if (node) {
				ret.push(node.getFunctionPrototypeString(opt));
			}
		}
		return ret.join('\n');
	}

	/**
	 * @name getString
	 *
	 * @param functionName {String} Function name to trace from. If null, it returns the WHOLE builder stack
	 *
	 * @returns {String} The full webgl string, of all the various functions. Trace optimized if functionName given
	 *
	 */
	getString(functionName, opt) {
		if (opt === undefined) {
			opt = {};
		}

		if (functionName) {
			return this.getStringFromFunctionNames(this.traceFunctionCalls(functionName, [], opt).reverse(), opt);
		}
		return this.getStringFromFunctionNames(Object.keys(this.nodeMap), opt);
	}

	/**
	 * @name getPrototypeString
	 *
	 * Return the webgl string for a function converted to glsl (webgl shaders)
	 *
	 * @param functionName {String} Function name to trace from. If null, it returns the WHOLE builder stack
	 *
	 * @returns {String} The full webgl string, of all the various functions. Trace optimized if functionName given
	 *
	 */
	getPrototypeString(functionName) {
		this.rootKernel.generate();
		if (functionName) {
			return this.getPrototypeStringFromFunctionNames(this.traceFunctionCalls(functionName, []).reverse());
		}
		return this.getPrototypeStringFromFunctionNames(Object.keys(this.nodeMap));
	}

	/**
	 * @name addKernel 
	 *
	 * Add a new kernel to this instance
	 *
	 * @param fnString {String} Kernel function as a String
	 * @param options {Object} Settings object to set constants, debug mode, etc.
	 * @param paramNames {Array} Parameters of the kernel
	 * @param paramTypes {Array} Types of the parameters
	 *		
	 *
	 * @returns {Object} The inserted kernel as a Kernel Node
	 *
	 */
	addKernel(fnString, options, paramNames, paramTypes) {
		const kernelNode = new WebGLFunctionNode('kernel', fnString, options, paramTypes);
		kernelNode.setAddFunction(this.addFunction.bind(this));
		kernelNode.paramNames = paramNames;
		kernelNode.paramTypes = paramTypes;
		kernelNode.isRootKernel = true;
		this.addFunctionNode(kernelNode);
		return kernelNode;
	}

	/**
	 * @name addSubKernel
	 *
	 * Add a new sub-kernel to the current kernel instance
	 *
	 * @param jsFunction {Function} Sub-kernel function (JavaScript)
	 * @param options {Object} Settings object to set constants, debug mode, etc.
	 * @param paramNames {Array} Parameters of the sub-kernel
	 * @param returnType {Array} Return type of the subKernel
	 *
	 * @returns {Object} The inserted sub-kernel as a Kernel Node
	 *
	 */
	addSubKernel(jsFunction, options, paramTypes, returnType) {
		const kernelNode = new WebGLFunctionNode(null, jsFunction, options, paramTypes, returnType);
		kernelNode.setAddFunction(this.addFunction.bind(this));
		kernelNode.isSubKernel = true;
		this.addFunctionNode(kernelNode);
		return kernelNode;
	}
};