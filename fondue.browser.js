(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
    window.fondue = require("./");
    
    },{"./":2}],2:[function(require,module,exports){
    (function (__dirname){
    /*
     * Copyright (c) 2012 Massachusetts Institute of Technology, Adobe Systems
     * Incorporated, and other contributors. All rights reserved.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a
     * copy of this software and associated documentation files (the "Software"),
     * to deal in the Software without restriction, including without limitation
     * the rights to use, copy, modify, merge, publish, distribute, sublicense,
     * and/or sell copies of the Software, and to permit persons to whom the
     * Software is furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
     * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
     * DEALINGS IN THE SOFTWARE.
     *
     */
    
    var basename = require('path').basename;
    var falafel = require('falafel');
    var falafelMap = require('falafel-map');
    var eselector = require('esprima-selector');
    var helpers = require('falafel-helpers');
    var fs = require('fs');
    
    // adds keys from options to defaultOptions, overwriting on conflicts & returning defaultOptions
    function mergeInto(options, defaultOptions) {
        for (var key in options) {
            if (options[key] !== undefined) {
                defaultOptions[key] = options[key];
            }
        }
        return defaultOptions;
    }
    
    // tiny templating library
    // replaces {name} with vars.name
    function template(s, vars) {
        for (var p in vars) {
            s = s.replace(new RegExp('{' + p + '}', 'g'), vars[p]);
        }
        return s;
    }
    
    function makeId(type, path, loc) {
        return path + '-'
             + type + '-'
             + loc.start.line + '-'
             + loc.start.column + '-'
             + loc.end.line + '-'
             + loc.end.column;
    };
    
    function instrumentationPrefix(options) {
        options = mergeInto(options, {
            name: '__tracer',
            nodejs: false,
            maxInvocationsPerTick: 4096,
        });
    
        // the inline comments below are markers for building the browser version of
        // fondue, where the file contents will be inlined as a string.
        var tracerSource = "/*\nThe following code was inserted automatically by fondue to collect information\nabout the execution of all the JavaScript on this page or in this program.\n\nIf you're using Brackets, this is caused by the Theseus extension, which you\ncan disable by unchecking File > Enable Theseus.\n\nhttps://github.com/adobe-research/fondue\nhttps://github.com/adobe-research/theseus\n*/\n\n/*\n * Copyright (c) 2012 Massachusetts Institute of Technology, Adobe Systems\n * Incorporated, and other contributors. All rights reserved.\n *\n * Permission is hereby granted, free of charge, to any person obtaining a\n * copy of this software and associated documentation files (the \"Software\"),\n * to deal in the Software without restriction, including without limitation\n * the rights to use, copy, modify, merge, publish, distribute, sublicense,\n * and/or sell copies of the Software, and to permit persons to whom the\n * Software is furnished to do so, subject to the following conditions:\n *\n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n *\n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING\n * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER\n * DEALINGS IN THE SOFTWARE.\n *\n */\n\n/*\nThe source of source-map is included below on the line beginning with \"var sourceMap\",\nand its license is as follows:\n\nCopyright (c) 2009-2011, Mozilla Foundation and contributors\nAll rights reserved.\n\nRedistribution and use in source and binary forms, with or without\nmodification, are permitted provided that the following conditions are met:\n\n* Redistributions of source code must retain the above copyright notice, this\n  list of conditions and the following disclaimer.\n\n* Redistributions in binary form must reproduce the above copyright notice,\n  this list of conditions and the following disclaimer in the documentation\n  and/or other materials provided with the distribution.\n\n* Neither the names of the Mozilla Foundation nor the names of project\n  contributors may be used to endorse or promote products derived from this\n  software without specific prior written permission.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\" AND\nANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED\nWARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE\nDISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE\nFOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL\nDAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR\nSERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER\nCAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,\nOR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE\nOF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n*/\n\nif (typeof {name} === 'undefined') {\n{name} = new (function () {\n\tvar sourceMap = (function () {function define(e,t,n){if(typeof e!=\"string\")throw new TypeError(\"Expected string, got: \"+e);arguments.length==2&&(n=t);if(e in define.modules)throw new Error(\"Module already defined: \"+e);define.modules[e]=n}function Domain(){this.modules={},this._currentModule=null}define.modules={},function(){function e(e){var t=e.split(\"/\"),n=1;while(n<t.length)t[n]===\"..\"?t.splice(n-1,1):t[n]===\".\"?t.splice(n,1):n++;return t.join(\"/\")}function t(e,t){return e=e.trim(),t=t.trim(),/^\\//.test(t)?t:e.replace(/\\/*$/,\"/\")+t}function n(e){var t=e.split(\"/\");return t.pop(),t.join(\"/\")}Domain.prototype.require=function(e,t){if(Array.isArray(e)){var n=e.map(function(e){return this.lookup(e)},this);return t&&t.apply(null,n),undefined}return this.lookup(e)},Domain.prototype.lookup=function(r){/^\\./.test(r)&&(r=e(t(n(this._currentModule),r)));if(r in this.modules){var i=this.modules[r];return i}if(r in define.modules){var i=define.modules[r];if(typeof i==\"function\"){var s={},o=this._currentModule;this._currentModule=r,i(this.require.bind(this),s,{id:r,uri:\"\"}),this._currentModule=o,i=s}return this.modules[r]=i,i}throw new Error(\"Module not defined: \"+r)}}(),define.Domain=Domain,define.globalDomain=new Domain;var require=define.globalDomain.require.bind(define.globalDomain);define(\"source-map/source-map-generator\",[\"require\",\"exports\",\"module\",\"source-map/base64-vlq\",\"source-map/util\",\"source-map/array-set\"],function(e,t,n){function o(e){this._file=i.getArg(e,\"file\"),this._sourceRoot=i.getArg(e,\"sourceRoot\",null),this._sources=new s,this._names=new s,this._mappings=[],this._sourcesContents=null}function u(e,t){var n=(e&&e.line)-(t&&t.line);return n?n:(e&&e.column)-(t&&t.column)}function a(e,t){return e=e||\"\",t=t||\"\",(e>t)-(e<t)}function f(e,t){return u(e.generated,t.generated)||u(e.original,t.original)||a(e.source,t.source)||a(e.name,t.name)}var r=e(\"./base64-vlq\"),i=e(\"./util\"),s=e(\"./array-set\").ArraySet;o.prototype._version=3,o.fromSourceMap=function(t){var n=t.sourceRoot,r=new o({file:t.file,sourceRoot:n});return t.eachMapping(function(e){var t={generated:{line:e.generatedLine,column:e.generatedColumn}};e.source&&(t.source=e.source,n&&(t.source=i.relative(n,t.source)),t.original={line:e.originalLine,column:e.originalColumn},e.name&&(t.name=e.name)),r.addMapping(t)}),t.sources.forEach(function(e){var n=t.sourceContentFor(e);n&&r.setSourceContent(e,n)}),r},o.prototype.addMapping=function(t){var n=i.getArg(t,\"generated\"),r=i.getArg(t,\"original\",null),s=i.getArg(t,\"source\",null),o=i.getArg(t,\"name\",null);this._validateMapping(n,r,s,o),s&&!this._sources.has(s)&&this._sources.add(s),o&&!this._names.has(o)&&this._names.add(o),this._mappings.push({generated:n,original:r,source:s,name:o})},o.prototype.setSourceContent=function(t,n){var r=t;this._sourceRoot&&(r=i.relative(this._sourceRoot,r)),n!==null?(this._sourcesContents||(this._sourcesContents={}),this._sourcesContents[i.toSetString(r)]=n):(delete this._sourcesContents[i.toSetString(r)],Object.keys(this._sourcesContents).length===0&&(this._sourcesContents=null))},o.prototype.applySourceMap=function(t,n){n||(n=t.file);var r=this._sourceRoot;r&&(n=i.relative(r,n));var o=new s,u=new s;this._mappings.forEach(function(e){if(e.source===n&&e.original){var s=t.originalPositionFor({line:e.original.line,column:e.original.column});s.source!==null&&(r?e.source=i.relative(r,s.source):e.source=s.source,e.original.line=s.line,e.original.column=s.column,s.name!==null&&e.name!==null&&(e.name=s.name))}var a=e.source;a&&!o.has(a)&&o.add(a);var f=e.name;f&&!u.has(f)&&u.add(f)},this),this._sources=o,this._names=u,t.sources.forEach(function(e){var n=t.sourceContentFor(e);n&&(r&&(e=i.relative(r,e)),this.setSourceContent(e,n))},this)},o.prototype._validateMapping=function(t,n,r,i){if(t&&\"line\"in t&&\"column\"in t&&t.line>0&&t.column>=0&&!n&&!r&&!i)return;if(t&&\"line\"in t&&\"column\"in t&&n&&\"line\"in n&&\"column\"in n&&t.line>0&&t.column>=0&&n.line>0&&n.column>=0&&r)return;throw new Error(\"Invalid mapping.\")},o.prototype._serializeMappings=function(){var t=0,n=1,i=0,s=0,o=0,u=0,a=\"\",l;this._mappings.sort(f);for(var c=0,h=this._mappings.length;c<h;c++){l=this._mappings[c];if(l.generated.line!==n){t=0;while(l.generated.line!==n)a+=\";\",n++}else if(c>0){if(!f(l,this._mappings[c-1]))continue;a+=\",\"}a+=r.encode(l.generated.column-t),t=l.generated.column,l.source&&l.original&&(a+=r.encode(this._sources.indexOf(l.source)-u),u=this._sources.indexOf(l.source),a+=r.encode(l.original.line-1-s),s=l.original.line-1,a+=r.encode(l.original.column-i),i=l.original.column,l.name&&(a+=r.encode(this._names.indexOf(l.name)-o),o=this._names.indexOf(l.name)))}return a},o.prototype.toJSON=function(){var t={version:this._version,file:this._file,sources:this._sources.toArray(),names:this._names.toArray(),mappings:this._serializeMappings()};return this._sourceRoot&&(t.sourceRoot=this._sourceRoot),this._sourcesContents&&(t.sourcesContent=t.sources.map(function(e){return t.sourceRoot&&(e=i.relative(t.sourceRoot,e)),Object.prototype.hasOwnProperty.call(this._sourcesContents,i.toSetString(e))?this._sourcesContents[i.toSetString(e)]:null},this)),t},o.prototype.toString=function(){return JSON.stringify(this)},t.SourceMapGenerator=o}),define(\"source-map/base64-vlq\",[\"require\",\"exports\",\"module\",\"source-map/base64\"],function(e,t,n){function a(e){return e<0?(-e<<1)+1:(e<<1)+0}function f(e){var t=(e&1)===1,n=e>>1;return t?-n:n}var r=e(\"./base64\"),i=5,s=1<<i,o=s-1,u=s;t.encode=function(t){var n=\"\",s,f=a(t);do s=f&o,f>>>=i,f>0&&(s|=u),n+=r.encode(s);while(f>0);return n},t.decode=function(t){var n=0,s=t.length,a=0,l=0,c,h;do{if(n>=s)throw new Error(\"Expected more digits in base 64 VLQ value.\");h=r.decode(t.charAt(n++)),c=!!(h&u),h&=o,a+=h<<l,l+=i}while(c);return{value:f(a),rest:t.slice(n)}}}),define(\"source-map/base64\",[\"require\",\"exports\",\"module\"],function(e,t,n){var r={},i={};\"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\".split(\"\").forEach(function(e,t){r[e]=t,i[t]=e}),t.encode=function(t){if(t in i)return i[t];throw new TypeError(\"Must be between 0 and 63: \"+t)},t.decode=function(t){if(t in r)return r[t];throw new TypeError(\"Not a valid base 64 digit: \"+t)}}),define(\"source-map/util\",[\"require\",\"exports\",\"module\"],function(e,t,n){function r(e,t,n){if(t in e)return e[t];if(arguments.length===3)return n;throw new Error('\"'+t+'\" is a required argument.')}function s(e){var t=e.match(i);return t?{scheme:t[1],auth:t[3],host:t[4],port:t[6],path:t[7]}:null}function o(e){var t=e.scheme+\"://\";return e.auth&&(t+=e.auth+\"@\"),e.host&&(t+=e.host),e.port&&(t+=\":\"+e.port),e.path&&(t+=e.path),t}function u(e,t){var n;return t.match(i)?t:t.charAt(0)===\"/\"&&(n=s(e))?(n.path=t,o(n)):e.replace(/\\/$/,\"\")+\"/\"+t}function a(e){return\"$\"+e}function f(e){return e.substr(1)}function l(e,t){e=e.replace(/\\/$/,\"\");var n=s(e);return t.charAt(0)==\"/\"&&n&&n.path==\"/\"?t.slice(1):t.indexOf(e+\"/\")===0?t.substr(e.length+1):t}t.getArg=r;var i=/([\\w+\\-.]+):\\/\\/((\\w+:\\w+)@)?([\\w.]+)?(:(\\d+))?(\\S+)?/;t.urlParse=s,t.urlGenerate=o,t.join=u,t.toSetString=a,t.fromSetString=f,t.relative=l}),define(\"source-map/array-set\",[\"require\",\"exports\",\"module\",\"source-map/util\"],function(e,t,n){function i(){this._array=[],this._set={}}var r=e(\"./util\");i.fromArray=function(t){var n=new i;for(var r=0,s=t.length;r<s;r++)n.add(t[r]);return n},i.prototype.add=function(t){if(this.has(t))return;var n=this._array.length;this._array.push(t),this._set[r.toSetString(t)]=n},i.prototype.has=function(t){return Object.prototype.hasOwnProperty.call(this._set,r.toSetString(t))},i.prototype.indexOf=function(t){if(this.has(t))return this._set[r.toSetString(t)];throw new Error('\"'+t+'\" is not in the set.')},i.prototype.at=function(t){if(t>=0&&t<this._array.length)return this._array[t];throw new Error(\"No element indexed by \"+t)},i.prototype.toArray=function(){return this._array.slice()},t.ArraySet=i}),define(\"source-map/source-map-consumer\",[\"require\",\"exports\",\"module\",\"source-map/util\",\"source-map/binary-search\",\"source-map/array-set\",\"source-map/base64-vlq\"],function(e,t,n){function u(e){var t=e;typeof e==\"string\"&&(t=JSON.parse(e.replace(/^\\)\\]\\}'/,\"\")));var n=r.getArg(t,\"version\"),i=r.getArg(t,\"sources\"),o=r.getArg(t,\"names\"),u=r.getArg(t,\"sourceRoot\",null),a=r.getArg(t,\"sourcesContent\",null),f=r.getArg(t,\"mappings\"),l=r.getArg(t,\"file\",null);if(n!==this._version)throw new Error(\"Unsupported version: \"+n);this._names=s.fromArray(o),this._sources=s.fromArray(i),this.sourceRoot=u,this.sourcesContent=a,this.file=l,this._generatedMappings=[],this._originalMappings=[],this._parseMappings(f,u)}var r=e(\"./util\"),i=e(\"./binary-search\"),s=e(\"./array-set\").ArraySet,o=e(\"./base64-vlq\");u.prototype._version=3,Object.defineProperty(u.prototype,\"sources\",{get:function(){return this._sources.toArray().map(function(e){return this.sourceRoot?r.join(this.sourceRoot,e):e},this)}}),u.prototype._parseMappings=function(t,n){var r=1,i=0,s=0,u=0,a=0,f=0,l=/^[,;]/,c=t,h,p;while(c.length>0)if(c.charAt(0)===\";\")r++,c=c.slice(1),i=0;else if(c.charAt(0)===\",\")c=c.slice(1);else{h={},h.generatedLine=r,p=o.decode(c),h.generatedColumn=i+p.value,i=h.generatedColumn,c=p.rest;if(c.length>0&&!l.test(c.charAt(0))){p=o.decode(c),h.source=this._sources.at(a+p.value),a+=p.value,c=p.rest;if(c.length===0||l.test(c.charAt(0)))throw new Error(\"Found a source, but no line and column\");p=o.decode(c),h.originalLine=s+p.value,s=h.originalLine,h.originalLine+=1,c=p.rest;if(c.length===0||l.test(c.charAt(0)))throw new Error(\"Found a source and line, but no column\");p=o.decode(c),h.originalColumn=u+p.value,u=h.originalColumn,c=p.rest,c.length>0&&!l.test(c.charAt(0))&&(p=o.decode(c),h.name=this._names.at(f+p.value),f+=p.value,c=p.rest)}this._generatedMappings.push(h),typeof h.originalLine==\"number\"&&this._originalMappings.push(h)}this._originalMappings.sort(this._compareOriginalPositions)},u.prototype._compareOriginalPositions=function(t,n){if(t.source>n.source)return 1;if(t.source<n.source)return-1;var r=t.originalLine-n.originalLine;return r===0?t.originalColumn-n.originalColumn:r},u.prototype._compareGeneratedPositions=function(t,n){var r=t.generatedLine-n.generatedLine;return r===0?t.generatedColumn-n.generatedColumn:r},u.prototype._findMapping=function(t,n,r,s,o){if(t[r]<=0)throw new TypeError(\"Line must be greater than or equal to 1, got \"+t[r]);if(t[s]<0)throw new TypeError(\"Column must be greater than or equal to 0, got \"+t[s]);return i.search(t,n,o)},u.prototype.originalPositionFor=function(t){var n={generatedLine:r.getArg(t,\"line\"),generatedColumn:r.getArg(t,\"column\")},i=this._findMapping(n,this._generatedMappings,\"generatedLine\",\"generatedColumn\",this._compareGeneratedPositions);if(i){var s=r.getArg(i,\"source\",null);return s&&this.sourceRoot&&(s=r.join(this.sourceRoot,s)),{source:s,line:r.getArg(i,\"originalLine\",null),column:r.getArg(i,\"originalColumn\",null),name:r.getArg(i,\"name\",null)}}return{source:null,line:null,column:null,name:null}},u.prototype.sourceContentFor=function(t){if(!this.sourcesContent)return null;this.sourceRoot&&(t=r.relative(this.sourceRoot,t));if(this._sources.has(t))return this.sourcesContent[this._sources.indexOf(t)];var n;if(this.sourceRoot&&(n=r.urlParse(this.sourceRoot))){var i=t.replace(/^file:\\/\\//,\"\");if(n.scheme==\"file\"&&this._sources.has(i))return this.sourcesContent[this._sources.indexOf(i)];if((!n.path||n.path==\"/\")&&this._sources.has(\"/\"+t))return this.sourcesContent[this._sources.indexOf(\"/\"+t)]}throw new Error('\"'+t+'\" is not in the SourceMap.')},u.prototype.generatedPositionFor=function(t){var n={source:r.getArg(t,\"source\"),originalLine:r.getArg(t,\"line\"),originalColumn:r.getArg(t,\"column\")};this.sourceRoot&&(n.source=r.relative(this.sourceRoot,n.source));var i=this._findMapping(n,this._originalMappings,\"originalLine\",\"originalColumn\",this._compareOriginalPositions);return i?{line:r.getArg(i,\"generatedLine\",null),column:r.getArg(i,\"generatedColumn\",null)}:{line:null,column:null}},u.GENERATED_ORDER=1,u.ORIGINAL_ORDER=2,u.prototype.eachMapping=function(t,n,i){var s=n||null,o=i||u.GENERATED_ORDER,a;switch(o){case u.GENERATED_ORDER:a=this._generatedMappings;break;case u.ORIGINAL_ORDER:a=this._originalMappings;break;default:throw new Error(\"Unknown order of iteration.\")}var f=this.sourceRoot;a.map(function(e){var t=e.source;return t&&f&&(t=r.join(f,t)),{source:t,generatedLine:e.generatedLine,generatedColumn:e.generatedColumn,originalLine:e.originalLine,originalColumn:e.originalColumn,name:e.name}}).forEach(t,s)},t.SourceMapConsumer=u}),define(\"source-map/binary-search\",[\"require\",\"exports\",\"module\"],function(e,t,n){function r(e,t,n,i,s){var o=Math.floor((t-e)/2)+e,u=s(n,i[o]);return u===0?i[o]:u>0?t-o>1?r(o,t,n,i,s):i[o]:o-e>1?r(e,o,n,i,s):e<0?null:i[e]}t.search=function(t,n,i){return n.length>0?r(-1,n.length,t,n,i):null}}),define(\"source-map/source-node\",[\"require\",\"exports\",\"module\",\"source-map/source-map-generator\",\"source-map/util\"],function(e,t,n){function s(e,t,n,r,i){this.children=[],this.sourceContents={},this.line=e===undefined?null:e,this.column=t===undefined?null:t,this.source=n===undefined?null:n,this.name=i===undefined?null:i,r!=null&&this.add(r)}var r=e(\"./source-map-generator\").SourceMapGenerator,i=e(\"./util\");s.fromStringWithSourceMap=function(t,n){function f(e,t){e===null||e.source===undefined?r.add(t):r.add(new s(e.originalLine,e.originalColumn,e.source,t,e.name))}var r=new s,i=t.split(\"\\n\"),o=1,u=0,a=null;return n.eachMapping(function(e){if(a===null){while(o<e.generatedLine)r.add(i.shift()+\"\\n\"),o++;if(u<e.generatedColumn){var t=i[0];r.add(t.substr(0,e.generatedColumn)),i[0]=t.substr(e.generatedColumn),u=e.generatedColumn}}else if(o<e.generatedLine){var n=\"\";do n+=i.shift()+\"\\n\",o++,u=0;while(o<e.generatedLine);if(u<e.generatedColumn){var t=i[0];n+=t.substr(0,e.generatedColumn),i[0]=t.substr(e.generatedColumn),u=e.generatedColumn}f(a,n)}else{var t=i[0],n=t.substr(0,e.generatedColumn-u);i[0]=t.substr(e.generatedColumn-u),u=e.generatedColumn,f(a,n)}a=e},this),f(a,i.join(\"\\n\")),n.sources.forEach(function(e){var t=n.sourceContentFor(e);t&&r.setSourceContent(e,t)}),r},s.prototype.add=function(t){if(Array.isArray(t))t.forEach(function(e){this.add(e)},this);else{if(!(t instanceof s||typeof t==\"string\"))throw new TypeError(\"Expected a SourceNode, string, or an array of SourceNodes and strings. Got \"+t);t&&this.children.push(t)}return this},s.prototype.prepend=function(t){if(Array.isArray(t))for(var n=t.length-1;n>=0;n--)this.prepend(t[n]);else{if(!(t instanceof s||typeof t==\"string\"))throw new TypeError(\"Expected a SourceNode, string, or an array of SourceNodes and strings. Got \"+t);this.children.unshift(t)}return this},s.prototype.walk=function(t){this.children.forEach(function(e){e instanceof s?e.walk(t):e!==\"\"&&t(e,{source:this.source,line:this.line,column:this.column,name:this.name})},this)},s.prototype.join=function(t){var n,r,i=this.children.length;if(i>0){n=[];for(r=0;r<i-1;r++)n.push(this.children[r]),n.push(t);n.push(this.children[r]),this.children=n}return this},s.prototype.replaceRight=function(t,n){var r=this.children[this.children.length-1];return r instanceof s?r.replaceRight(t,n):typeof r==\"string\"?this.children[this.children.length-1]=r.replace(t,n):this.children.push(\"\".replace(t,n)),this},s.prototype.setSourceContent=function(t,n){this.sourceContents[i.toSetString(t)]=n},s.prototype.walkSourceContents=function(t){this.children.forEach(function(e){e instanceof s&&e.walkSourceContents(t)},this),Object.keys(this.sourceContents).forEach(function(e){t(i.fromSetString(e),this.sourceContents[e])},this)},s.prototype.toString=function(){var t=\"\";return this.walk(function(e){t+=e}),t},s.prototype.toStringWithSourceMap=function(t){var n={code:\"\",line:1,column:0},i=new r(t),s=!1;return this.walk(function(e,t){n.code+=e,t.source!==null&&t.line!==null&&t.column!==null?(i.addMapping({source:t.source,original:{line:t.line,column:t.column},generated:{line:n.line,column:n.column},name:t.name}),s=!0):s&&(i.addMapping({generated:{line:n.line,column:n.column}}),s=!1),e.split(\"\").forEach(function(e){e===\"\\n\"?(n.line++,n.column=0):n.column++})}),this.walkSourceContents(function(e,t){i.setSourceContent(e,t)}),{code:n.code,map:i}},t.SourceNode=s});return {SourceMapConsumer:require(\"source-map/source-map-consumer\").SourceMapConsumer,SourceMapGenerator:require(\"source-map/source-map-generator\").SourceMapGenerator,SourceNode:require(\"source-map/source-node\").SourceNode}})();\n\n\tvar TRACER_ID = String(Math.random());\n\n\tvar globalThis = undefined;\n\n\tvar sourceByPath = {};\n\tvar nodes = []; // objects describing functions, branches, call sites, etc\n\tvar nodeById = {}; // id(string) -> node\n\tvar invocationStack = [];\n\tvar invocationById = {}; // id(string) -> invocation\n\tvar invocationsByNodeId = {}; // id(string) -> array of invocations\n\tvar exceptionsByNodeId = {}; // nodeId -> array of { exception: ..., invocationId: ... }\n\tvar uncaughtExceptionsByNodeId = {}; // nodeId -> array of { exception: ..., invocationId: ... }\n\tvar nodeHitCounts = {}; // { query-handle: { nodeId: hit-count } }\n\tvar exceptionCounts = {}; // { query-handle: { nodeId: exception-count } }\n\tvar logEntries = {}; // { query-handle: [invocation id] }\n\tvar anonFuncParentInvocation, lastException, lastExceptionThrownFromInvocation; // yucky globals track state between trace* calls\n\tvar nextInvocationId = 0;\n\tvar _hitQueries = [];\n\tvar _exceptionQueries = [];\n\tvar _logQueries = [];\n\tvar _fileCallGraph = [];\n\tvar _sourceMaps = {};\n\n\tvar _connected = false;\n\n\t// epochs\n\tvar _lastEpochID = 0;\n\tvar _lastEmitterID = 0;\n\tvar _epochsById = []; // int -> epoch (only epochs that end up as part of the call graph are saved)\n\tvar _epochsByName = {}; // string -> [epoch] (only epochs that end up as part of the call graph are saved)\n\tvar _topLevelEpochsByName = {}; // string -> [epoch]\n\tvar _epochStack = [];\n\tvar _epochInvocationDepth = []; // stack of how deep into the invocation stack of each epoch we are\n\tvar _topLevelInvocationsByEventName = {};\n\n\t// bail\n\tvar _bailedTick = false;\n\tvar _invocationsThisTick = 0;\n\tvar _invocationStackSize = 0;\n\tvar _explainedBails = false;\n\n\tfunction _consoleLog() {\n\t\tif (typeof console !== 'undefined') {\n\t\t\tconsole.log.apply(console, arguments);\n\t\t}\n\t}\n\n\tfunction _resetTrace() {\n\t\t_consoleLog(\"[fondue] resetting trace data...\");\n\n\t\tinvocationStack = [];\n\t\tinvocationById = {}; // id(string) -> invocation\n\t\tinvocationsByNodeId = {}; // id(string) -> array of invocations\n\t\texceptionsByNodeId = {}; // nodeId -> array of { exception: ..., invocationId: ... }\n\t\tuncaughtExceptionsByNodeId = {}; // nodeId -> array of { exception: ..., invocationId: ... }\n\t\tnodeHitCounts = {}; // { query-handle: { nodeId: hit-count } }\n\t\texceptionCounts = {}; // { query-handle: { nodeId: exception-count } }\n\t\tlogEntries = {}; // { query-handle: [invocation id] }\n\t\tanonFuncParentInvocation = undefined, lastException = undefined, lastExceptionThrownFromInvocation = undefined; // yucky globals track state between trace* calls\n\t\t_hitQueries = [];\n\t\t_exceptionQueries = [];\n\t\t_logQueries = [];\n\t\t_fileCallGraph = [];\n\n\t\t// epochs\n\t\t_epochsById = []; // int -> epoch (only epochs that end up as part of the call graph are saved)\n\t\t_epochsByName = {}; // string -> [epoch] (only epochs that end up as part of the call graph are saved)\n\t\t_topLevelEpochsByName = {}; // string -> [epoch]\n\t\t_epochStack = [];\n\t\t_epochInvocationDepth = []; // stack of how deep into the invocation stack of each epoch we are\n\t\t_topLevelInvocationsByEventName = {};\n\n\t\t// bail\n\t\t_bailedTick = false;\n\t\t_invocationsThisTick = 0;\n\t\t_invocationStackSize = 0;\n\t\t_explainedBails = false;\n\n\t\tnodeTracker.reset();\n\t\tepochTracker.reset();\n\t\tfileCallGraphTracker.reset();\n\t}\n\n\t/*\n\tFetching data from fondue happens by requesting a handle for the data you\n\twant, then calling another function to get the latest data from that handle.\n\tTypically, the first call to that function returns all the historical data\n\tand subsequent calls return the changes since the last call.\n\n\tThe bookkeeping was the same in all the cases. Now this 'base class' handles\n\tit. Just make a new instance and override backfill() and updateSingle().\n\t*/\n\tfunction Tracker(handlePrefix) {\n\t\tthis.lastHandleID = 0;\n\t\tthis.handlePrefix = handlePrefix;\n\t\tthis.queries = {}; // handle -> query\n\t\tthis.data = {}; // handle -> data\n\t}\n\tTracker.prototype = {\n\t\ttrack: function (query) {\n\t\t\tvar handleID = ++this.lastHandleID;\n\t\t\tvar handle = this.handlePrefix + '-' + handleID;\n\t\t\tthis.queries[handle] = query;\n\t\t\tthis.data[handle] = this.backfill(query);\n\t\t\treturn handle;\n\t\t},\n\t\tuntrack: function (handle) {\n\t\t\tthis._checkHandle(handle);\n\n\t\t\tdelete this.queries[handle];\n\t\t\tdelete this.data[handle];\n\t\t},\n\t\t/** return the data to be returned from the first call to delta() */\n\t\tbackfill: function (query) {\n\t\t\t// override this\n\t\t\treturn {};\n\t\t},\n\t\tupdate: function () {\n\t\t\tfor (var handle in this.data) {\n\t\t\t\tvar data = this.data[handle];\n\t\t\t\tvar args = [data].concat(Array.prototype.slice.apply(arguments));\n\t\t\t\tthis.data[handle] = this.updateSingle.apply(this, args);\n\t\t\t}\n\t\t},\n\t\t/**\n\t\tdata: the previous data for this query\n\t\targuments passed to update() will be passed after the data argument.\n\t\t*/\n\t\tupdateSingle: function (data, extraData1, extraData2) {\n\t\t\t// override this\n\t\t\tdata['foo'] = 'bar';\n\t\t\treturn data;\n\t\t},\n\t\tdelta: function (handle) {\n\t\t\tthis._checkHandle(handle);\n\n\t\t\tvar result = this.data[handle];\n\t\t\tthis.data[handle] = this.emptyData(handle);\n\t\t\treturn result;\n\t\t},\n\t\t/** after a call to delta(), the data for a handle is reset to this */\n\t\temptyData: function (handle) {\n\t\t\treturn {};\n\t\t},\n\t\treset: function () {\n\t\t\tthis.queries = {}; // handle -> query\n\t\t\tthis.data = {}; // handle -> data\n\t\t},\n\t\t_checkHandle: function (handle) {\n\t\t\tif (!(handle in this.queries)) {\n\t\t\t\tthrow new Error(\"unrecognized query\");\n\t\t\t}\n\t\t},\n\t}\n\n\tvar nodeTracker = new Tracker('node');\n\tnodeTracker.emptyData = function () {\n\t\treturn [];\n\t};\n\tnodeTracker.backfill = function () {\n\t\treturn nodes.slice();\n\t};\n\tnodeTracker.updateSingle = function (data, newNodes) {\n\t\tdata.push.apply(data, newNodes);\n\t\treturn data;\n\t};\n\n\tvar epochTracker = new Tracker('epoch');\n\tepochTracker.backfill = function () {\n\t\tvar data = {};\n\t\tfor (var epochName in _topLevelEpochsByName) {\n\t\t\tdata[epochName] = { hits: _topLevelEpochsByName[epochName].length };\n\t\t}\n\t\treturn data;\n\t};\n\tepochTracker.updateSingle = function (data, epoch) {\n\t\tif (!(epoch.eventName in data)) {\n\t\t\tdata[epoch.eventName] = { hits: 0 };\n\t\t}\n\t\tdata[epoch.eventName].hits++;\n\t\treturn data;\n\t};\n\n\tvar fileCallGraphTracker = new Tracker('file-call-graph');\n\tfileCallGraphTracker.emptyData = function () {\n\t\treturn [];\n\t};\n\tfileCallGraphTracker.backfill = function () {\n\t\treturn _fileCallGraph.slice();\n\t};\n\tfileCallGraphTracker.updateSingle = function (data, item) {\n\t\tdata.push(item);\n\t\treturn data;\n\t};\n\n\tfunction _addSpecialNodes() {\n\t\tvar node = {\n\t\t\tpath: \"[built-in]\",\n\t\t\tstart: { line: 0, column: 0 },\n\t\t\tend: { line: 0, column: 0 },\n\t\t\tid: \"log\",\n\t\t\ttype: \"function\",\n\t\t\tchildrenIds: [],\n\t\t\tparentId: undefined,\n\t\t\tname: \"[log]\",\n\t\t\tparams: []\n\t\t};\n\t\tnodes.push(node);\n\t\tnodeById[node.id] = node;\n\t}\n\t_addSpecialNodes();\n\n\n\t// helpers\n\n\t// adds keys from options to defaultOptions, overwriting on conflicts & returning defaultOptions\n\tfunction mergeInto(options, defaultOptions) {\n\t\tfor (var key in options) {\n\t\t\tdefaultOptions[key] = options[key];\n\t\t}\n\t\treturn defaultOptions;\n\t}\n\n\t/**\n\t * calls callback with (collect, item, index) where collect is a function\n\t * whose argument should be one of the strings to be de-duped.\n\t * returns an array where each string appears only once.\n\t */\n\tfunction dedup(collection, callback) {\n\t\tvar o = {};\n\t\tvar collect = function (str) {\n\t\t\to[str] = true;\n\t\t};\n\t\tfor (var i in collection) {\n\t\t\tcallback(collect, collection[i], i);\n\t\t}\n\t\tvar arr = [];\n\t\tfor (var str in o) {\n\t\t\tarr.push(str);\n\t\t}\n\t\treturn arr;\n\t};\n\n\tfunction count(collection, callback) {\n\t\tvar o = {};\n\t\tvar collect = function (str) {\n\t\t\tif (str in o) {\n\t\t\t\to[str]++;\n\t\t\t} else {\n\t\t\t\to[str] = 1;\n\t\t\t}\n\t\t};\n\t\tfor (var i in collection) {\n\t\t\tcallback(collect, collection[i], i);\n\t\t}\n\t\treturn o;\n\t};\n\n\tfunction flattenmap(collection, callback) {\n\t\tvar arr = [];\n\t\tvar collect = function (o) {\n\t\t\tarr.push(o);\n\t\t};\n\t\tfor (var i in collection) {\n\t\t\tcallback(collect, collection[i], i, collection);\n\t\t}\n\t\treturn arr;\n\t};\n\n\t/**\n\t * behaves like de-dup, but collect takes a second, 'value' argument.\n\t * returns an object whose keys are the first arguments to collect,\n\t * and values are arrays of all the values passed with that key\n\t */\n\tfunction cluster(collection, callback) {\n\t\tvar o = {};\n\t\tvar collect = function (key, value) {\n\t\t\tif (key in o) {\n\t\t\t\to[key].push(value);\n\t\t\t} else {\n\t\t\t\to[key] = [value];\n\t\t\t}\n\t\t};\n\t\tfor (var i in collection) {\n\t\t\tcallback(collect, collection[i], i);\n\t\t}\n\t\treturn o;\n\t};\n\n\t/**\n\t * returns a version of an object that's safe to JSON,\n\t * and is very conservative\n\t *\n\t *   undefined -> { type: 'undefined', value: undefined }\n\t *   null -> { type: 'undefined', value: null }\n\t *   true -> { type: 'boolean', value: true }\n\t *   4 -> { type: 'number', value: 4 }\n\t *   \"foo\" -> { type: 'string', value: \"foo\" }\n\t *   (function () { }) -> { type: 'object' }\n\t *   { a: \"b\" } -> { type: 'object' }\n\t */\n\tfunction marshalForTransmission(val, maxDepth) {\n\t\tif (maxDepth === undefined) {\n\t\t\tmaxDepth = 1;\n\t\t}\n\n\t\tvar o = { type: typeof(val) };\n\t\tif ([\"undefined\", \"boolean\", \"number\", \"string\"].indexOf(o.type) !== -1 || val === null) {\n\t\t\tif (typeof(val) === \"undefined\" && val !== undefined) {\n\t\t\t\t// special case: document.all claims to be undefined http://stackoverflow.com/questions/10350142/why-is-document-all-falsy\n\t\t\t\to.type = \"object\";\n\t\t\t\to.preview = \"\" + val;\n\t\t\t} else if (val === null) {\n\t\t\t\to.type = \"null\";\n\t\t\t\to.preview = \"null\";\n\t\t\t} else {\n\t\t\t\to.value = val;\n\t\t\t}\n\t\t} else if (o.type === \"object\") {\n\t\t\tvar newDepth = maxDepth - 1;\n\n\t\t\tif (val instanceof Array) {\n\t\t\t\tvar len = val.length;\n\t\t\t\tif (val.__theseusTruncated && val.__theseusTruncated.length) {\n\t\t\t\t\tlen += val.__theseusTruncated.length;\n\t\t\t\t}\n\t\t\t\to.preview = \"[Array:\" + len + \"]\";\n\t\t\t\tnewDepth = maxDepth - 0.5; // count for half\n\t\t\t} else if (typeof(Buffer) === \"function\" && (val instanceof Buffer)) {\n\t\t\t\tvar len = val.length;\n\t\t\t\tif (val.__theseusTruncated && val.__theseusTruncated.length) {\n\t\t\t\t\tlen += val.__theseusTruncated.length;\n\t\t\t\t}\n\t\t\t\to.preview = \"[Buffer:\" + len + \"]\";\n\t\t\t} else {\n\t\t\t\ttry { o.preview = String(val) } catch (e) { o.preview = \"[Object]\" }\n\t\t\t}\n\n\t\t\tif (maxDepth > 0) {\n\t\t\t\to.ownProperties = {};\n\t\t\t\tfor (var key in val) {\n\t\t\t\t\tif (val.hasOwnProperty(key) && !/^__theseus/.test(key)) {\n\t\t\t\t\t\to.ownProperties[key] = marshalForTransmission(val[key], newDepth);\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\n\t\t\tif (\"__theseusTruncated\" in val) {\n\t\t\t\to.truncated = {};\n\t\t\t\tif (\"length\" in val.__theseusTruncated) {\n\t\t\t\t\to.truncated.length = {\n\t\t\t\t\t\tamount: val.__theseusTruncated.length,\n\t\t\t\t\t};\n\t\t\t\t}\n\t\t\t\tif (\"keys\" in val.__theseusTruncated) {\n\t\t\t\t\to.truncated.keys = {\n\t\t\t\t\t\tamount: val.__theseusTruncated.keys,\n\t\t\t\t\t};\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\treturn o;\n\t}\n\n\tfunction scrapeObject(object, depth) {\n\t\tvar MAX_BUFFER_LENGTH = 32;\n\t\tvar MAX_TOTAL_SIZE = 512;\n\n\t\t/**\n\t\tIt's everyone's favorite game: bin packing!\n\n\t\tThere's a big bin: total memory\n\t\tThere's a smaller bin: the memory used by this scraped object\n\t\tThere's smaller bins: the memory used by each child of this scraped object\n\n\t\tOur job is to copy as much useful information we can without overflowing\n\t\tthe big bin (total memory). For now, we pretend that bin is bottomless.\n\n\t\tSo our job is really to copy as much useful information as we can into\n\t\tthe MAX_TOTAL_SIZE \"bytes\" allocated to this scraped object. We do this\n\t\tby performing a deep copy, and any time we encounter an object that's\n\t\tsufficiently large to put us over the limit, we store a reference to it\n\t\tinstead of copying it.\n\n\t\tIn this function, the \"size\" of a copy is approximated by summing the\n\t\tlengths of all strings, the lengths of all keys, and the count of\n\t\tobjects of any other type, ignoring the overhead of array/object storage.\n\t\t**/\n\n\t\t// returns array: [approx size of copy, copy]\n\t\tvar scrape = function (o, depth) {\n\t\t\tif (typeof(o) === \"string\") return [o.length, o]; // don't worry about retaining strings > MAX_TOTAL_SIZE, for now\n\n\t\t\tif (depth <= 0) return [1, o]; // XXX: even if there's a ton there, count it as 1\n\t\t\tif (o === null || typeof(o) !== \"object\") return [1, o];\n\n\t\t\t// return only the first MAX_BUFFER_LENGTH bytes of a Buffer\n\t\t\tif (typeof(Buffer) === \"function\" && (o instanceof Buffer)) {\n\t\t\t\tvar len = Math.min(o.length, MAX_BUFFER_LENGTH);\n\t\t\t\tvar o2 = new Buffer(len);\n\t\t\t\tif (o.length > MAX_BUFFER_LENGTH) {\n\t\t\t\t\to2.__theseusTruncated = { length: o.length - MAX_BUFFER_LENGTH };\n\t\t\t\t}\n\t\t\t\ttry { o.copy(o2, 0, 0, len); } catch (e) { }\n\t\t\t\treturn [len, o2];\n\t\t\t}\n\n\t\t\ttry {\n\t\t\t\tvar size = 0;\n\t\t\t\tvar o2 = (o instanceof Array) ? [] : {};\n\t\t\t\tfor (var key in o) {\n\t\t\t\t\tif ((o.__lookupGetter__ instanceof Function) && o.__lookupGetter__(key))\n\t\t\t\t\t\tcontinue;\n\t\t\t\t\tif (!(o.hasOwnProperty instanceof Function) || !o.hasOwnProperty(key))\n\t\t\t\t\t\tcontinue;\n\t\t\t\t\tvar scraped = scrape(o[key], depth - 1);\n\t\t\t\t\tvar childSize = key.length + scraped[0];\n\t\t\t\t\tif (size + childSize <= MAX_TOTAL_SIZE) {\n\t\t\t\t\t\tsize += childSize;\n\t\t\t\t\t\to2[key] = scraped[1];\n\t\t\t\t\t} else {\n\t\t\t\t\t\t// XXX: if it's an array and this is a numeric key, count it as truncating the length instead\n\t\t\t\t\t\tif (!(\"__theseusTruncated\" in o2)) {\n\t\t\t\t\t\t\to2.__theseusTruncated = { keys: 0 };\n\t\t\t\t\t\t}\n\t\t\t\t\t\to2.__theseusTruncated.keys++;\n\t\t\t\t\t\to2[key] = o[key];\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\treturn [size, o2];\n\t\t\t} catch (e) {\n\t\t\t\t_consoleLog(\"[fondue] couldn't scrape\", o, e);\n\t\t\t\treturn [1, o];\n\t\t\t}\n\t\t};\n\n\t\treturn scrape(object, 1)[1];\n\t}\n\n\tfunction Invocation(info, type) {\n\t\tthis.tick = nextInvocationId++;\n\t\tthis.id = TRACER_ID + \"-\" + this.tick;\n\t\tthis.timestamp = new Date().getTime();\n\t\tthis.type = type;\n\t\tthis.f = nodeById[info.nodeId];\n\t\tthis.childLinks = [];\n\t\tthis.parentLinks = [];\n\t\tthis.returnValue = undefined;\n\t\tthis.exception = undefined;\n\t\tthis.topLevelInvocationId = undefined;\n\t\tthis.epochID = undefined;\n\t\tthis.epochDepth = undefined;\n\t\tthis.arguments = info.arguments ? info.arguments.map(function (a) { return scrapeObject(a) }) : undefined;\n\t\tthis.this = (info.this && info.this !== globalThis) ? scrapeObject(info.this) : undefined;\n\n\t\tinvocationById[this.id] = this;\n\t}\n\tInvocation.prototype.equalToInfo = function (info) {\n\t\treturn this.f.id === info.nodeId;\n\t};\n\tInvocation.prototype.linkToChild = function (child, linkType) {\n\t\tthis.childLinks.push(new InvocationLink(child.id, linkType));\n\t\tchild.parentLinks.push(new InvocationLink(this.id, linkType));\n\t\tif (['call', 'branch-enter'].indexOf(linkType) !== -1) {\n\t\t\tchild.topLevelInvocationId = this.topLevelInvocationId;\n\t\t}\n\t};\n\tInvocation.prototype.getChildren = function (linkFilter) {\n\t\tvar links = this.childLinks;\n\t\tif (linkFilter) {\n\t\t\tlinks = links.filter(linkFilter);\n\t\t}\n\t\treturn links.map(function (link) { return invocationById[link.id]; });\n\t};\n\tInvocation.prototype.getParents = function () {\n\t\treturn this.parentLinks.map(function (link) { return invocationById[link.id]; });\n\t};\n\tInvocation.prototype.getParentLinks = function () {\n\t\treturn this.parentLinks;\n\t};\n\t/**\n\tcalls iter(invocation) for all children in sub-graph; if iter returns true,\n\ttreats that invocation as a leaf and continues\n\t**/\n\tInvocation.prototype.walk = function (iter) {\n\t\tthis.getChildren().forEach(function (child) {\n\t\t\tif (iter(child) !== true) {\n\t\t\t\tchild.walk(iter);\n\t\t\t}\n\t\t});\n\t};\n\n\tfunction InvocationLink(destId, type) {\n\t\tthis.id = destId;\n\t\tthis.type = type;\n\t}\n\n\tfunction Epoch(id, emitterID, eventName) {\n\t\tthis.id = id;\n\t\tthis.emitterID = emitterID;\n\t\tthis.eventName = eventName;\n\t}\n\n\tfunction nextEpoch(emitterID, eventName) {\n\t\tvar epochID = ++_lastEpochID;\n\t\tvar epoch = new Epoch(epochID, emitterID, eventName);\n\t\treturn epoch;\n\t}\n\n\tfunction hit(invocation) {\n\t\tvar id = invocation.f.id;\n\t\tfor (var handle in nodeHitCounts) {\n\t\t\tvar hits = nodeHitCounts[handle];\n\t\t\thits[id] = (hits[id] || 0) + 1;\n\t\t}\n\n\t\t// if this is console.log, we'll want the call site in a moment\n\t\tvar callSite;\n\t\tif (invocation.f.id === \"log\") {\n\t\t\tcallSite = invocation.getParents().filter(function (inv) { return inv.type === \"callsite\" })[0];\n\t\t}\n\n\t\t// add this invocation to all the relevant log queries\n\t\tfor (var handle in _logQueries) {\n\t\t\tvar query = _logQueries[handle];\n\t\t\tif (query.logs && invocation.f.id === \"log\") {\n\t\t\t\tif (callSite) {\n\t\t\t\t\taddLogEntry(handle, callSite.id);\n\t\t\t\t} else {\n\t\t\t\t\t_consoleLog(\"no call site! I needed one!\", invocation.getParents());\n\t\t\t\t}\n\t\t\t}\n\t\t\tif (query.ids && query.ids.indexOf(id) !== -1) {\n\t\t\t\taddLogEntry(handle, invocation.id);\n\t\t\t}\n\t\t}\n\t}\n\n\tfunction calculateHitCounts() {\n\t\tvar hits = {};\n\t\tnodes.forEach(function (n) {\n\t\t\tif (n.id in invocationsByNodeId) {\n\t\t\t\thits[n.id] = invocationsByNodeId[n.id].length;\n\t\t\t}\n\t\t});\n\t\treturn hits;\n\t}\n\n\tfunction calculateExceptionCounts() {\n\t\tvar counts = {};\n\t\tnodes.forEach(function (n) {\n\t\t\tif (n.id in exceptionsByNodeId) {\n\t\t\t\tcounts[n.id] = exceptionsByNodeId[n.id].length;\n\t\t\t}\n\t\t});\n\t\treturn counts;\n\t}\n\n\t/** return ordered list of invocation ids for the given log query */\n\tfunction backlog(query) {\n\t\tvar seenIds = {};\n\t\tvar ids = [];\n\n\t\tfunction addIfUnseen(id) {\n\t\t\tif (!(id in seenIds)) {\n\t\t\t\tids.push(id);\n\t\t\t\tseenIds[id] = true;\n\t\t\t}\n\t\t}\n\n\t\tvar getId = function (invocation) { return invocation.id };\n\n\t\tif (query.ids) {\n\t\t\tquery.ids.forEach(function (nodeId) {\n\t\t\t\tvar invocations = (invocationsByNodeId[nodeId] || []);\n\t\t\t\tinvocations.map(getId).forEach(addIfUnseen);\n\n\t\t\t\t// add logs that are called directly from this function\n\t\t\t\tinvocations.forEach(function (invocation) {\n\t\t\t\t\tinvocation.walk(function (child) {\n\t\t\t\t\t\tvar isFunction = child.type === \"function\";\n\t\t\t\t\t\tif (isFunction && child.f.id === \"log\") {\n\t\t\t\t\t\t\tvar callSite = child.getParents().filter(function (inv) { return inv.type === \"callsite\" })[0];\n\t\t\t\t\t\t\tif (callSite) {\n\t\t\t\t\t\t\t\taddIfUnseen(callSite.id);\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t\treturn isFunction;\n\t\t\t\t\t})\n\t\t\t\t});\n\t\t\t});\n\t\t}\n\n\t\tif (query.eventNames) {\n\t\t\tquery.eventNames.forEach(function (name) {\n\t\t\t\t(_topLevelInvocationsByEventName[name] || []).map(getId).forEach(addIfUnseen);\n\t\t\t});\n\t\t}\n\n\t\tif (query.exceptions) {\n\t\t\tfor (var nodeId in uncaughtExceptionsByNodeId) {\n\t\t\t\tuncaughtExceptionsByNodeId[nodeId].map(function (o) { return o.invocationId }).forEach(addIfUnseen);\n\t\t\t}\n\t\t}\n\n\t\tif (query.logs) {\n\t\t\t(invocationsByNodeId[\"log\"] || []).forEach(function (invocation) {\n\t\t\t\tvar callSite = invocation.getParents().filter(function (inv) { return inv.type === \"callsite\" })[0];\n\t\t\t\tif (callSite) {\n\t\t\t\t\taddIfUnseen(callSite.id);\n\t\t\t\t}\n\t\t\t});\n\t\t}\n\n\t\tids = ids.sort(function (a, b) { return invocationById[a].tick - invocationById[b].tick });\n\t\treturn { entries: ids, seenIds: seenIds };\n\t}\n\n\tfunction addLogEntry(handle, invocationId) {\n\t\tif (!(invocationId in logEntries[handle].seenIds)) {\n\t\t\tlogEntries[handle].entries.push(invocationId);\n\t\t\tlogEntries[handle].seenIds[invocationId] = true;\n\t\t}\n\t}\n\n\n\t// instrumentation\n\n\tfunction bailThisTick(fromNode) {\n\t\t_bailedTick = true;\n\t\tinvocationStack = [];\n\t\t_epochStack = [];\n\t\t_epochInvocationDepth = [];\n\t\tanonFuncParentInvocation = undefined;\n\t\tlastException = undefined;\n\t\tlastExceptionThrownFromInvocation = undefined;\n\n\t\tif (fromNode) {\n\t\t\t_consoleLog(\"[fondue] bailing from \" + (fromNode.name ? (fromNode.name + \" at \") : \"\") + fromNode.path + \" line \" + fromNode.start.line + \", character \" + fromNode.start.column);\n\t\t} else {\n\t\t\t_consoleLog(\"[fondue] bailing! trace collection will resume next tick\");\n\t\t}\n\t\tif (!_explainedBails) {\n\t\t\t_consoleLog(\"[fondue] (fondue is set to automatically bail after {maxInvocationsPerTick} invocations within a single tick. If you are using node-theseus, you can use the --theseus-max-invocations-per-tick=XXX option to raise the limit, but it will require more memory)\");\n\t\t\t_explainedBails = true;\n\t\t}\n\t}\n\n\tfunction endBail() {\n\t\t_bailedTick = false;\n\t\t_invocationsThisTick = 0;\n\n\t\t_consoleLog('[fondue] resuming trace collection after bailed tick');\n\t}\n\n\tfunction pushNewInvocation(info, type) {\n\t\tif (_bailedTick) {\n\t\t\t_invocationStackSize++;\n\t\t\treturn;\n\t\t}\n\n\t\tvar invocation = new Invocation(info, type);\n\t\tpushInvocation(invocation);\n\t\treturn invocation;\n\t}\n\n\tfunction pushInvocation(invocation) {\n\t\t_invocationStackSize++;\n\n\t\tif (_bailedTick) return;\n\n\t\t_invocationsThisTick++;\n\t\tif (_invocationsThisTick === {maxInvocationsPerTick}) {\n\t\t\tbailThisTick(invocation.f);\n\t\t\treturn;\n\t\t}\n\n\t\t// associate with epoch, if there is one\n\t\tif (_epochStack.length > 0) {\n\t\t\tvar epoch = _epochStack[_epochStack.length - 1];\n\t\t\tvar depth = _epochInvocationDepth[_epochInvocationDepth.length - 1];\n\t\t\tinvocation.epochID = epoch.id;\n\t\t\tinvocation.epochDepth = depth;\n\n\t\t\t_epochInvocationDepth[_epochInvocationDepth.length - 1]++;\n\n\t\t\t// hang on to the epoch now that it's part of the call graph\n\t\t\t_epochsById[epoch.id] = epoch;\n\n\t\t\tif (!(epoch.eventName in _epochsByName)) {\n\t\t\t\t_epochsByName[epoch.eventName] = [];\n\t\t\t}\n\t\t\t_epochsByName[epoch.eventName].push(epoch);\n\n\t\t\tif (depth === 0) {\n\t\t\t\tepochTracker.update(epoch);\n\n\t\t\t\tif (!(epoch.eventName in _topLevelEpochsByName)) {\n\t\t\t\t\t_topLevelEpochsByName[epoch.eventName] = [];\n\t\t\t\t\t_topLevelInvocationsByEventName[epoch.eventName] = [];\n\t\t\t\t}\n\t\t\t\t_topLevelEpochsByName[epoch.eventName].push(epoch);\n\t\t\t\t_topLevelInvocationsByEventName[epoch.eventName].push(invocation);\n\n\t\t\t\tfor (var handle in _logQueries) {\n\t\t\t\t\tvar query = _logQueries[handle];\n\t\t\t\t\tif (query.eventNames && query.eventNames.indexOf(epoch.eventName) !== -1) {\n\t\t\t\t\t\taddLogEntry(handle, invocation.id);\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\n\t\t// add to invocationsByNodeId\n\t\tif (!invocationsByNodeId[invocation.f.id]) {\n\t\t\tinvocationsByNodeId[invocation.f.id] = [];\n\t\t}\n\t\tinvocationsByNodeId[invocation.f.id].push(invocation);\n\n\t\t// associate with caller, if there is one; otherwise, save as a top-level invocation\n\t\tvar top = invocationStack[invocationStack.length - 1];\n\t\tif (top) {\n\t\t\ttop.linkToChild(invocation, 'call');\n\t\t} else {\n\t\t\tinvocation.topLevelInvocationId = invocation.id;\n\t\t}\n\n\t\t// associate with the invocation where this anonymous function was created\n\t\tif (anonFuncParentInvocation) {\n\t\t\tanonFuncParentInvocation.linkToChild(invocation, 'async');\n\t\t\tanonFuncParentInvocation = undefined;\n\t\t}\n\n\t\t// update hit counts\n\t\thit(invocation);\n\n\t\tinvocationStack.push(invocation);\n\t}\n\n\tfunction popInvocation(info) {\n\t\t_invocationStackSize--;\n\t\tif (_bailedTick && _invocationStackSize === 0) {\n\t\t\tendBail();\n\t\t\treturn;\n\t\t}\n\n\t\tif (_bailedTick) return;\n\n\t\tvar top = invocationStack.pop();\n\n\t\t// if the tick was bailed or something, there might not be an invocation\n\t\tif (top) {\n\t\t\ttop.endTimestamp = new Date().getTime();\n\t\t\ttop.duration = top.endTimestamp - top.timestamp;\n\n\t\t\t// if there was an exception before, but this function didn't throw\n\t\t\t// it as well, then it must have been caught.\n\t\t\t// only functions track exceptions.\n\t\t\tif (top.type === 'function' && lastException !== undefined && top.exception !== lastException) {\n\t\t\t\t// traceExceptionThrown sets lastException, but this is where we clear it\n\t\t\t\tif (top.exception === undefined) {\n\t\t\t\t\tlastException = undefined;\n\t\t\t\t\tlastExceptionThrownFromInvocation = undefined;\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\n\t\tif (invocationStack.length === 0) {\n\t\t\t// check for uncaught exceptions\n\t\t\tif (lastException !== undefined && lastExceptionThrownFromInvocation !== undefined) {\n\t\t\t\tvar id = lastExceptionThrownFromInvocation.f.id;\n\n\t\t\t\tif (!uncaughtExceptionsByNodeId[id]) {\n\t\t\t\t\tuncaughtExceptionsByNodeId[id] = [];\n\t\t\t\t}\n\t\t\t\tuncaughtExceptionsByNodeId[id].push({ exception: lastException, invocationId: lastExceptionThrownFromInvocation.id });\n\n\t\t\t\tfor (var handle in _logQueries) {\n\t\t\t\t\tif (_logQueries[handle].exceptions) {\n\t\t\t\t\t\t// BUG: we're adding this at the end of the tick, which\n\t\t\t\t\t\t//      means it's technically out-of-order relative to\n\t\t\t\t\t\t//      the other log entries in this tick.\n\t\t\t\t\t\taddLogEntry(handle, lastExceptionThrownFromInvocation.id);\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\n\t\t\t_invocationsThisTick = 0;\n\t\t\tlastException = undefined;\n\t\t\tlastExceptionThrownFromInvocation = undefined;\n\n\t\t\t// make the file call graph for this tick\n\n\t\t\t// if the tick was bailed or something, there might not be an invocation\n\t\t\tif (top) {\n\t\t\t\tfunction makeSubgraph(invocation, node) {\n\t\t\t\t\tif (!node) {\n\t\t\t\t\t\tnode = { path: invocation.f.path, nodeId: invocation.f.id, eventNames: [], children: [] };\n\t\t\t\t\t} else if (node.path !== invocation.f.path) {\n\t\t\t\t\t\tvar parent = node;\n\t\t\t\t\t\tnode = { path: invocation.f.path, nodeId: invocation.f.id, eventNames: [], children: [] };\n\t\t\t\t\t\tparent.children.push(node);\n\t\t\t\t\t}\n\t\t\t\t\tif (invocation.epochID) {\n\t\t\t\t\t\tvar epoch = _epochsById[invocation.epochID];\n\t\t\t\t\t\tif (epoch.eventName !== undefined && node.eventNames.indexOf(epoch.eventName) === -1) {\n\t\t\t\t\t\t\tnode.eventNames.push(epoch.eventName);\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\tinvocation.getChildren(function (link) { return link.type === \"call\" }).forEach(function (child) {\n\t\t\t\t\t\tmakeSubgraph(child, node);\n\t\t\t\t\t});\n\t\t\t\t\treturn node;\n\t\t\t\t}\n\n\t\t\t\tvar item = makeSubgraph(top);\n\t\t\t\t_fileCallGraph.push(item);\n\t\t\t\tfileCallGraphTracker.update(item);\n\t\t\t}\n\t\t}\n\n\t\tif (_epochStack.length > 0) {\n\t\t\t_epochInvocationDepth[_epochInvocationDepth.length - 1]--;\n\t\t}\n\t}\n\n\t/**\n\t * called from the top of every script processed by the rewriter\n\t */\n\tthis.add = function (path, source, options) {\n\t\tsourceByPath[path] = source;\n\t\tnodes.push.apply(nodes, options.nodes);\n\t\toptions.nodes.forEach(function (n) { nodeById[n.id] = n; });\n\n\t\tnodeTracker.update(options.nodes);\n\n\t\t_sendNodes(options.nodes);\n\t};\n\n\tthis.addSourceMap = function (path, mapJSON) {\n\t\t_sourceMaps[path] = _sourceMaps[path + \".fondue\"] = new sourceMap.SourceMapConsumer(mapJSON);\n\t};\n\n\tthis.traceFileEntry = function (info) {\n\t\tpushNewInvocation(info, 'toplevel');\n\t};\n\n\tthis.traceFileExit = function (info) {\n\t\tpopInvocation(info);\n\t};\n\n\tthis.setGlobal = function (gthis) {\n\t\tglobalThis = gthis;\n\t}\n\n\t/**\n\t * the rewriter wraps every anonymous function in a call to traceFunCreate.\n\t * a new function is returned that's associated with the parent invocation.\n\t */\n\tthis.traceFunCreate = function (f, src) {\n\t\tvar creatorInvocation = invocationStack[invocationStack.length - 1];\n\t\tvar creatorInvocationId = creatorInvocation ? creatorInvocation.id : undefined;\n\t\tvar newF;\n\n\t\t// Some code changes its behavior depending on the arity of the callback.\n\t\t// Therefore, we construct a replacement function that has the same arity.\n\t\t// The most direct route seems to be to use eval() (as opposed to\n\t\t// new Function()), so that creatorInvocation can be accessed from the\n\t\t// closure.\n\n\t\tvar arglist = '';\n\t\tfor (var i = 0; i < f.length; i++) {\n\t\t\targlist += (i > 0 ? ', ' : '') + 'v' + i;\n\t\t}\n\n\t\tvar sharedBody = 'return f.apply(this, arguments);';\n\n\t\tif (creatorInvocation) {\n\t\t\t// traceEnter checks anonFuncParentInvocation and creates\n\t\t\t// an edge in the graph from the creator to the new invocation.\n\t\t\t// Look up by ID instead of using creatorInvocation directly in case\n\t\t\t// the trace has been cleared and the original invocation no longer\n\t\t\t// exists.\n\t\t\tvar asyncBody = 'anonFuncParentInvocation = invocationById[creatorInvocationId];';\n\t\t\tvar newSrc = '(function (' + arglist + ') { ' + asyncBody + sharedBody + '})';\n\t\t\tnewF = eval(newSrc);\n\t\t} else {\n\t\t\tvar newSrc = '(function (' + arglist + ') { ' + sharedBody + '})';\n\t\t\tnewF = eval(newSrc);\n\t\t}\n\t\tnewF.toString = function () { return src };\n\t\treturn newF;\n\t};\n\n\t/** helper for traceFunCall below */\n\tvar _traceLogCall = function (info) {\n\t\tvar queryMatchesInvocation = function (handle, invocation) {\n\t\t\tvar query = _logQueries[handle];\n\t\t\tvar epoch = _epochsById[invocation.epochID];\n\t\t\tif (query.logs && invocation.f.id === \"log\") {\n\t\t\t\treturn true;\n\t\t\t} else if (query.exceptions && invocation.exception) {\n\t\t\t\treturn true;\n\t\t\t} else if (query.ids && query.ids.indexOf(invocation.f.id) !== -1) {\n\t\t\t\treturn true;\n\t\t\t} else if (query.eventNames && epoch && query.eventNames.indexOf(epoch.eventName) !== -1) {\n\t\t\t\treturn true;\n\t\t\t}\n\t\t\treturn false;\n\t\t};\n\t\tvar matchingQueryHandles = function (invocation) {\n\t\t\treturn Object.keys(_logQueries).filter(function (handle) {\n\t\t\t\treturn queryMatchesInvocation(handle, invocation);\n\t\t\t});\n\t\t};\n\n\t\treturn function () {\n\t\t\t_consoleLog.apply(console, arguments);\n\n\t\t\tvar callerInvocation = invocationStack[invocationStack.length - 1];\n\n\t\t\tinfo.arguments = Array.prototype.slice.apply(arguments); // XXX: mutating info may not be okay, but we want the arguments\n\n\t\t\tvar callSiteInvocation = pushNewInvocation(info, 'callsite');\n\t\t\tpushNewInvocation({ nodeId: \"log\", arguments: info.arguments }, 'function');\n\t\t\tpopInvocation();\n\t\t\tpopInvocation();\n\n\t\t\t// if called directly from an invocation that's in the query, add\n\t\t\t// this log statement invocation as well\n\t\t\t// (callSiteInvocation might be falsy if this tick was bailed)\n\t\t\tif (callerInvocation && callSiteInvocation) {\n\t\t\t\tmatchingQueryHandles(callerInvocation).forEach(function (handle) {\n\t\t\t\t\taddLogEntry(handle, callSiteInvocation.id);\n\t\t\t\t});\n\t\t\t}\n\t\t}\n\t};\n\n\t/**\n\t * the rewriter wraps the callee portion of every function call with a call\n\t * to traceFunCall like this:\n\t *\n\t *   a.b('foo') -> (traceFunCall({ this: a, property: 'b', nodeId: '...', vars: {}))('foo')\n\t *   b('foo') -> (traceFunCall({ func: b, nodeId: '...', vars: {}))('foo')\n\t */\n\tthis.traceFunCall = function (info) {\n\t\tvar customThis = false, fthis, func;\n\n\t\tif ('func' in info) {\n\t\t\tfunc = info.func;\n\t\t} else {\n\t\t\tcustomThis = true;\n\t\t\tfthis = info.this;\n\t\t\tfunc = fthis[info.property];\n\t\t}\n\n\t\t// if it doesn't look like a function, it's faster not to wrap it with\n\t\t// all of the cruft below\n\t\tif (!func) {\n\t\t\treturn func;\n\t\t}\n\n\t\tif (typeof console !== 'undefined') {\n\t\t\tvar logFunctions = [console.log, console.info, console.warn, console.error, console.trace];\n\t\t\tif (logFunctions.indexOf(func) !== -1) {\n\t\t\t\treturn _traceLogCall(info);\n\t\t\t}\n\t\t}\n\n\t\treturn function () {\n\t\t\tinfo.arguments = Array.prototype.slice.apply(arguments); // XXX: mutating info may not be okay, but we want the arguments\n\t\t\tvar invocation = pushNewInvocation(info, 'callsite');\n\n\t\t\ttry {\n\t\t\t\t// this used to be func.apply(t, arguments), but not all functions\n\t\t\t\t// have apply. so we apply Function.apply instead.\n\t\t\t\tvar t = customThis ? fthis : this;\n\t\t\t\treturn Function.apply.apply(func, [t].concat(arguments));\n\t\t\t} finally {\n\t\t\t\tpopInvocation();\n\t\t\t}\n\t\t}\n\t};\n\n\t/**\n\t * the rewriter calls traceEnter from just before the try clause it wraps\n\t * function bodies in. info is an object like:\n\t *\n\t *   {\n\t *     start: { line: ..., column: ... },\n\t *     end: { line: ..., column: ... },\n\t *     vars: { a: a, b: b, ... }\n\t *   }\n\t */\n\tthis.traceEnter = function (info) {\n\t\tpushNewInvocation(info, 'function');\n\t};\n\n\t/**\n\t * the rewriter calls traceExit from the finally clause it wraps function\n\t * bodies in. info is an object like:\n\t *\n\t *   {\n\t *     start: { line: ..., column: ... },\n\t *     end: { line: ..., column: ... }\n\t *   }\n\t *\n\t * in the future, traceExit will be passed an object with all the\n\t * local variables of the instrumented function.\n\t */\n\tthis.traceExit = function (info) {\n\t\tpopInvocation(info);\n\t};\n\n\tthis.traceReturnValue = function (value) {\n\t\tif (_bailedTick) return value;\n\n\t\tvar top = invocationStack[invocationStack.length - 1];\n\t\tif (!top) {\n\t\t\tthrow new Error('value returned with nothing on the stack');\n\t\t}\n\t\ttop.returnValue = scrapeObject(value);\n\t\treturn value;\n\t}\n\n\t/**\n\t * the rewriter calls traceExceptionThrown from the catch clause it wraps\n\t * function bodies in. info is an object like:\n\t *\n\t *   {\n\t *     start: { line: ..., column: ... },\n\t *     end: { line: ..., column: ... }\n\t *   }\n\t */\n\tthis.traceExceptionThrown = function (info, exception) {\n\t\tif (_bailedTick) return;\n\n\t\tlastException = exception;\n\n\t\tvar parsedStack;\n\t\tif (exception.stack) {\n\t\t\tvar mapFrame = function (frame) {\n\t\t\t\tif (frame.path in _sourceMaps) {\n\t\t\t\t\tvar pos = _sourceMaps[frame.path].originalPositionFor({ line: frame.line, column: frame.column });\n\t\t\t\t\tframe.path = pos.source;\n\t\t\t\t\tframe.line = pos.line;\n\t\t\t\t\tframe.column = pos.column;\n\t\t\t\t}\n\t\t\t\treturn frame;\n\t\t\t};\n\n\t\t\tvar shouldIgnoreFrame = function (frame) {\n\t\t\t\treturn /node-theseus\\.js/.test(frame.path) || /^Module\\.(load|_compile)$/.test(frame.at);\n\t\t\t};\n\n\t\t\tparsedStack = [];\n\t\t\tvar match, match2,\n\t\t\t\twholeMatchRegexp = /\\n    at ([^(]+) \\((.*):(\\d+):(\\d+)\\)/g; // TODO: match lines without column numbers\n\t\t\t\tpartialMatchRegexp = /at ([^(]+) \\((.*):(\\d+):(\\d+)\\)/g;\n\t\t\twhile (match = wholeMatchRegexp.exec(exception.stack)) {\n\t\t\t\tvar frame = mapFrame({\n\t\t\t\t\tat: match[1],\n\t\t\t\t\tpath: match[2],\n\t\t\t\t\tline: parseInt(match[3]),\n\t\t\t\t\tcolumn: parseInt(match[4]),\n\t\t\t\t});\n\t\t\t\tif (/^eval at /.test(match[2]) && (match2 = partialMatchRegexp.exec(match[2]))) {\n\t\t\t\t\tframe.evalFrame = mapFrame({\n\t\t\t\t\t\tat: match2[1],\n\t\t\t\t\t\tpath: match2[2],\n\t\t\t\t\t\tline: parseInt(match2[3]),\n\t\t\t\t\t\tcolumn: parseInt(match2[4]),\n\t\t\t\t\t});\n\t\t\t\t}\n\t\t\t\tif (!shouldIgnoreFrame(frame) && (!frame.evalFrame || !shouldIgnoreFrame(frame.evalFrame))) {\n\t\t\t\t\tparsedStack.push(frame);\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\n\t\tvar top = invocationStack[invocationStack.length - 1];\n\t\tif (!top || !top.equalToInfo(info)) {\n\t\t\tthrow new Error('exception thrown from a non-matching enter');\n\t\t}\n\t\ttop.exception = exception;\n\t\ttop.rawStack = exception.stack;\n\t\tif (parsedStack) top.exceptionStack = parsedStack;\n\n\t\tif (lastExceptionThrownFromInvocation === undefined) {\n\t\t\tlastExceptionThrownFromInvocation = top;\n\t\t}\n\n\t\tvar id = top.f.id;\n\t\tif (!exceptionsByNodeId[id]) {\n\t\t\texceptionsByNodeId[id] = [];\n\t\t}\n\t\texceptionsByNodeId[id].push({ exception: exception, invocationId: top.id });\n\n\t\tfor (var handle in exceptionCounts) {\n\t\t\tvar hits = exceptionCounts[handle];\n\t\t\thits[id] = (hits[id] || 0) + 1;\n\t\t}\n\t};\n\n\t/** cease collecting trace information until the next tick **/\n\tthis.bailThisTick = bailThisTick;\n\n\tthis.pushEpoch = function (epoch) {\n\t\t_epochStack.push(epoch);\n\t\t_epochInvocationDepth.push(0);\n\t};\n\n\tthis.popEpoch = function () {\n\t\t_epochStack.pop();\n\t\t_epochInvocationDepth.pop();\n\t}\n\n\tif ({nodejs}) {\n\t\tif (typeof require !== 'undefined') {\n\t\t\t// override EventEmitter.emit() to automatically begin epochs when events are thrown\n\t\t\tvar EventEmitter = require('events').EventEmitter;\n\t\t\tvar oldEmit = EventEmitter.prototype.emit;\n\t\t\tEventEmitter.prototype.emit = function (ev) {\n\t\t\t\t// give this emitter an identifier if it doesn't already have one\n\t\t\t\tif (!this._emitterID) {\n\t\t\t\t\tthis._emitterID = ++_lastEmitterID;\n\t\t\t\t}\n\n\t\t\t\t// start an epoch & emit the event\n\t\t\t\tvar epoch = nextEpoch(this._emitterID, ev);\n\t\t\t\t{name}.pushEpoch(epoch);\n\t\t\t\ttry {\n\t\t\t\t\treturn oldEmit.apply(this, arguments);\n\t\t\t\t} finally {\n\t\t\t\t\t{name}.popEpoch();\n\t\t\t\t}\n\t\t\t};\n\t\t}\n\t}\n\n\tthis.augmentjQuery = function ($) {\n\t\tvar trigger = $.event.trigger, triggerHandler = $.event.triggerHandler;\n\t\tvar core_hasOwn = {}.hasOwnProperty;\n\t\t$.event.trigger = function (event) {\n\t\t\tvar type = core_hasOwn.call(event, \"type\") ? event.type : event;\n\t\t\tvar epoch = nextEpoch(-1 /* emitterID */, type);\n\n\t\t\t{name}.pushEpoch(epoch);\n\t\t\ttry {\n\t\t\t\treturn trigger.apply($.event, arguments);\n\t\t\t} finally {\n\t\t\t\t{name}.popEpoch();\n\t\t\t}\n\t\t};\n\t\t$.event.triggerHandler = function (event) {\n\t\t\tvar type = core_hasOwn.call(event, \"type\") ? event.type : event;\n\t\t\tvar epoch = nextEpoch(-1 /* emitterID */, type);\n\n\t\t\t{name}.pushEpoch(epoch);\n\t\t\ttry {\n\t\t\t\treturn triggerHandler.apply($.event, arguments);\n\t\t\t} finally {\n\t\t\t\t{name}.popEpoch();\n\t\t\t}\n\t\t};\n\t};\n\n\n\t// remote prebuggin' (from Brackets)\n\n\tvar _sendNodes = function (nodes) {\n\t\tif (_connected) {\n\t\t\t_sendBracketsMessage('scripts-added', JSON.stringify({ nodes: nodes }));\n\t\t}\n\t};\n\n\tfunction _sendBracketsMessage(name, value) {\n\t\tvar key = \"data-{name}-\" + name;\n\t\tdocument.body.setAttribute(key, value);\n\t\twindow.setTimeout(function () { document.body.removeAttribute(key); });\n\t}\n\n\tthis.version = function () {\n\t\treturn {version};\n\t};\n\n\t// deprecated\n\tthis.connect = function () {\n\t\tif (typeof console !== 'undefined') _consoleLog(\"Opening the Developer Console will break the connection with Brackets!\");\n\t\t_connected = true;\n\t\t_sendNodes(nodes);\n\t\treturn this;\n\t};\n\n\tthis.resetTrace = _resetTrace;\n\n\t// accessors\n\n\t// this is mostly here for unit tests, and not necessary or encouraged\n\t// use trackNodes instead\n\tthis.nodes = function () {\n\t\treturn nodes;\n\t};\n\n\tthis.trackNodes = function () {\n\t\treturn nodeTracker.track();\n\t};\n\n\tthis.untrackNodes = function (handle) {\n\t\treturn nodeTracker.untrack(handle);\n\t};\n\n\tthis.newNodes = function (handle) {\n\t\treturn nodeTracker.delta(handle);\n\t};\n\n\tthis.trackHits = function () {\n\t\tvar handle = _hitQueries.push(true) - 1;\n\t\tnodeHitCounts[handle] = calculateHitCounts();\n\t\treturn handle;\n\t};\n\n\tthis.trackExceptions = function () {\n\t\tvar handle = _exceptionQueries.push(true) - 1;\n\t\texceptionCounts[handle] = calculateExceptionCounts();\n\t\treturn handle;\n\t};\n\n\tthis.trackLogs = function (query) {\n\t\tvar handle = _logQueries.push(query) - 1;\n\t\tlogEntries[handle] = backlog(query);\n\t\treturn handle;\n\t};\n\n\tthis.trackEpochs = function () {\n\t\treturn epochTracker.track();\n\t};\n\n\tthis.untrackEpochs = function (handle) {\n\t\treturn epochTracker.untrack(handle);\n\t};\n\n\tthis.trackFileCallGraph = function () {\n\t\treturn fileCallGraphTracker.track();\n\t};\n\n\tthis.untrackFileCallGraph = function (handle) {\n\t\treturn fileCallGraphTracker.untrack(handle);\n\t};\n\n\tthis.fileCallGraphDelta = function (handle) {\n\t\treturn fileCallGraphTracker.delta(handle);\n\t};\n\n\tthis.hitCountDeltas = function (handle) {\n\t\tif (!(handle in _hitQueries)) {\n\t\t\tthrow new Error(\"unrecognized query\");\n\t\t}\n\t\tvar result = nodeHitCounts[handle];\n\t\tnodeHitCounts[handle] = {};\n\t\treturn result;\n\t};\n\n\tthis.newExceptions = function (handle) {\n\t\tif (!(handle in _exceptionQueries)) {\n\t\t\tthrow new Error(\"unrecognized query\");\n\t\t}\n\t\tvar result = exceptionCounts[handle];\n\t\texceptionCounts[handle] = {};\n\t\treturn { counts: result };\n\t};\n\n\tthis.epochDelta = function (handle) {\n\t\treturn epochTracker.delta(handle);\n\t};\n\n\t// okay, the second argument is kind of a hack\n\tfunction makeLogEntry(invocation, parents) {\n\t\tparents = (parents || []);\n\t\tvar entry = {\n\t\t\ttimestamp: invocation.timestamp,\n\t\t\ttick: invocation.tick,\n\t\t\tinvocationId: invocation.id,\n\t\t\ttopLevelInvocationId: invocation.topLevelInvocationId,\n\t\t\tnodeId: invocation.f.id,\n\t\t};\n\t\tif (invocation.epochID !== undefined) {\n\t\t\tvar epoch = _epochsById[invocation.epochID];\n\t\t\tentry.epoch = {\n\t\t\t\tid: epoch.id,\n\t\t\t\temitterID: epoch.emitterID,\n\t\t\t\teventName: epoch.eventName,\n\t\t\t};\n\t\t\tentry.epochDepth = invocation.epochDepth;\n\t\t}\n\t\tif (invocation.returnValue !== undefined) {\n\t\t\tentry.returnValue = marshalForTransmission(invocation.returnValue);\n\t\t}\n\t\tif (invocation.exception !== undefined) {\n\t\t\tentry.exception = marshalForTransmission(invocation.exception);\n\t\t}\n\t\tif (invocation.f.params || invocation.arguments) {\n\t\t\tentry.arguments = [];\n\t\t\tvar params = invocation.f.params || [];\n\t\t\tfor (var i = 0; i < params.length; i++) {\n\t\t\t\tvar param = params[i];\n\t\t\t\tentry.arguments.push({\n\t\t\t\t\tname: param.name,\n\t\t\t\t\tvalue: marshalForTransmission(invocation.arguments[i]),\n\t\t\t\t});\n\t\t\t}\n\t\t\tfor (var i = params.length; i < invocation.arguments.length; i++) {\n\t\t\t\tentry.arguments.push({\n\t\t\t\t\tvalue: marshalForTransmission(invocation.arguments[i]),\n\t\t\t\t});\n\t\t\t}\n\t\t}\n\t\tif (invocation.this !== undefined) {\n\t\t\tentry.this = marshalForTransmission(invocation.this);\n\t\t}\n\t\tif (parents.length > 0) {\n\t\t\tentry.parents = parents;\n\t\t}\n\t\treturn entry;\n\t}\n\n\tthis.logCount = function (handle) {\n\t\tif (!(handle in _logQueries)) {\n\t\t\tthrow new Error(\"unrecognized query\");\n\t\t}\n\n\t\treturn logEntries[handle].entries.length;\n\t};\n\n\tthis.logDelta = function (handle, maxResults) {\n\t\tif (!(handle in _logQueries)) {\n\t\t\tthrow new Error(\"unrecognized query\");\n\t\t}\n\n\t\tmaxResults = maxResults || 10;\n\n\t\tvar ids = logEntries[handle].entries.splice(0, maxResults);\n\t\tvar results = ids.map(function (invocationId, i) {\n\t\t\tvar invocation = invocationById[invocationId];\n\t\t\treturn makeLogEntry(invocation, findParentsInQuery(invocation, _logQueries[handle]));\n\t\t});\n\n\t\treturn results;\n\t};\n\n\tthis.backtrace = function (options) {\n\t\toptions = mergeInto(options, {\n\t\t\trange: [0, 10],\n\t\t});\n\n\t\tvar invocation = invocationById[options.invocationId];\n\t\tif (!invocation) {\n\t\t\tthrow new Error(\"invocation not found\");\n\t\t}\n\n\t\tvar stack = [];\n\t\tif (options.range[0] <= 0) {\n\t\t\tstack.push(invocation);\n\t\t}\n\n\t\tfunction search(invocation, depth) {\n\t\t\t// stop if we're too deep\n\t\t\tif (depth+1 >= options.range[1]) {\n\t\t\t\treturn;\n\t\t\t}\n\n\t\t\tvar callers = findCallers(invocation);\n\t\t\tvar directCallers = callers.filter(function (c) { return c.type === \"call\" })\n\t\t\tvar caller = directCallers[0];\n\n\t\t\tif (caller) {\n\t\t\t\tvar parent = invocationById[caller.invocationId];\n\t\t\t\tif (options.range[0] <= depth+1) {\n\t\t\t\t\tstack.push(parent);\n\t\t\t\t}\n\t\t\t\tsearch(parent, depth + 1);\n\t\t\t}\n\t\t}\n\t\tsearch(invocation, 0);\n\t\tvar results = stack.map(function (invocation) {\n\t\t\treturn makeLogEntry(invocation);\n\t\t});\n\t\treturn results;\n\t};\n\n\tfunction findParentsInQuery(invocation, query) {\n\t\tif (!query.ids || query.ids.length === 0) {\n\t\t\treturn [];\n\t\t}\n\n\t\tvar matches = {}; // invocation id -> link\n\t\tvar seen = {}; // invocation id -> true\n\t\tvar types = ['async', 'call', 'branch-enter']; // in priority order\n\t\tfunction promoteType(type, newType) {\n\t\t\tif (types.indexOf(type) === -1 || types.indexOf(newType) === -1) {\n\t\t\t\tthrow new Exception(\"invocation link type not known\")\n\t\t\t}\n\t\t\tif (types.indexOf(newType) < types.indexOf(type)) {\n\t\t\t\treturn newType;\n\t\t\t}\n\t\t\treturn type;\n\t\t}\n\t\tfunction search(link, type) {\n\t\t\tif (link.id in seen) {\n\t\t\t\treturn;\n\t\t\t}\n\t\t\tseen[link.id] = true;\n\n\t\t\tvar targetInvocation = invocationById[link.id];\n\t\t\tif (query.ids.indexOf(targetInvocation.f.id) !== -1) { // if the called function is in the query\n\t\t\t\tif (link.id in matches) { // if we've already found this one\n\t\t\t\t\tif (link.type === 'call' && matches[link.id].type === 'async') { // if we found an async one before but this one is synchronous\n\t\t\t\t\t\t// overwrite the previous match\n\t\t\t\t\t\tmatches[link.id] = {\n\t\t\t\t\t\t\tinvocationId: link.id,\n\t\t\t\t\t\t\ttype: type,\n\t\t\t\t\t\t\tinbetween: []\n\t\t\t\t\t\t};\n\t\t\t\t\t}\n\t\t\t\t} else { // if we haven't found this link before, store it\n\t\t\t\t\tmatches[link.id] = {\n\t\t\t\t\t\tinvocationId: link.id,\n\t\t\t\t\t\ttype: type,\n\t\t\t\t\t\tinbetween: []\n\t\t\t\t\t};\n\t\t\t\t}\n\t\t\t} else {\n\t\t\t\ttargetInvocation.getParentLinks().forEach(function (link) { search(link, promoteType(type, link.type)); });\n\t\t\t}\n\t\t}\n\t\tinvocation.getParentLinks().forEach(function (link) { search(link, link.type); });\n\n\t\t// convert matches to an array\n\t\tvar matchesArr = [];\n\t\tfor (var id in matches) {\n\t\t\tmatchesArr.push(matches[id]);\n\t\t}\n\t\treturn matchesArr;\n\t}\n\n\tfunction findCallers(invocation) {\n\t\tvar matches = {}; // invocation id -> link\n\t\tvar seen = {}; // invocation id -> true\n\t\tvar types = ['async', 'call', 'branch-enter']; // in priority order\n\t\tfunction promoteType(type, newType) {\n\t\t\tif (types.indexOf(type) === -1 || types.indexOf(newType) === -1) {\n\t\t\t\tthrow new Exception(\"invocation link type not known\")\n\t\t\t}\n\t\t\tif (types.indexOf(newType) < types.indexOf(type)) {\n\t\t\t\treturn newType;\n\t\t\t}\n\t\t\treturn type;\n\t\t}\n\t\tfunction search(link, type) {\n\t\t\tif (link.id in seen) {\n\t\t\t\treturn;\n\t\t\t}\n\t\t\tseen[link.id] = true;\n\n\t\t\tif (invocationById[link.id].f.type === \"function\") {\n\t\t\t\tif (link.id in matches) {\n\t\t\t\t\tif (link.type === 'call' && matches[link.id].type === 'async') {\n\t\t\t\t\t\tmatches[link.id] = {\n\t\t\t\t\t\t\tinvocationId: link.id,\n\t\t\t\t\t\t\ttype: type,\n\t\t\t\t\t\t};\n\t\t\t\t\t}\n\t\t\t\t} else {\n\t\t\t\t\tmatches[link.id] = {\n\t\t\t\t\t\tinvocationId: link.id,\n\t\t\t\t\t\ttype: type,\n\t\t\t\t\t};\n\t\t\t\t}\n\t\t\t\treturn; // search no more down this path\n\t\t\t}\n\t\t\tinvocationById[link.id].getParentLinks().forEach(function (link) { search(link, promoteType(type, link.type)); });\n\t\t}\n\t\tinvocation.getParentLinks().forEach(function (link) { search(link, link.type); });\n\n\t\t// convert matches to an array\n\t\tvar matchesArr = [];\n\t\tfor (var id in matches) {\n\t\t\tmatchesArr.push(matches[id]);\n\t\t}\n\t\treturn matchesArr;\n\t}\n\n\tthis.Array = Array;\n});\n}\n(function () { {name}.setGlobal(this); })();\n";
        return template(tracerSource, {
            name: options.name,
            version: JSON.stringify(require('./package.json').version),
            nodejs: options.nodejs,
            maxInvocationsPerTick: options.maxInvocationsPerTick,
        });
    }
    
    // uses the surrounding code to generate a reasonable name for a function
    function concoctFunctionName(node) {
        var name = undefined;
    
        if (node.type === 'FunctionDeclaration') {
            // function xxx() { }
            //  -> "xxx"
            name = node.id.name;
        } else if (node.type === 'FunctionExpression') {
            if (node.id) {
                // (function xxx() { })
                //  -> "xxx"
                name = node.id.name;
            } else if (node.parent.type === 'VariableDeclarator') {
                // var xxx = function () { }
                //  -> "xxx"
                name = node.parent.id.name;
            } else if (node.parent.type === 'AssignmentExpression') {
                var left = node.parent.left;
                if (left.type === 'MemberExpression' && !left.computed) {
                    if (left.object.type === 'MemberExpression' && !left.object.computed) {
                        if (left.object.property.type === 'Identifier' && left.object.property.name === 'prototype') {
                            // yyy.prototype.xxx = function () { }
                            //  -> "yyy.xxx"
                            name = left.object.object.name + '.' + left.property.name;
                        }
                    }
                }
            } else if (node.parent.type === 'CallExpression') {
                // look, I know this is a regexp, I'm just sick of parsing ASTs
                if (/\.on$/.test(node.parent.callee.source())) {
                    var args = node.parent.arguments;
                    if (args[0].type === 'Literal' && typeof args[0].value === 'string') {
                        // .on('event', function () { })
                        //  -> "('event' handler)"
                        name = "('" + args[0].value + "' handler)";
                    }
                } else if (node.parent.callee.type === 'Identifier') {
                    if (['setTimeout', 'setInterval'].indexOf(node.parent.callee.name) !== -1) {
                        // setTimeout(function () { }, xxx)
                        // setInterval(function () { }, xxx)
                        //  -> "timer handler"
                        name = 'timer handler';
                        if (node.parent.arguments[1] && node.parent.arguments[1].type === 'Literal' && typeof node.parent.arguments[1].value === 'number') {
                            // setTimeout(function () { }, 100)
                            // setInterval(function () { }, 1500)
                            //  -> "timer handler (100ms)"
                            //  -> "timer handler (1.5s)"
                            if (node.parent.arguments[1].value < 1000) {
                                name += ' (' + node.parent.arguments[1].value + 'ms)';
                            } else {
                                name += ' (' + (node.parent.arguments[1].value / 1000) + 's)';
                            }
                        }
                        name = '(' + name + ')';
                    } else {
                        // xxx(function () { })
                        //  -> "('xxx' callback)"
                        name = "('" + node.parent.callee.source() + "' callback)";
                    }
                } else if (node.parent.callee.type === 'MemberExpression') {
                    if (node.parent.callee.property.type === 'Identifier') {
                        // xxx.yyy(..., function () { }, ...)
                        //  -> "('yyy' callback)"
                        name = "('" + node.parent.callee.property.name + "' callback)";
                    }
                }
            } else if (node.parent.type === 'Property') {
                // { xxx: function () { } }
                //  -> "xxx"
                name = node.parent.key.name || node.parent.key.value;
                if (name !== undefined) {
                    if (node.parent.parent.type === 'ObjectExpression') {
                        var obj = node.parent.parent;
                        if (obj.parent.type === 'VariableDeclarator') {
                            // var yyy = { xxx: function () { } }
                            //  -> "yyy.xxx"
                            name = obj.parent.id.name + '.' + name;
                        } else if(obj.parent.type === 'AssignmentExpression') {
                            var left = obj.parent.left;
                            if (left.type === 'MemberExpression' && !left.computed) {
                                if (left.object.type === 'Identifier' && left.property.name === 'prototype') {
                                    // yyy.prototype = { xxx: function () { } }
                                    //  -> "yyy.xxx"
                                    name = left.object.name + '.' + name;
                                }
                            }
                        }
                    }
                }
            }
        }
    
        return name;
    }
    
    function traceFilter(src, options) {
        options = mergeInto(options, {
            path: '<anonymous>',
            prefix: '',
            tracer_name: '__tracer',
            source_map: false,
            throw_parse_errors: false,
        });
    
        try {
            var nodes = [];
            var functionSources = {};
    
            // some code looks at the source code for callback functions and does
            // different things depending on what it finds. since fondue wraps all
            // anonymous functions, we need to capture the original source code for
            // those functions so that we can return it from the wrapper function's
            // toString.
            falafel(src, { locations: true }, eselector.tester([
                {
                    selector: '.function',
                    callback: function (node) {
                        var id = makeId('function', options.path, node.loc);
                        functionSources[id] = node.source();
                    },
                }
            ]));
    
            // instrument the source code
            var instrumentedSrc = falafel(src, { locations: true }, helpers.wrap(eselector.tester([
                {
                    selector: 'program',
                    callback: function (node) {
                        var id = makeId('toplevel', options.path, node.loc);
                        nodes.push({
                            path: options.path,
                            start: node.loc.start,
                            end: node.loc.end,
                            id: id,
                            type: 'toplevel',
                            name: '(' + basename(options.path) + ' toplevel)',
                        });
                        traceFileEntry(node, id);
                    }
                },
                {
                    selector: '.function > block',
                    callback: function (node) {
                        var id = makeId('function', options.path, node.parent.loc);
                        var params = node.parent.params.map(function (param) {
                            return { name: param.name, start: param.loc.start, end: param.loc.end };
                        });
                        nodes.push({
                            path: options.path,
                            start: node.parent.loc.start,
                            end: node.parent.loc.end,
                            id: id,
                            type: 'function',
                            name: concoctFunctionName(node.parent),
                            params: params,
                        });
                        traceEntry(node, id, [
                            'arguments: ' + options.tracer_name + '.Array.prototype.slice.apply(arguments)',
                            'this: this',
                        ]);
                    },
                },
                {
                    selector: 'expression.function',
                    callback: function (node) {
                        if (node.parent.type !== 'Property' || node.parent.kind === 'init') {
                            var id = makeId('function', options.path, node.loc);
                            node.wrap(options.tracer_name + '.traceFunCreate(', ', ' + JSON.stringify(functionSources[id]) + ')')
                        }
                    },
                },
                {
                    selector: '.call',
                    callback: function (node) {
                        var id = makeId('callsite', options.path, node.loc);
                        var nameLoc = (node.callee.type === 'MemberExpression') ? node.callee.property.loc : node.callee.loc;
                        nodes.push({
                            path: options.path,
                            start: node.loc.start,
                            end: node.loc.end,
                            id: id,
                            type: 'callsite',
                            name: node.callee.source(),
                            nameStart: nameLoc.start,
                            nameEnd: nameLoc.end,
                        });
                        if (node.callee.source() === "eval") {
                            if (node.arguments.length === 1 && node.arguments[0].type === 'Literal' && typeof(node.arguments[0].value) === 'string') {
                                var path = '<anonymous>';
                                var m = /\/\/# sourceURL=([^\s]+)/.exec(node.arguments[0].value);
                                if (m) {
                                    path = m[1];
                                }
                                path = options.path + '-eval-' + path;
    
                                var suboptions = JSON.parse(JSON.stringify(options));
                                suboptions.path = path;
                                var instrumentedEvalSource = traceFilter(node.arguments[0].value, suboptions);
                                node.arguments[0].update(JSON.stringify(String(instrumentedEvalSource)))
                            }
                        } else if (node.callee.source() !== "require") {
                            if (node.callee.type === 'MemberExpression') {
                                if (node.callee.computed) {
                                    node.callee.update(' ', options.tracer_name, '.traceFunCall({ this: ', node.callee.object.source(), ', property: ', node.callee.property.source(), ', nodeId: ', JSON.stringify(id), ' })');
                                } else {
                                    node.callee.update(' ', options.tracer_name, '.traceFunCall({ this: ', node.callee.object.source(), ', property: "', node.callee.property.source(), '", nodeId: ', JSON.stringify(id), ' })');
                                }
                            } else {
                                node.callee.wrap(options.tracer_name + '.traceFunCall({ func: (', '), nodeId: ' + JSON.stringify(id) + '})');
                            }
                        }
                    },
                },
            ])));
    
            var prologue = options.prefix;
            prologue += template("/*\nThe following code has been modified by fondue to collect information about its\nexecution.\n\nhttps://github.com/adobe-research/fondue\n*/\n\nif (typeof {name} === 'undefined') {\n\t{name} = {};\n\tvar methods = [\"add\", \"addSourceMap\", \"traceFileEntry\", \"traceFileExit\", \"setGlobal\", \"traceFunCreate\", \"traceEnter\", \"traceExit\", \"traceReturnValue\", \"traceExceptionThrown\", \"bailThisTick\", \"pushEpoch\", \"popEpoch\", \"augmentjQuery\", \"version\", \"connect\", \"nodes\", \"trackNodes\", \"untrackNodes\", \"newNodes\", \"trackHits\", \"trackExceptions\", \"trackLogs\", \"trackEpochs\", \"untrackEpochs\", \"trackFileCallGraph\", \"untrackFileCallGraph\", \"fileCallGraphDelta\", \"hitCountDeltas\", \"newExceptions\", \"epochDelta\", \"logCount\", \"logDelta\", \"backtrace\"];\n\tfor (var i = 0; i < methods.length; i++) {\n\t\t{name}[methods[i]] = function () { return arguments[0] };\n\t}\n\n\t{name}.traceFunCall = function (info) {\n\t\tvar customThis = false, fthis, func;\n\n\t\tif ('func' in info) {\n\t\t\tfunc = info.func;\n\t\t} else {\n\t\t\tcustomThis = true;\n\t\t\tfthis = info.this;\n\t\t\tfunc = fthis[info.property];\n\t\t}\n\n\t\treturn function () {\n\t\t\treturn func.apply(customThis ? fthis : this, arguments);\n\t\t};\n\t};\n\n\t{name}.Array = Array;\n}\n", { name: options.tracer_name });
            if (options.source_map) prologue += '/*mapshere*/';
            prologue += options.tracer_name + '.add(' + JSON.stringify(options.path) + ', ' + JSON.stringify(src) + ', { nodes: ' + JSON.stringify(nodes) + ' });\n\n';
    
            return {
                map: function () { return '' },
                toString: function () { return prologue + instrumentedSrc },
            };
    
            function traceEntry(node, nodeId, args) {
                args = ['nodeId: ' + JSON.stringify(nodeId)].concat(args || []);
                node.before(options.tracer_name + '.traceEnter({' + args.join(',') + '});');
                node.after(options.tracer_name + '.traceExit(' + JSON.stringify({ nodeId: nodeId }) + ');',
                           options.tracer_name + '.traceExceptionThrown(' + JSON.stringify({ nodeId: nodeId }) + ', __e);throw __e;');
            }
    
            function traceFileEntry(node, nodeId, args) {
                args = ['nodeId: ' + JSON.stringify(nodeId)].concat(args || []);
                node.before(options.tracer_name + '.traceFileEntry({' + args.join(',') + '});');
                node.after(options.tracer_name + '.traceFileExit(' + JSON.stringify({ nodeId: nodeId }) + ');', true);
            }
        } catch (e) {
            if (options.throw_parse_errors) {
                throw e;
            } else {
                console.error('exception during parsing', options.path, e.stack);
                return options.prefix + src;
            }
        }
    }
    
    /**
     * options:
     *   path (<anonymous>): path of the source being instrumented
     *       (should be unique if multiple instrumented files are to be run together)
     *   include_prefix (true): include the instrumentation thunk
     *   tracer_name (__tracer): name for the global tracer object
     *   nodejs (false): true to enable Node.js-specific functionality
     *   maxInvocationsPerTick (4096): stop collecting trace information for a tick
     *       with more than this many invocations
     *   throw_parse_errors (false): if false, parse exceptions are caught and the
     *       original source code is returned.
     **/
    function instrument(src, options) {
        options = mergeInto(options, {
            include_prefix: true,
            tracer_name: '__tracer',
        });
    
        var prefix = '', shebang = '', output, m;
    
        if (m = /^(#![^\n]+)\n/.exec(src)) {
            shebang = m[1];
            src = src.slice(shebang.length);
        }
    
        if (options.include_prefix) {
            prefix += instrumentationPrefix({
                name: options.tracer_name,
                nodejs: options.nodejs,
                maxInvocationsPerTick: options.maxInvocationsPerTick,
            });
        }
    
        if (src.indexOf("/*theseus" + " instrument: false */") !== -1) {
            output = shebang + prefix + src;
        } else {
            var m = traceFilter(src, {
                prefix: prefix,
                path: options.path,
                tracer_name: options.tracer_name,
                sourceFilename: options.sourceFilename,
                generatedFilename: options.generatedFilename,
                throw_parse_errors: options.throw_parse_errors,
            });
            var oldToString = m.toString;
            m.toString = function () {
                return shebang + oldToString();
            }
            return m;
        }
    
        return output;
    }
    
    module.exports = {
        instrument: instrument,
        instrumentationPrefix: instrumentationPrefix,
    };
    
    }).call(this,"/")
    },{"./package.json":24,"esprima-selector":5,"falafel":9,"falafel-helpers":6,"falafel-map":7,"fs":25,"path":29}],3:[function(require,module,exports){
    (function (global){
    (function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.acorn = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
    
    
    // The main exported interface (under `self.acorn` when in the
    // browser) is a `parse` function that takes a code string and
    // returns an abstract syntax tree as specified by [Mozilla parser
    // API][api].
    //
    // [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API
    
    "use strict";
    
    exports.parse = parse;
    
    // This function tries to parse a single expression at a given
    // offset in a string. Useful for parsing mixed-language formats
    // that embed JavaScript expressions.
    
    exports.parseExpressionAt = parseExpressionAt;
    
    // Acorn is organized as a tokenizer and a recursive-descent parser.
    // The `tokenize` export provides an interface to the tokenizer.
    
    exports.tokenizer = tokenizer;
    exports.__esModule = true;
    // Acorn is a tiny, fast JavaScript parser written in JavaScript.
    //
    // Acorn was written by Marijn Haverbeke, Ingvar Stepanyan, and
    // various contributors and released under an MIT license.
    //
    // Git repositories for Acorn are available at
    //
    //     http://marijnhaverbeke.nl/git/acorn
    //     https://github.com/marijnh/acorn.git
    //
    // Please use the [github bug tracker][ghbt] to report issues.
    //
    // [ghbt]: https://github.com/marijnh/acorn/issues
    //
    // This file defines the main parser interface. The library also comes
    // with a [error-tolerant parser][dammit] and an
    // [abstract syntax tree walker][walk], defined in other files.
    //
    // [dammit]: acorn_loose.js
    // [walk]: util/walk.js
    
    var _state = _dereq_("./state");
    
    var Parser = _state.Parser;
    
    var _options = _dereq_("./options");
    
    var getOptions = _options.getOptions;
    
    _dereq_("./parseutil");
    
    _dereq_("./statement");
    
    _dereq_("./lval");
    
    _dereq_("./expression");
    
    exports.Parser = _state.Parser;
    exports.plugins = _state.plugins;
    exports.defaultOptions = _options.defaultOptions;
    
    var _location = _dereq_("./location");
    
    exports.SourceLocation = _location.SourceLocation;
    exports.getLineInfo = _location.getLineInfo;
    exports.Node = _dereq_("./node").Node;
    
    var _tokentype = _dereq_("./tokentype");
    
    exports.TokenType = _tokentype.TokenType;
    exports.tokTypes = _tokentype.types;
    
    var _tokencontext = _dereq_("./tokencontext");
    
    exports.TokContext = _tokencontext.TokContext;
    exports.tokContexts = _tokencontext.types;
    
    var _identifier = _dereq_("./identifier");
    
    exports.isIdentifierChar = _identifier.isIdentifierChar;
    exports.isIdentifierStart = _identifier.isIdentifierStart;
    exports.Token = _dereq_("./tokenize").Token;
    
    var _whitespace = _dereq_("./whitespace");
    
    exports.isNewLine = _whitespace.isNewLine;
    exports.lineBreak = _whitespace.lineBreak;
    exports.lineBreakG = _whitespace.lineBreakG;
    var version = "1.2.2";exports.version = version;
    
    function parse(input, options) {
      var p = parser(options, input);
      var startPos = p.pos,
          startLoc = p.options.locations && p.curPosition();
      p.nextToken();
      return p.parseTopLevel(p.options.program || p.startNodeAt(startPos, startLoc));
    }
    
    function parseExpressionAt(input, pos, options) {
      var p = parser(options, input, pos);
      p.nextToken();
      return p.parseExpression();
    }
    
    function tokenizer(input, options) {
      return parser(options, input);
    }
    
    function parser(options, input) {
      return new Parser(getOptions(options), String(input));
    }
    
    },{"./expression":6,"./identifier":7,"./location":8,"./lval":9,"./node":10,"./options":11,"./parseutil":12,"./state":13,"./statement":14,"./tokencontext":15,"./tokenize":16,"./tokentype":17,"./whitespace":19}],2:[function(_dereq_,module,exports){
    if (typeof Object.create === 'function') {
      // implementation from standard node.js 'util' module
      module.exports = function inherits(ctor, superCtor) {
        ctor.super_ = superCtor
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
      };
    } else {
      // old school shim for old browsers
      module.exports = function inherits(ctor, superCtor) {
        ctor.super_ = superCtor
        var TempCtor = function () {}
        TempCtor.prototype = superCtor.prototype
        ctor.prototype = new TempCtor()
        ctor.prototype.constructor = ctor
      }
    }
    
    },{}],3:[function(_dereq_,module,exports){
    // shim for using process in browser
    
    var process = module.exports = {};
    var queue = [];
    var draining = false;
    
    function drainQueue() {
        if (draining) {
            return;
        }
        draining = true;
        var currentQueue;
        var len = queue.length;
        while(len) {
            currentQueue = queue;
            queue = [];
            var i = -1;
            while (++i < len) {
                currentQueue[i]();
            }
            len = queue.length;
        }
        draining = false;
    }
    process.nextTick = function (fun) {
        queue.push(fun);
        if (!draining) {
            setTimeout(drainQueue, 0);
        }
    };
    
    process.title = 'browser';
    process.browser = true;
    process.env = {};
    process.argv = [];
    process.version = ''; // empty string to avoid regexp issues
    process.versions = {};
    
    function noop() {}
    
    process.on = noop;
    process.addListener = noop;
    process.once = noop;
    process.off = noop;
    process.removeListener = noop;
    process.removeAllListeners = noop;
    process.emit = noop;
    
    process.binding = function (name) {
        throw new Error('process.binding is not supported');
    };
    
    // TODO(shtylman)
    process.cwd = function () { return '/' };
    process.chdir = function (dir) {
        throw new Error('process.chdir is not supported');
    };
    process.umask = function() { return 0; };
    
    },{}],4:[function(_dereq_,module,exports){
    module.exports = function isBuffer(arg) {
      return arg && typeof arg === 'object'
        && typeof arg.copy === 'function'
        && typeof arg.fill === 'function'
        && typeof arg.readUInt8 === 'function';
    }
    },{}],5:[function(_dereq_,module,exports){
    (function (process,global){
    // Copyright Joyent, Inc. and other Node contributors.
    //
    // Permission is hereby granted, free of charge, to any person obtaining a
    // copy of this software and associated documentation files (the
    // "Software"), to deal in the Software without restriction, including
    // without limitation the rights to use, copy, modify, merge, publish,
    // distribute, sublicense, and/or sell copies of the Software, and to permit
    // persons to whom the Software is furnished to do so, subject to the
    // following conditions:
    //
    // The above copyright notice and this permission notice shall be included
    // in all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
    // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
    // USE OR OTHER DEALINGS IN THE SOFTWARE.
    
    var formatRegExp = /%[sdj%]/g;
    exports.format = function(f) {
      if (!isString(f)) {
        var objects = [];
        for (var i = 0; i < arguments.length; i++) {
          objects.push(inspect(arguments[i]));
        }
        return objects.join(' ');
      }
    
      var i = 1;
      var args = arguments;
      var len = args.length;
      var str = String(f).replace(formatRegExp, function(x) {
        if (x === '%%') return '%';
        if (i >= len) return x;
        switch (x) {
          case '%s': return String(args[i++]);
          case '%d': return Number(args[i++]);
          case '%j':
            try {
              return JSON.stringify(args[i++]);
            } catch (_) {
              return '[Circular]';
            }
          default:
            return x;
        }
      });
      for (var x = args[i]; i < len; x = args[++i]) {
        if (isNull(x) || !isObject(x)) {
          str += ' ' + x;
        } else {
          str += ' ' + inspect(x);
        }
      }
      return str;
    };
    
    
    // Mark that a method should not be used.
    // Returns a modified function which warns once by default.
    // If --no-deprecation is set, then it is a no-op.
    exports.deprecate = function(fn, msg) {
      // Allow for deprecating things in the process of starting up.
      if (isUndefined(global.process)) {
        return function() {
          return exports.deprecate(fn, msg).apply(this, arguments);
        };
      }
    
      if (process.noDeprecation === true) {
        return fn;
      }
    
      var warned = false;
      function deprecated() {
        if (!warned) {
          if (process.throwDeprecation) {
            throw new Error(msg);
          } else if (process.traceDeprecation) {
            console.trace(msg);
          } else {
            console.error(msg);
          }
          warned = true;
        }
        return fn.apply(this, arguments);
      }
    
      return deprecated;
    };
    
    
    var debugs = {};
    var debugEnviron;
    exports.debuglog = function(set) {
      if (isUndefined(debugEnviron))
        debugEnviron = process.env.NODE_DEBUG || '';
      set = set.toUpperCase();
      if (!debugs[set]) {
        if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
          var pid = process.pid;
          debugs[set] = function() {
            var msg = exports.format.apply(exports, arguments);
            console.error('%s %d: %s', set, pid, msg);
          };
        } else {
          debugs[set] = function() {};
        }
      }
      return debugs[set];
    };
    
    
    /**
     * Echos the value of a value. Trys to print the value out
     * in the best way possible given the different types.
     *
     * @param {Object} obj The object to print out.
     * @param {Object} opts Optional options object that alters the output.
     */
    /* legacy: obj, showHidden, depth, colors*/
    function inspect(obj, opts) {
      // default options
      var ctx = {
        seen: [],
        stylize: stylizeNoColor
      };
      // legacy...
      if (arguments.length >= 3) ctx.depth = arguments[2];
      if (arguments.length >= 4) ctx.colors = arguments[3];
      if (isBoolean(opts)) {
        // legacy...
        ctx.showHidden = opts;
      } else if (opts) {
        // got an "options" object
        exports._extend(ctx, opts);
      }
      // set default options
      if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
      if (isUndefined(ctx.depth)) ctx.depth = 2;
      if (isUndefined(ctx.colors)) ctx.colors = false;
      if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
      if (ctx.colors) ctx.stylize = stylizeWithColor;
      return formatValue(ctx, obj, ctx.depth);
    }
    exports.inspect = inspect;
    
    
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    inspect.colors = {
      'bold' : [1, 22],
      'italic' : [3, 23],
      'underline' : [4, 24],
      'inverse' : [7, 27],
      'white' : [37, 39],
      'grey' : [90, 39],
      'black' : [30, 39],
      'blue' : [34, 39],
      'cyan' : [36, 39],
      'green' : [32, 39],
      'magenta' : [35, 39],
      'red' : [31, 39],
      'yellow' : [33, 39]
    };
    
    // Don't use 'blue' not visible on cmd.exe
    inspect.styles = {
      'special': 'cyan',
      'number': 'yellow',
      'boolean': 'yellow',
      'undefined': 'grey',
      'null': 'bold',
      'string': 'green',
      'date': 'magenta',
      // "name": intentionally not styling
      'regexp': 'red'
    };
    
    
    function stylizeWithColor(str, styleType) {
      var style = inspect.styles[styleType];
    
      if (style) {
        return '\u001b[' + inspect.colors[style][0] + 'm' + str +
               '\u001b[' + inspect.colors[style][1] + 'm';
      } else {
        return str;
      }
    }
    
    
    function stylizeNoColor(str, styleType) {
      return str;
    }
    
    
    function arrayToHash(array) {
      var hash = {};
    
      array.forEach(function(val, idx) {
        hash[val] = true;
      });
    
      return hash;
    }
    
    
    function formatValue(ctx, value, recurseTimes) {
      // Provide a hook for user-specified inspect functions.
      // Check that value is an object with an inspect function on it
      if (ctx.customInspect &&
          value &&
          isFunction(value.inspect) &&
          // Filter out the util module, it's inspect function is special
          value.inspect !== exports.inspect &&
          // Also filter out any prototype objects using the circular check.
          !(value.constructor && value.constructor.prototype === value)) {
        var ret = value.inspect(recurseTimes, ctx);
        if (!isString(ret)) {
          ret = formatValue(ctx, ret, recurseTimes);
        }
        return ret;
      }
    
      // Primitive types cannot have properties
      var primitive = formatPrimitive(ctx, value);
      if (primitive) {
        return primitive;
      }
    
      // Look up the keys of the object.
      var keys = Object.keys(value);
      var visibleKeys = arrayToHash(keys);
    
      if (ctx.showHidden) {
        keys = Object.getOwnPropertyNames(value);
      }
    
      // IE doesn't make error fields non-enumerable
      // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
      if (isError(value)
          && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
        return formatError(value);
      }
    
      // Some type of object without properties can be shortcutted.
      if (keys.length === 0) {
        if (isFunction(value)) {
          var name = value.name ? ': ' + value.name : '';
          return ctx.stylize('[Function' + name + ']', 'special');
        }
        if (isRegExp(value)) {
          return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
        }
        if (isDate(value)) {
          return ctx.stylize(Date.prototype.toString.call(value), 'date');
        }
        if (isError(value)) {
          return formatError(value);
        }
      }
    
      var base = '', array = false, braces = ['{', '}'];
    
      // Make Array say that they are Array
      if (isArray(value)) {
        array = true;
        braces = ['[', ']'];
      }
    
      // Make functions say that they are functions
      if (isFunction(value)) {
        var n = value.name ? ': ' + value.name : '';
        base = ' [Function' + n + ']';
      }
    
      // Make RegExps say that they are RegExps
      if (isRegExp(value)) {
        base = ' ' + RegExp.prototype.toString.call(value);
      }
    
      // Make dates with properties first say the date
      if (isDate(value)) {
        base = ' ' + Date.prototype.toUTCString.call(value);
      }
    
      // Make error with message first say the error
      if (isError(value)) {
        base = ' ' + formatError(value);
      }
    
      if (keys.length === 0 && (!array || value.length == 0)) {
        return braces[0] + base + braces[1];
      }
    
      if (recurseTimes < 0) {
        if (isRegExp(value)) {
          return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
        } else {
          return ctx.stylize('[Object]', 'special');
        }
      }
    
      ctx.seen.push(value);
    
      var output;
      if (array) {
        output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
      } else {
        output = keys.map(function(key) {
          return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
        });
      }
    
      ctx.seen.pop();
    
      return reduceToSingleString(output, base, braces);
    }
    
    
    function formatPrimitive(ctx, value) {
      if (isUndefined(value))
        return ctx.stylize('undefined', 'undefined');
      if (isString(value)) {
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return ctx.stylize(simple, 'string');
      }
      if (isNumber(value))
        return ctx.stylize('' + value, 'number');
      if (isBoolean(value))
        return ctx.stylize('' + value, 'boolean');
      // For some reason typeof null is "object", so special case here.
      if (isNull(value))
        return ctx.stylize('null', 'null');
    }
    
    
    function formatError(value) {
      return '[' + Error.prototype.toString.call(value) + ']';
    }
    
    
    function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
      var output = [];
      for (var i = 0, l = value.length; i < l; ++i) {
        if (hasOwnProperty(value, String(i))) {
          output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
              String(i), true));
        } else {
          output.push('');
        }
      }
      keys.forEach(function(key) {
        if (!key.match(/^\d+$/)) {
          output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
              key, true));
        }
      });
      return output;
    }
    
    
    function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
      var name, str, desc;
      desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
      if (desc.get) {
        if (desc.set) {
          str = ctx.stylize('[Getter/Setter]', 'special');
        } else {
          str = ctx.stylize('[Getter]', 'special');
        }
      } else {
        if (desc.set) {
          str = ctx.stylize('[Setter]', 'special');
        }
      }
      if (!hasOwnProperty(visibleKeys, key)) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (ctx.seen.indexOf(desc.value) < 0) {
          if (isNull(recurseTimes)) {
            str = formatValue(ctx, desc.value, null);
          } else {
            str = formatValue(ctx, desc.value, recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (array) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = ctx.stylize('[Circular]', 'special');
        }
      }
      if (isUndefined(name)) {
        if (array && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = ctx.stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = ctx.stylize(name, 'string');
        }
      }
    
      return name + ': ' + str;
    }
    
    
    function reduceToSingleString(output, base, braces) {
      var numLinesEst = 0;
      var length = output.reduce(function(prev, cur) {
        numLinesEst++;
        if (cur.indexOf('\n') >= 0) numLinesEst++;
        return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
      }, 0);
    
      if (length > 60) {
        return braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];
      }
    
      return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }
    
    
    // NOTE: These type checking functions intentionally don't use `instanceof`
    // because it is fragile and can be easily faked with `Object.create()`.
    function isArray(ar) {
      return Array.isArray(ar);
    }
    exports.isArray = isArray;
    
    function isBoolean(arg) {
      return typeof arg === 'boolean';
    }
    exports.isBoolean = isBoolean;
    
    function isNull(arg) {
      return arg === null;
    }
    exports.isNull = isNull;
    
    function isNullOrUndefined(arg) {
      return arg == null;
    }
    exports.isNullOrUndefined = isNullOrUndefined;
    
    function isNumber(arg) {
      return typeof arg === 'number';
    }
    exports.isNumber = isNumber;
    
    function isString(arg) {
      return typeof arg === 'string';
    }
    exports.isString = isString;
    
    function isSymbol(arg) {
      return typeof arg === 'symbol';
    }
    exports.isSymbol = isSymbol;
    
    function isUndefined(arg) {
      return arg === void 0;
    }
    exports.isUndefined = isUndefined;
    
    function isRegExp(re) {
      return isObject(re) && objectToString(re) === '[object RegExp]';
    }
    exports.isRegExp = isRegExp;
    
    function isObject(arg) {
      return typeof arg === 'object' && arg !== null;
    }
    exports.isObject = isObject;
    
    function isDate(d) {
      return isObject(d) && objectToString(d) === '[object Date]';
    }
    exports.isDate = isDate;
    
    function isError(e) {
      return isObject(e) &&
          (objectToString(e) === '[object Error]' || e instanceof Error);
    }
    exports.isError = isError;
    
    function isFunction(arg) {
      return typeof arg === 'function';
    }
    exports.isFunction = isFunction;
    
    function isPrimitive(arg) {
      return arg === null ||
             typeof arg === 'boolean' ||
             typeof arg === 'number' ||
             typeof arg === 'string' ||
             typeof arg === 'symbol' ||  // ES6 symbol
             typeof arg === 'undefined';
    }
    exports.isPrimitive = isPrimitive;
    
    exports.isBuffer = _dereq_('./support/isBuffer');
    
    function objectToString(o) {
      return Object.prototype.toString.call(o);
    }
    
    
    function pad(n) {
      return n < 10 ? '0' + n.toString(10) : n.toString(10);
    }
    
    
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
                  'Oct', 'Nov', 'Dec'];
    
    // 26 Feb 16:19:34
    function timestamp() {
      var d = new Date();
      var time = [pad(d.getHours()),
                  pad(d.getMinutes()),
                  pad(d.getSeconds())].join(':');
      return [d.getDate(), months[d.getMonth()], time].join(' ');
    }
    
    
    // log is just a thin wrapper to console.log that prepends a timestamp
    exports.log = function() {
      console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
    };
    
    
    /**
     * Inherit the prototype methods from one constructor into another.
     *
     * The Function.prototype.inherits from lang.js rewritten as a standalone
     * function (not on Function.prototype). NOTE: If this file is to be loaded
     * during bootstrapping this function needs to be rewritten using some native
     * functions as prototype setup using normal JavaScript does not work as
     * expected during bootstrapping (see mirror.js in r114903).
     *
     * @param {function} ctor Constructor function which needs to inherit the
     *     prototype.
     * @param {function} superCtor Constructor function to inherit prototype from.
     */
    exports.inherits = _dereq_('inherits');
    
    exports._extend = function(origin, add) {
      // Don't do anything if add isn't an object
      if (!add || !isObject(add)) return origin;
    
      var keys = Object.keys(add);
      var i = keys.length;
      while (i--) {
        origin[keys[i]] = add[keys[i]];
      }
      return origin;
    };
    
    function hasOwnProperty(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }
    
    }).call(this,_dereq_('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    },{"./support/isBuffer":4,"_process":3,"inherits":2}],6:[function(_dereq_,module,exports){
    // A recursive descent parser operates by defining functions for all
    // syntactic elements, and recursively calling those, each function
    // advancing the input stream and returning an AST node. Precedence
    // of constructs (for example, the fact that `!x[1]` means `!(x[1])`
    // instead of `(!x)[1]` is handled by the fact that the parser
    // function that parses unary prefix operators is called first, and
    // in turn calls the function that parses `[]` subscripts — that
    // way, it'll receive the node for `x[1]` already parsed, and wraps
    // *that* in the unary operator node.
    //
    // Acorn uses an [operator precedence parser][opp] to handle binary
    // operator precedence, because it is much more compact than using
    // the technique outlined above, which uses different, nesting
    // functions to specify precedence, for all of the ten binary
    // precedence levels that JavaScript defines.
    //
    // [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser
    
    "use strict";
    
    var tt = _dereq_("./tokentype").types;
    
    var Parser = _dereq_("./state").Parser;
    
    var reservedWords = _dereq_("./identifier").reservedWords;
    
    var has = _dereq_("./util").has;
    
    var pp = Parser.prototype;
    
    // Check if property name clashes with already added.
    // Object/class getters and setters are not allowed to clash —
    // either with each other or with an init property — and in
    // strict mode, init properties are also not allowed to be repeated.
    
    pp.checkPropClash = function (prop, propHash) {
      if (this.options.ecmaVersion >= 6) return;
      var key = prop.key,
          name = undefined;
      switch (key.type) {
        case "Identifier":
          name = key.name;break;
        case "Literal":
          name = String(key.value);break;
        default:
          return;
      }
      var kind = prop.kind || "init",
          other = undefined;
      if (has(propHash, name)) {
        other = propHash[name];
        var isGetSet = kind !== "init";
        if ((this.strict || isGetSet) && other[kind] || !(isGetSet ^ other.init)) this.raise(key.start, "Redefinition of property");
      } else {
        other = propHash[name] = {
          init: false,
          get: false,
          set: false
        };
      }
      other[kind] = true;
    };
    
    // ### Expression parsing
    
    // These nest, from the most general expression type at the top to
    // 'atomic', nondivisible expression types at the bottom. Most of
    // the functions will simply let the function(s) below them parse,
    // and, *if* the syntactic construct they handle is present, wrap
    // the AST node that the inner parser gave them in another node.
    
    // Parse a full expression. The optional arguments are used to
    // forbid the `in` operator (in for loops initalization expressions)
    // and provide reference for storing '=' operator inside shorthand
    // property assignment in contexts where both object expression
    // and object pattern might appear (so it's possible to raise
    // delayed syntax error at correct position).
    
    pp.parseExpression = function (noIn, refShorthandDefaultPos) {
      var startPos = this.start,
          startLoc = this.startLoc;
      var expr = this.parseMaybeAssign(noIn, refShorthandDefaultPos);
      if (this.type === tt.comma) {
        var node = this.startNodeAt(startPos, startLoc);
        node.expressions = [expr];
        while (this.eat(tt.comma)) node.expressions.push(this.parseMaybeAssign(noIn, refShorthandDefaultPos));
        return this.finishNode(node, "SequenceExpression");
      }
      return expr;
    };
    
    // Parse an assignment expression. This includes applications of
    // operators like `+=`.
    
    pp.parseMaybeAssign = function (noIn, refShorthandDefaultPos, afterLeftParse) {
      if (this.type == tt._yield && this.inGenerator) return this.parseYield();
    
      var failOnShorthandAssign = undefined;
      if (!refShorthandDefaultPos) {
        refShorthandDefaultPos = { start: 0 };
        failOnShorthandAssign = true;
      } else {
        failOnShorthandAssign = false;
      }
      var startPos = this.start,
          startLoc = this.startLoc;
      if (this.type == tt.parenL || this.type == tt.name) this.potentialArrowAt = this.start;
      var left = this.parseMaybeConditional(noIn, refShorthandDefaultPos);
      if (afterLeftParse) left = afterLeftParse.call(this, left, startPos, startLoc);
      if (this.type.isAssign) {
        var node = this.startNodeAt(startPos, startLoc);
        node.operator = this.value;
        node.left = this.type === tt.eq ? this.toAssignable(left) : left;
        refShorthandDefaultPos.start = 0; // reset because shorthand default was used correctly
        this.checkLVal(left);
        this.next();
        node.right = this.parseMaybeAssign(noIn);
        return this.finishNode(node, "AssignmentExpression");
      } else if (failOnShorthandAssign && refShorthandDefaultPos.start) {
        this.unexpected(refShorthandDefaultPos.start);
      }
      return left;
    };
    
    // Parse a ternary conditional (`?:`) operator.
    
    pp.parseMaybeConditional = function (noIn, refShorthandDefaultPos) {
      var startPos = this.start,
          startLoc = this.startLoc;
      var expr = this.parseExprOps(noIn, refShorthandDefaultPos);
      if (refShorthandDefaultPos && refShorthandDefaultPos.start) return expr;
      if (this.eat(tt.question)) {
        var node = this.startNodeAt(startPos, startLoc);
        node.test = expr;
        node.consequent = this.parseMaybeAssign();
        this.expect(tt.colon);
        node.alternate = this.parseMaybeAssign(noIn);
        return this.finishNode(node, "ConditionalExpression");
      }
      return expr;
    };
    
    // Start the precedence parser.
    
    pp.parseExprOps = function (noIn, refShorthandDefaultPos) {
      var startPos = this.start,
          startLoc = this.startLoc;
      var expr = this.parseMaybeUnary(refShorthandDefaultPos);
      if (refShorthandDefaultPos && refShorthandDefaultPos.start) return expr;
      return this.parseExprOp(expr, startPos, startLoc, -1, noIn);
    };
    
    // Parse binary operators with the operator precedence parsing
    // algorithm. `left` is the left-hand side of the operator.
    // `minPrec` provides context that allows the function to stop and
    // defer further parser to one of its callers when it encounters an
    // operator that has a lower precedence than the set it is parsing.
    
    pp.parseExprOp = function (left, leftStartPos, leftStartLoc, minPrec, noIn) {
      var prec = this.type.binop;
      if (Array.isArray(leftStartPos)) {
        if (this.options.locations && noIn === undefined) {
          // shift arguments to left by one
          noIn = minPrec;
          minPrec = leftStartLoc;
          // flatten leftStartPos
          leftStartLoc = leftStartPos[1];
          leftStartPos = leftStartPos[0];
        }
      }
      if (prec != null && (!noIn || this.type !== tt._in)) {
        if (prec > minPrec) {
          var node = this.startNodeAt(leftStartPos, leftStartLoc);
          node.left = left;
          node.operator = this.value;
          var op = this.type;
          this.next();
          var startPos = this.start,
              startLoc = this.startLoc;
          node.right = this.parseExprOp(this.parseMaybeUnary(), startPos, startLoc, prec, noIn);
          this.finishNode(node, op === tt.logicalOR || op === tt.logicalAND ? "LogicalExpression" : "BinaryExpression");
          return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, noIn);
        }
      }
      return left;
    };
    
    // Parse unary operators, both prefix and postfix.
    
    pp.parseMaybeUnary = function (refShorthandDefaultPos) {
      if (this.type.prefix) {
        var node = this.startNode(),
            update = this.type === tt.incDec;
        node.operator = this.value;
        node.prefix = true;
        this.next();
        node.argument = this.parseMaybeUnary();
        if (refShorthandDefaultPos && refShorthandDefaultPos.start) this.unexpected(refShorthandDefaultPos.start);
        if (update) this.checkLVal(node.argument);else if (this.strict && node.operator === "delete" && node.argument.type === "Identifier") this.raise(node.start, "Deleting local variable in strict mode");
        return this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
      }
      var startPos = this.start,
          startLoc = this.startLoc;
      var expr = this.parseExprSubscripts(refShorthandDefaultPos);
      if (refShorthandDefaultPos && refShorthandDefaultPos.start) return expr;
      while (this.type.postfix && !this.canInsertSemicolon()) {
        var node = this.startNodeAt(startPos, startLoc);
        node.operator = this.value;
        node.prefix = false;
        node.argument = expr;
        this.checkLVal(expr);
        this.next();
        expr = this.finishNode(node, "UpdateExpression");
      }
      return expr;
    };
    
    // Parse call, dot, and `[]`-subscript expressions.
    
    pp.parseExprSubscripts = function (refShorthandDefaultPos) {
      var startPos = this.start,
          startLoc = this.startLoc;
      var expr = this.parseExprAtom(refShorthandDefaultPos);
      if (refShorthandDefaultPos && refShorthandDefaultPos.start) return expr;
      return this.parseSubscripts(expr, startPos, startLoc);
    };
    
    pp.parseSubscripts = function (base, startPos, startLoc, noCalls) {
      if (Array.isArray(startPos)) {
        if (this.options.locations && noCalls === undefined) {
          // shift arguments to left by one
          noCalls = startLoc;
          // flatten startPos
          startLoc = startPos[1];
          startPos = startPos[0];
        }
      }
      for (;;) {
        if (this.eat(tt.dot)) {
          var node = this.startNodeAt(startPos, startLoc);
          node.object = base;
          node.property = this.parseIdent(true);
          node.computed = false;
          base = this.finishNode(node, "MemberExpression");
        } else if (this.eat(tt.bracketL)) {
          var node = this.startNodeAt(startPos, startLoc);
          node.object = base;
          node.property = this.parseExpression();
          node.computed = true;
          this.expect(tt.bracketR);
          base = this.finishNode(node, "MemberExpression");
        } else if (!noCalls && this.eat(tt.parenL)) {
          var node = this.startNodeAt(startPos, startLoc);
          node.callee = base;
          node.arguments = this.parseExprList(tt.parenR, false);
          base = this.finishNode(node, "CallExpression");
        } else if (this.type === tt.backQuote) {
          var node = this.startNodeAt(startPos, startLoc);
          node.tag = base;
          node.quasi = this.parseTemplate();
          base = this.finishNode(node, "TaggedTemplateExpression");
        } else {
          return base;
        }
      }
    };
    
    // Parse an atomic expression — either a single token that is an
    // expression, an expression started by a keyword like `function` or
    // `new`, or an expression wrapped in punctuation like `()`, `[]`,
    // or `{}`.
    
    pp.parseExprAtom = function (refShorthandDefaultPos) {
      var node = undefined,
          canBeArrow = this.potentialArrowAt == this.start;
      switch (this.type) {
        case tt._this:
        case tt._super:
          var type = this.type === tt._this ? "ThisExpression" : "Super";
          node = this.startNode();
          this.next();
          return this.finishNode(node, type);
    
        case tt._yield:
          if (this.inGenerator) this.unexpected();
    
        case tt.name:
          var startPos = this.start,
              startLoc = this.startLoc;
          var id = this.parseIdent(this.type !== tt.name);
          if (canBeArrow && !this.canInsertSemicolon() && this.eat(tt.arrow)) return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id]);
          return id;
    
        case tt.regexp:
          var value = this.value;
          node = this.parseLiteral(value.value);
          node.regex = { pattern: value.pattern, flags: value.flags };
          return node;
    
        case tt.num:case tt.string:
          return this.parseLiteral(this.value);
    
        case tt._null:case tt._true:case tt._false:
          node = this.startNode();
          node.value = this.type === tt._null ? null : this.type === tt._true;
          node.raw = this.type.keyword;
          this.next();
          return this.finishNode(node, "Literal");
    
        case tt.parenL:
          return this.parseParenAndDistinguishExpression(canBeArrow);
    
        case tt.bracketL:
          node = this.startNode();
          this.next();
          // check whether this is array comprehension or regular array
          if (this.options.ecmaVersion >= 7 && this.type === tt._for) {
            return this.parseComprehension(node, false);
          }
          node.elements = this.parseExprList(tt.bracketR, true, true, refShorthandDefaultPos);
          return this.finishNode(node, "ArrayExpression");
    
        case tt.braceL:
          return this.parseObj(false, refShorthandDefaultPos);
    
        case tt._function:
          node = this.startNode();
          this.next();
          return this.parseFunction(node, false);
    
        case tt._class:
          return this.parseClass(this.startNode(), false);
    
        case tt._new:
          return this.parseNew();
    
        case tt.backQuote:
          return this.parseTemplate();
    
        default:
          this.unexpected();
      }
    };
    
    pp.parseLiteral = function (value) {
      var node = this.startNode();
      node.value = value;
      node.raw = this.input.slice(this.start, this.end);
      this.next();
      return this.finishNode(node, "Literal");
    };
    
    pp.parseParenExpression = function () {
      this.expect(tt.parenL);
      var val = this.parseExpression();
      this.expect(tt.parenR);
      return val;
    };
    
    pp.parseParenAndDistinguishExpression = function (canBeArrow) {
      var startPos = this.start,
          startLoc = this.startLoc,
          val = undefined;
      if (this.options.ecmaVersion >= 6) {
        this.next();
    
        if (this.options.ecmaVersion >= 7 && this.type === tt._for) {
          return this.parseComprehension(this.startNodeAt(startPos, startLoc), true);
        }
    
        var innerStartPos = this.start,
            innerStartLoc = this.startLoc;
        var exprList = [],
            first = true;
        var refShorthandDefaultPos = { start: 0 },
            spreadStart = undefined,
            innerParenStart = undefined;
        while (this.type !== tt.parenR) {
          first ? first = false : this.expect(tt.comma);
          if (this.type === tt.ellipsis) {
            spreadStart = this.start;
            exprList.push(this.parseParenItem(this.parseRest()));
            break;
          } else {
            if (this.type === tt.parenL && !innerParenStart) {
              innerParenStart = this.start;
            }
            exprList.push(this.parseMaybeAssign(false, refShorthandDefaultPos, this.parseParenItem));
          }
        }
        var innerEndPos = this.start,
            innerEndLoc = this.startLoc;
        this.expect(tt.parenR);
    
        if (canBeArrow && !this.canInsertSemicolon() && this.eat(tt.arrow)) {
          if (innerParenStart) this.unexpected(innerParenStart);
          return this.parseParenArrowList(startPos, startLoc, exprList);
        }
    
        if (!exprList.length) this.unexpected(this.lastTokStart);
        if (spreadStart) this.unexpected(spreadStart);
        if (refShorthandDefaultPos.start) this.unexpected(refShorthandDefaultPos.start);
    
        if (exprList.length > 1) {
          val = this.startNodeAt(innerStartPos, innerStartLoc);
          val.expressions = exprList;
          this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
        } else {
          val = exprList[0];
        }
      } else {
        val = this.parseParenExpression();
      }
    
      if (this.options.preserveParens) {
        var par = this.startNodeAt(startPos, startLoc);
        par.expression = val;
        return this.finishNode(par, "ParenthesizedExpression");
      } else {
        return val;
      }
    };
    
    pp.parseParenItem = function (item) {
      return item;
    };
    
    pp.parseParenArrowList = function (startPos, startLoc, exprList) {
      return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList);
    };
    
    // New's precedence is slightly tricky. It must allow its argument
    // to be a `[]` or dot subscript expression, but not a call — at
    // least, not without wrapping it in parentheses. Thus, it uses the
    
    var empty = [];
    
    pp.parseNew = function () {
      var node = this.startNode();
      var meta = this.parseIdent(true);
      if (this.options.ecmaVersion >= 6 && this.eat(tt.dot)) {
        node.meta = meta;
        node.property = this.parseIdent(true);
        if (node.property.name !== "target") this.raise(node.property.start, "The only valid meta property for new is new.target");
        return this.finishNode(node, "MetaProperty");
      }
      var startPos = this.start,
          startLoc = this.startLoc;
      node.callee = this.parseSubscripts(this.parseExprAtom(), startPos, startLoc, true);
      if (this.eat(tt.parenL)) node.arguments = this.parseExprList(tt.parenR, false);else node.arguments = empty;
      return this.finishNode(node, "NewExpression");
    };
    
    // Parse template expression.
    
    pp.parseTemplateElement = function () {
      var elem = this.startNode();
      elem.value = {
        raw: this.input.slice(this.start, this.end),
        cooked: this.value
      };
      this.next();
      elem.tail = this.type === tt.backQuote;
      return this.finishNode(elem, "TemplateElement");
    };
    
    pp.parseTemplate = function () {
      var node = this.startNode();
      this.next();
      node.expressions = [];
      var curElt = this.parseTemplateElement();
      node.quasis = [curElt];
      while (!curElt.tail) {
        this.expect(tt.dollarBraceL);
        node.expressions.push(this.parseExpression());
        this.expect(tt.braceR);
        node.quasis.push(curElt = this.parseTemplateElement());
      }
      this.next();
      return this.finishNode(node, "TemplateLiteral");
    };
    
    // Parse an object literal or binding pattern.
    
    pp.parseObj = function (isPattern, refShorthandDefaultPos) {
      var node = this.startNode(),
          first = true,
          propHash = {};
      node.properties = [];
      this.next();
      while (!this.eat(tt.braceR)) {
        if (!first) {
          this.expect(tt.comma);
          if (this.afterTrailingComma(tt.braceR)) break;
        } else first = false;
    
        var prop = this.startNode(),
            isGenerator = undefined,
            startPos = undefined,
            startLoc = undefined;
        if (this.options.ecmaVersion >= 6) {
          prop.method = false;
          prop.shorthand = false;
          if (isPattern || refShorthandDefaultPos) {
            startPos = this.start;
            startLoc = this.startLoc;
          }
          if (!isPattern) isGenerator = this.eat(tt.star);
        }
        this.parsePropertyName(prop);
        this.parsePropertyValue(prop, isPattern, isGenerator, startPos, startLoc, refShorthandDefaultPos);
        this.checkPropClash(prop, propHash);
        node.properties.push(this.finishNode(prop, "Property"));
      }
      return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression");
    };
    
    pp.parsePropertyValue = function (prop, isPattern, isGenerator, startPos, startLoc, refShorthandDefaultPos) {
      if (this.eat(tt.colon)) {
        prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refShorthandDefaultPos);
        prop.kind = "init";
      } else if (this.options.ecmaVersion >= 6 && this.type === tt.parenL) {
        if (isPattern) this.unexpected();
        prop.kind = "init";
        prop.method = true;
        prop.value = this.parseMethod(isGenerator);
      } else if (this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" && (prop.key.name === "get" || prop.key.name === "set") && (this.type != tt.comma && this.type != tt.braceR)) {
        if (isGenerator || isPattern) this.unexpected();
        prop.kind = prop.key.name;
        this.parsePropertyName(prop);
        prop.value = this.parseMethod(false);
      } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
        prop.kind = "init";
        if (isPattern) {
          if (this.isKeyword(prop.key.name) || this.strict && (reservedWords.strictBind(prop.key.name) || reservedWords.strict(prop.key.name)) || !this.options.allowReserved && this.isReservedWord(prop.key.name)) this.raise(prop.key.start, "Binding " + prop.key.name);
          prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
        } else if (this.type === tt.eq && refShorthandDefaultPos) {
          if (!refShorthandDefaultPos.start) refShorthandDefaultPos.start = this.start;
          prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
        } else {
          prop.value = prop.key;
        }
        prop.shorthand = true;
      } else this.unexpected();
    };
    
    pp.parsePropertyName = function (prop) {
      if (this.options.ecmaVersion >= 6) {
        if (this.eat(tt.bracketL)) {
          prop.computed = true;
          prop.key = this.parseMaybeAssign();
          this.expect(tt.bracketR);
          return prop.key;
        } else {
          prop.computed = false;
        }
      }
      return prop.key = this.type === tt.num || this.type === tt.string ? this.parseExprAtom() : this.parseIdent(true);
    };
    
    // Initialize empty function node.
    
    pp.initFunction = function (node) {
      node.id = null;
      if (this.options.ecmaVersion >= 6) {
        node.generator = false;
        node.expression = false;
      }
    };
    
    // Parse object or class method.
    
    pp.parseMethod = function (isGenerator) {
      var node = this.startNode();
      this.initFunction(node);
      this.expect(tt.parenL);
      node.params = this.parseBindingList(tt.parenR, false, false);
      var allowExpressionBody = undefined;
      if (this.options.ecmaVersion >= 6) {
        node.generator = isGenerator;
        allowExpressionBody = true;
      } else {
        allowExpressionBody = false;
      }
      this.parseFunctionBody(node, allowExpressionBody);
      return this.finishNode(node, "FunctionExpression");
    };
    
    // Parse arrow function expression with given parameters.
    
    pp.parseArrowExpression = function (node, params) {
      this.initFunction(node);
      node.params = this.toAssignableList(params, true);
      this.parseFunctionBody(node, true);
      return this.finishNode(node, "ArrowFunctionExpression");
    };
    
    // Parse function body and check parameters.
    
    pp.parseFunctionBody = function (node, allowExpression) {
      var isExpression = allowExpression && this.type !== tt.braceL;
    
      if (isExpression) {
        node.body = this.parseMaybeAssign();
        node.expression = true;
      } else {
        // Start a new scope with regard to labels and the `inFunction`
        // flag (restore them to their old value afterwards).
        var oldInFunc = this.inFunction,
            oldInGen = this.inGenerator,
            oldLabels = this.labels;
        this.inFunction = true;this.inGenerator = node.generator;this.labels = [];
        node.body = this.parseBlock(true);
        node.expression = false;
        this.inFunction = oldInFunc;this.inGenerator = oldInGen;this.labels = oldLabels;
      }
    
      // If this is a strict mode function, verify that argument names
      // are not repeated, and it does not try to bind the words `eval`
      // or `arguments`.
      if (this.strict || !isExpression && node.body.body.length && this.isUseStrict(node.body.body[0])) {
        var nameHash = {},
            oldStrict = this.strict;
        this.strict = true;
        if (node.id) this.checkLVal(node.id, true);
        for (var i = 0; i < node.params.length; i++) {
          this.checkLVal(node.params[i], true, nameHash);
        }this.strict = oldStrict;
      }
    };
    
    // Parses a comma-separated list of expressions, and returns them as
    // an array. `close` is the token type that ends the list, and
    // `allowEmpty` can be turned on to allow subsequent commas with
    // nothing in between them to be parsed as `null` (which is needed
    // for array literals).
    
    pp.parseExprList = function (close, allowTrailingComma, allowEmpty, refShorthandDefaultPos) {
      var elts = [],
          first = true;
      while (!this.eat(close)) {
        if (!first) {
          this.expect(tt.comma);
          if (allowTrailingComma && this.afterTrailingComma(close)) break;
        } else first = false;
    
        if (allowEmpty && this.type === tt.comma) {
          elts.push(null);
        } else {
          if (this.type === tt.ellipsis) elts.push(this.parseSpread(refShorthandDefaultPos));else elts.push(this.parseMaybeAssign(false, refShorthandDefaultPos));
        }
      }
      return elts;
    };
    
    // Parse the next token as an identifier. If `liberal` is true (used
    // when parsing properties), it will also convert keywords into
    // identifiers.
    
    pp.parseIdent = function (liberal) {
      var node = this.startNode();
      if (liberal && this.options.allowReserved == "never") liberal = false;
      if (this.type === tt.name) {
        if (!liberal && (!this.options.allowReserved && this.isReservedWord(this.value) || this.strict && reservedWords.strict(this.value) && (this.options.ecmaVersion >= 6 || this.input.slice(this.start, this.end).indexOf("\\") == -1))) this.raise(this.start, "The keyword '" + this.value + "' is reserved");
        node.name = this.value;
      } else if (liberal && this.type.keyword) {
        node.name = this.type.keyword;
      } else {
        this.unexpected();
      }
      this.next();
      return this.finishNode(node, "Identifier");
    };
    
    // Parses yield expression inside generator.
    
    pp.parseYield = function () {
      var node = this.startNode();
      this.next();
      if (this.type == tt.semi || this.canInsertSemicolon() || this.type != tt.star && !this.type.startsExpr) {
        node.delegate = false;
        node.argument = null;
      } else {
        node.delegate = this.eat(tt.star);
        node.argument = this.parseMaybeAssign();
      }
      return this.finishNode(node, "YieldExpression");
    };
    
    // Parses array and generator comprehensions.
    
    pp.parseComprehension = function (node, isGenerator) {
      node.blocks = [];
      while (this.type === tt._for) {
        var block = this.startNode();
        this.next();
        this.expect(tt.parenL);
        block.left = this.parseBindingAtom();
        this.checkLVal(block.left, true);
        this.expectContextual("of");
        block.right = this.parseExpression();
        this.expect(tt.parenR);
        node.blocks.push(this.finishNode(block, "ComprehensionBlock"));
      }
      node.filter = this.eat(tt._if) ? this.parseParenExpression() : null;
      node.body = this.parseExpression();
      this.expect(isGenerator ? tt.parenR : tt.bracketR);
      node.generator = isGenerator;
      return this.finishNode(node, "ComprehensionExpression");
    };
    
    },{"./identifier":7,"./state":13,"./tokentype":17,"./util":18}],7:[function(_dereq_,module,exports){
    
    
    // Test whether a given character code starts an identifier.
    
    "use strict";
    
    exports.isIdentifierStart = isIdentifierStart;
    
    // Test whether a given character is part of an identifier.
    
    exports.isIdentifierChar = isIdentifierChar;
    exports.__esModule = true;
    // This is a trick taken from Esprima. It turns out that, on
    // non-Chrome browsers, to check whether a string is in a set, a
    // predicate containing a big ugly `switch` statement is faster than
    // a regular expression, and on Chrome the two are about on par.
    // This function uses `eval` (non-lexical) to produce such a
    // predicate from a space-separated string of words.
    //
    // It starts by sorting the words by length.
    
    function makePredicate(words) {
      words = words.split(" ");
      var f = "",
          cats = [];
      out: for (var i = 0; i < words.length; ++i) {
        for (var j = 0; j < cats.length; ++j) {
          if (cats[j][0].length == words[i].length) {
            cats[j].push(words[i]);
            continue out;
          }
        }cats.push([words[i]]);
      }
      function compareTo(arr) {
        if (arr.length == 1) {
          return f += "return str === " + JSON.stringify(arr[0]) + ";";
        }f += "switch(str){";
        for (var i = 0; i < arr.length; ++i) {
          f += "case " + JSON.stringify(arr[i]) + ":";
        }f += "return true}return false;";
      }
    
      // When there are more than three length categories, an outer
      // switch first dispatches on the lengths, to save on comparisons.
    
      if (cats.length > 3) {
        cats.sort(function (a, b) {
          return b.length - a.length;
        });
        f += "switch(str.length){";
        for (var i = 0; i < cats.length; ++i) {
          var cat = cats[i];
          f += "case " + cat[0].length + ":";
          compareTo(cat);
        }
        f += "}"
    
        // Otherwise, simply generate a flat `switch` statement.
    
        ;
      } else {
        compareTo(words);
      }
      return new Function("str", f);
    }
    
    // Reserved word lists for various dialects of the language
    
    var reservedWords = {
      3: makePredicate("abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile"),
      5: makePredicate("class enum extends super const export import"),
      6: makePredicate("enum await"),
      strict: makePredicate("implements interface let package private protected public static yield"),
      strictBind: makePredicate("eval arguments")
    };
    
    exports.reservedWords = reservedWords;
    // And the keywords
    
    var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";
    
    var keywords = {
      5: makePredicate(ecma5AndLessKeywords),
      6: makePredicate(ecma5AndLessKeywords + " let const class extends export import yield super")
    };
    
    exports.keywords = keywords;
    // ## Character categories
    
    // Big ugly regular expressions that match characters in the
    // whitespace, identifier, and identifier-start categories. These
    // are only applied when a character is found to actually have a
    // code point above 128.
    // Generated by `tools/generate-identifier-regex.js`.
    
    var nonASCIIidentifierStartChars = "ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠ-ࢲऄ-हऽॐक़-ॡॱ-ঀঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤞᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕ℘-ℝℤΩℨK-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞ々-〇〡-〩〱-〵〸-〼ぁ-ゖ゛-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚝꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞭꞰꞱꟷ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꩾ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭟꭤꭥꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ";
    var nonASCIIidentifierChars = "‌‍·̀-ͯ·҃-֑҇-ׇֽֿׁׂׅׄؐ-ًؚ-٩ٰۖ-ۜ۟-۪ۤۧۨ-ۭ۰-۹ܑܰ-݊ަ-ް߀-߉߫-߳ࠖ-࠙ࠛ-ࠣࠥ-ࠧࠩ-࡙࠭-࡛ࣤ-ःऺ-़ा-ॏ॑-ॗॢॣ०-९ঁ-ঃ়া-ৄেৈো-্ৗৢৣ০-৯ਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢૣ૦-૯ଁ-ଃ଼ା-ୄେୈୋ-୍ୖୗୢୣ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఀ-ఃా-ౄె-ైొ-్ౕౖౢౣ౦-౯ಁ-ಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢೣ೦-೯ഁ-ഃാ-ൄെ-ൈൊ-്ൗൢൣ൦-൯ංඃ්ා-ුූෘ-ෟ෦-෯ෲෳัิ-ฺ็-๎๐-๙ັິ-ູົຼ່-ໍ໐-໙༘༙༠-༩༹༵༷༾༿ཱ-྄྆྇ྍ-ྗྙ-ྼ࿆ါ-ှ၀-၉ၖ-ၙၞ-ၠၢ-ၤၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟፩-፱ᜒ-᜔ᜲ-᜴ᝒᝓᝲᝳ឴-៓៝០-៩᠋-᠍᠐-᠙ᢩᤠ-ᤫᤰ-᤻᥆-᥏ᦰ-ᧀᧈᧉ᧐-᧚ᨗ-ᨛᩕ-ᩞ᩠-᩿᩼-᪉᪐-᪙᪰-᪽ᬀ-ᬄ᬴-᭄᭐-᭙᭫-᭳ᮀ-ᮂᮡ-ᮭ᮰-᮹᯦-᯳ᰤ-᰷᱀-᱉᱐-᱙᳐-᳔᳒-᳨᳭ᳲ-᳴᳸᳹᷀-᷵᷼-᷿‿⁀⁔⃐-⃥⃜⃡-⃰⳯-⵿⳱ⷠ-〪ⷿ-゙゚〯꘠-꘩꙯ꙴ-꙽ꚟ꛰꛱ꠂ꠆ꠋꠣ-ꠧꢀꢁꢴ-꣄꣐-꣙꣠-꣱꤀-꤉ꤦ-꤭ꥇ-꥓ꦀ-ꦃ꦳-꧀꧐-꧙ꧥ꧰-꧹ꨩ-ꨶꩃꩌꩍ꩐-꩙ꩻ-ꩽꪰꪲ-ꪴꪷꪸꪾ꪿꫁ꫫ-ꫯꫵ꫶ꯣ-ꯪ꯬꯭꯰-꯹ﬞ︀-️︠-︭︳︴﹍-﹏０-９＿";
    
    var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
    var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");
    
    nonASCIIidentifierStartChars = nonASCIIidentifierChars = null;
    
    // These are a run-length and offset encoded representation of the
    // >0xffff code points that are a valid part of identifiers. The
    // offset starts at 0x10000, and each pair of numbers represents an
    // offset to the next range, and then a size of the range. They were
    // generated by tools/generate-identifier-regex.js
    var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 17, 26, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 99, 39, 9, 51, 157, 310, 10, 21, 11, 7, 153, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 98, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 26, 45, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 955, 52, 76, 44, 33, 24, 27, 35, 42, 34, 4, 0, 13, 47, 15, 3, 22, 0, 38, 17, 2, 24, 133, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 32, 4, 287, 47, 21, 1, 2, 0, 185, 46, 82, 47, 21, 0, 60, 42, 502, 63, 32, 0, 449, 56, 1288, 920, 104, 110, 2962, 1070, 13266, 568, 8, 30, 114, 29, 19, 47, 17, 3, 32, 20, 6, 18, 881, 68, 12, 0, 67, 12, 16481, 1, 3071, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 4149, 196, 1340, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42710, 42, 4148, 12, 221, 16355, 541];
    var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 1306, 2, 54, 14, 32, 9, 16, 3, 46, 10, 54, 9, 7, 2, 37, 13, 2, 9, 52, 0, 13, 2, 49, 13, 16, 9, 83, 11, 168, 11, 6, 9, 8, 2, 57, 0, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 316, 19, 13, 9, 214, 6, 3, 8, 112, 16, 16, 9, 82, 12, 9, 9, 535, 9, 20855, 9, 135, 4, 60, 6, 26, 9, 1016, 45, 17, 3, 19723, 1, 5319, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 4305, 6, 792618, 239];
    
    // This has a complexity linear to the value of the code. The
    // assumption is that looking up astral identifier characters is
    // rare.
    function isInAstralSet(code, set) {
      var pos = 65536;
      for (var i = 0; i < set.length; i += 2) {
        pos += set[i];
        if (pos > code) {
          return false;
        }pos += set[i + 1];
        if (pos >= code) {
          return true;
        }
      }
    }
    function isIdentifierStart(code, astral) {
      if (code < 65) {
        return code === 36;
      }if (code < 91) {
        return true;
      }if (code < 97) {
        return code === 95;
      }if (code < 123) {
        return true;
      }if (code <= 65535) {
        return code >= 170 && nonASCIIidentifierStart.test(String.fromCharCode(code));
      }if (astral === false) {
        return false;
      }return isInAstralSet(code, astralIdentifierStartCodes);
    }
    
    function isIdentifierChar(code, astral) {
      if (code < 48) {
        return code === 36;
      }if (code < 58) {
        return true;
      }if (code < 65) {
        return false;
      }if (code < 91) {
        return true;
      }if (code < 97) {
        return code === 95;
      }if (code < 123) {
        return true;
      }if (code <= 65535) {
        return code >= 170 && nonASCIIidentifier.test(String.fromCharCode(code));
      }if (astral === false) {
        return false;
      }return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes);
    }
    
    },{}],8:[function(_dereq_,module,exports){
    "use strict";
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
    // The `getLineInfo` function is mostly useful when the
    // `locations` option is off (for performance reasons) and you
    // want to find the line/column position for a given character
    // offset. `input` should be the code string that the offset refers
    // into.
    
    exports.getLineInfo = getLineInfo;
    exports.__esModule = true;
    
    var Parser = _dereq_("./state").Parser;
    
    var lineBreakG = _dereq_("./whitespace").lineBreakG;
    
    var deprecate = _dereq_("util").deprecate;
    
    // These are used when `options.locations` is on, for the
    // `startLoc` and `endLoc` properties.
    
    var Position = exports.Position = (function () {
      function Position(line, col) {
        _classCallCheck(this, Position);
    
        this.line = line;
        this.column = col;
      }
    
      Position.prototype.offset = function offset(n) {
        return new Position(this.line, this.column + n);
      };
    
      return Position;
    })();
    
    var SourceLocation = exports.SourceLocation = function SourceLocation(p, start, end) {
      _classCallCheck(this, SourceLocation);
    
      this.start = start;
      this.end = end;
      if (p.sourceFile !== null) this.source = p.sourceFile;
    };
    
    function getLineInfo(input, offset) {
      for (var line = 1, cur = 0;;) {
        lineBreakG.lastIndex = cur;
        var match = lineBreakG.exec(input);
        if (match && match.index < offset) {
          ++line;
          cur = match.index + match[0].length;
        } else {
          return new Position(line, offset - cur);
        }
      }
    }
    
    var pp = Parser.prototype;
    
    // This function is used to raise exceptions on parse errors. It
    // takes an offset integer (into the current `input`) to indicate
    // the location of the error, attaches the position to the end
    // of the error message, and then raises a `SyntaxError` with that
    // message.
    
    pp.raise = function (pos, message) {
      var loc = getLineInfo(this.input, pos);
      message += " (" + loc.line + ":" + loc.column + ")";
      var err = new SyntaxError(message);
      err.pos = pos;err.loc = loc;err.raisedAt = this.pos;
      throw err;
    };
    
    pp.curPosition = function () {
      return new Position(this.curLine, this.pos - this.lineStart);
    };
    
    pp.markPosition = function () {
      return this.options.locations ? [this.start, this.startLoc] : this.start;
    };
    
    },{"./state":13,"./whitespace":19,"util":5}],9:[function(_dereq_,module,exports){
    "use strict";
    
    var tt = _dereq_("./tokentype").types;
    
    var Parser = _dereq_("./state").Parser;
    
    var reservedWords = _dereq_("./identifier").reservedWords;
    
    var has = _dereq_("./util").has;
    
    var pp = Parser.prototype;
    
    // Convert existing expression atom to assignable pattern
    // if possible.
    
    pp.toAssignable = function (node, isBinding) {
      if (this.options.ecmaVersion >= 6 && node) {
        switch (node.type) {
          case "Identifier":
          case "ObjectPattern":
          case "ArrayPattern":
          case "AssignmentPattern":
            break;
    
          case "ObjectExpression":
            node.type = "ObjectPattern";
            for (var i = 0; i < node.properties.length; i++) {
              var prop = node.properties[i];
              if (prop.kind !== "init") this.raise(prop.key.start, "Object pattern can't contain getter or setter");
              this.toAssignable(prop.value, isBinding);
            }
            break;
    
          case "ArrayExpression":
            node.type = "ArrayPattern";
            this.toAssignableList(node.elements, isBinding);
            break;
    
          case "AssignmentExpression":
            if (node.operator === "=") {
              node.type = "AssignmentPattern";
            } else {
              this.raise(node.left.end, "Only '=' operator can be used for specifying default value.");
            }
            break;
    
          case "ParenthesizedExpression":
            node.expression = this.toAssignable(node.expression, isBinding);
            break;
    
          case "MemberExpression":
            if (!isBinding) break;
    
          default:
            this.raise(node.start, "Assigning to rvalue");
        }
      }
      return node;
    };
    
    // Convert list of expression atoms to binding list.
    
    pp.toAssignableList = function (exprList, isBinding) {
      var end = exprList.length;
      if (end) {
        var last = exprList[end - 1];
        if (last && last.type == "RestElement") {
          --end;
        } else if (last && last.type == "SpreadElement") {
          last.type = "RestElement";
          var arg = last.argument;
          this.toAssignable(arg, isBinding);
          if (arg.type !== "Identifier" && arg.type !== "MemberExpression" && arg.type !== "ArrayPattern") this.unexpected(arg.start);
          --end;
        }
      }
      for (var i = 0; i < end; i++) {
        var elt = exprList[i];
        if (elt) this.toAssignable(elt, isBinding);
      }
      return exprList;
    };
    
    // Parses spread element.
    
    pp.parseSpread = function (refShorthandDefaultPos) {
      var node = this.startNode();
      this.next();
      node.argument = this.parseMaybeAssign(refShorthandDefaultPos);
      return this.finishNode(node, "SpreadElement");
    };
    
    pp.parseRest = function () {
      var node = this.startNode();
      this.next();
      node.argument = this.type === tt.name || this.type === tt.bracketL ? this.parseBindingAtom() : this.unexpected();
      return this.finishNode(node, "RestElement");
    };
    
    // Parses lvalue (assignable) atom.
    
    pp.parseBindingAtom = function () {
      if (this.options.ecmaVersion < 6) return this.parseIdent();
      switch (this.type) {
        case tt.name:
          return this.parseIdent();
    
        case tt.bracketL:
          var node = this.startNode();
          this.next();
          node.elements = this.parseBindingList(tt.bracketR, true, true);
          return this.finishNode(node, "ArrayPattern");
    
        case tt.braceL:
          return this.parseObj(true);
    
        default:
          this.unexpected();
      }
    };
    
    pp.parseBindingList = function (close, allowEmpty, allowTrailingComma) {
      var elts = [],
          first = true;
      while (!this.eat(close)) {
        if (first) first = false;else this.expect(tt.comma);
        if (allowEmpty && this.type === tt.comma) {
          elts.push(null);
        } else if (allowTrailingComma && this.afterTrailingComma(close)) {
          break;
        } else if (this.type === tt.ellipsis) {
          var rest = this.parseRest();
          this.parseBindingListItem(rest);
          elts.push(rest);
          this.expect(close);
          break;
        } else {
          var elem = this.parseMaybeDefault(this.start, this.startLoc);
          this.parseBindingListItem(elem);
          elts.push(elem);
        }
      }
      return elts;
    };
    
    pp.parseBindingListItem = function (param) {
      return param;
    };
    
    // Parses assignment pattern around given atom if possible.
    
    pp.parseMaybeDefault = function (startPos, startLoc, left) {
      if (Array.isArray(startPos)) {
        if (this.options.locations && noCalls === undefined) {
          // shift arguments to left by one
          left = startLoc;
          // flatten startPos
          startLoc = startPos[1];
          startPos = startPos[0];
        }
      }
      left = left || this.parseBindingAtom();
      if (!this.eat(tt.eq)) return left;
      var node = this.startNodeAt(startPos, startLoc);
      node.operator = "=";
      node.left = left;
      node.right = this.parseMaybeAssign();
      return this.finishNode(node, "AssignmentPattern");
    };
    
    // Verify that a node is an lval — something that can be assigned
    // to.
    
    pp.checkLVal = function (expr, isBinding, checkClashes) {
      switch (expr.type) {
        case "Identifier":
          if (this.strict && (reservedWords.strictBind(expr.name) || reservedWords.strict(expr.name))) this.raise(expr.start, (isBinding ? "Binding " : "Assigning to ") + expr.name + " in strict mode");
          if (checkClashes) {
            if (has(checkClashes, expr.name)) this.raise(expr.start, "Argument name clash in strict mode");
            checkClashes[expr.name] = true;
          }
          break;
    
        case "MemberExpression":
          if (isBinding) this.raise(expr.start, (isBinding ? "Binding" : "Assigning to") + " member expression");
          break;
    
        case "ObjectPattern":
          for (var i = 0; i < expr.properties.length; i++) {
            this.checkLVal(expr.properties[i].value, isBinding, checkClashes);
          }break;
    
        case "ArrayPattern":
          for (var i = 0; i < expr.elements.length; i++) {
            var elem = expr.elements[i];
            if (elem) this.checkLVal(elem, isBinding, checkClashes);
          }
          break;
    
        case "AssignmentPattern":
          this.checkLVal(expr.left, isBinding, checkClashes);
          break;
    
        case "RestElement":
          this.checkLVal(expr.argument, isBinding, checkClashes);
          break;
    
        case "ParenthesizedExpression":
          this.checkLVal(expr.expression, isBinding, checkClashes);
          break;
    
        default:
          this.raise(expr.start, (isBinding ? "Binding" : "Assigning to") + " rvalue");
      }
    };
    
    },{"./identifier":7,"./state":13,"./tokentype":17,"./util":18}],10:[function(_dereq_,module,exports){
    "use strict";
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
    exports.__esModule = true;
    
    var Parser = _dereq_("./state").Parser;
    
    var SourceLocation = _dereq_("./location").SourceLocation;
    
    // Start an AST node, attaching a start offset.
    
    var pp = Parser.prototype;
    
    var Node = exports.Node = function Node() {
      _classCallCheck(this, Node);
    };
    
    pp.startNode = function () {
      var node = new Node();
      node.start = this.start;
      if (this.options.locations) node.loc = new SourceLocation(this, this.startLoc);
      if (this.options.directSourceFile) node.sourceFile = this.options.directSourceFile;
      if (this.options.ranges) node.range = [this.start, 0];
      return node;
    };
    
    pp.startNodeAt = function (pos, loc) {
      var node = new Node();
      if (Array.isArray(pos)) {
        if (this.options.locations && loc === undefined) {
          // flatten pos
          loc = pos[1];
          pos = pos[0];
        }
      }
      node.start = pos;
      if (this.options.locations) node.loc = new SourceLocation(this, loc);
      if (this.options.directSourceFile) node.sourceFile = this.options.directSourceFile;
      if (this.options.ranges) node.range = [pos, 0];
      return node;
    };
    
    // Finish an AST node, adding `type` and `end` properties.
    
    pp.finishNode = function (node, type) {
      node.type = type;
      node.end = this.lastTokEnd;
      if (this.options.locations) node.loc.end = this.lastTokEndLoc;
      if (this.options.ranges) node.range[1] = this.lastTokEnd;
      return node;
    };
    
    // Finish node at given position
    
    pp.finishNodeAt = function (node, type, pos, loc) {
      node.type = type;
      if (Array.isArray(pos)) {
        if (this.options.locations && loc === undefined) {
          // flatten pos
          loc = pos[1];
          pos = pos[0];
        }
      }
      node.end = pos;
      if (this.options.locations) node.loc.end = loc;
      if (this.options.ranges) node.range[1] = pos;
      return node;
    };
    
    },{"./location":8,"./state":13}],11:[function(_dereq_,module,exports){
    
    
    // Interpret and default an options object
    
    "use strict";
    
    exports.getOptions = getOptions;
    exports.__esModule = true;
    
    var _util = _dereq_("./util");
    
    var has = _util.has;
    var isArray = _util.isArray;
    
    var SourceLocation = _dereq_("./location").SourceLocation;
    
    // A second optional argument can be given to further configure
    // the parser process. These options are recognized:
    
    var defaultOptions = {
      // `ecmaVersion` indicates the ECMAScript version to parse. Must
      // be either 3, or 5, or 6. This influences support for strict
      // mode, the set of reserved words, support for getters and
      // setters and other features.
      ecmaVersion: 5,
      // Source type ("script" or "module") for different semantics
      sourceType: "script",
      // `onInsertedSemicolon` can be a callback that will be called
      // when a semicolon is automatically inserted. It will be passed
      // th position of the comma as an offset, and if `locations` is
      // enabled, it is given the location as a `{line, column}` object
      // as second argument.
      onInsertedSemicolon: null,
      // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
      // trailing commas.
      onTrailingComma: null,
      // By default, reserved words are not enforced. Disable
      // `allowReserved` to enforce them. When this option has the
      // value "never", reserved words and keywords can also not be
      // used as property names.
      allowReserved: true,
      // When enabled, a return at the top level is not considered an
      // error.
      allowReturnOutsideFunction: false,
      // When enabled, import/export statements are not constrained to
      // appearing at the top of the program.
      allowImportExportEverywhere: false,
      // When enabled, hashbang directive in the beginning of file
      // is allowed and treated as a line comment.
      allowHashBang: false,
      // When `locations` is on, `loc` properties holding objects with
      // `start` and `end` properties in `{line, column}` form (with
      // line being 1-based and column 0-based) will be attached to the
      // nodes.
      locations: false,
      // A function can be passed as `onToken` option, which will
      // cause Acorn to call that function with object in the same
      // format as tokenize() returns. Note that you are not
      // allowed to call the parser from the callback—that will
      // corrupt its internal state.
      onToken: null,
      // A function can be passed as `onComment` option, which will
      // cause Acorn to call that function with `(block, text, start,
      // end)` parameters whenever a comment is skipped. `block` is a
      // boolean indicating whether this is a block (`/* */`) comment,
      // `text` is the content of the comment, and `start` and `end` are
      // character offsets that denote the start and end of the comment.
      // When the `locations` option is on, two more parameters are
      // passed, the full `{line, column}` locations of the start and
      // end of the comments. Note that you are not allowed to call the
      // parser from the callback—that will corrupt its internal state.
      onComment: null,
      // Nodes have their start and end characters offsets recorded in
      // `start` and `end` properties (directly on the node, rather than
      // the `loc` object, which holds line/column data. To also add a
      // [semi-standardized][range] `range` property holding a `[start,
      // end]` array with the same numbers, set the `ranges` option to
      // `true`.
      //
      // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
      ranges: false,
      // It is possible to parse multiple files into a single AST by
      // passing the tree produced by parsing the first file as
      // `program` option in subsequent parses. This will add the
      // toplevel forms of the parsed file to the `Program` (top) node
      // of an existing parse tree.
      program: null,
      // When `locations` is on, you can pass this to record the source
      // file in every node's `loc` object.
      sourceFile: null,
      // This value, if given, is stored in every node, whether
      // `locations` is on or off.
      directSourceFile: null,
      // When enabled, parenthesized expressions are represented by
      // (non-standard) ParenthesizedExpression nodes
      preserveParens: false,
      plugins: {}
    };exports.defaultOptions = defaultOptions;
    
    function getOptions(opts) {
      var options = {};
      for (var opt in defaultOptions) {
        options[opt] = opts && has(opts, opt) ? opts[opt] : defaultOptions[opt];
      }if (isArray(options.onToken)) {
        (function () {
          var tokens = options.onToken;
          options.onToken = function (token) {
            return tokens.push(token);
          };
        })();
      }
      if (isArray(options.onComment)) options.onComment = pushComment(options, options.onComment);
    
      return options;
    }
    
    function pushComment(options, array) {
      return function (block, text, start, end, startLoc, endLoc) {
        var comment = {
          type: block ? "Block" : "Line",
          value: text,
          start: start,
          end: end
        };
        if (options.locations) comment.loc = new SourceLocation(this, startLoc, endLoc);
        if (options.ranges) comment.range = [start, end];
        array.push(comment);
      };
    }
    
    },{"./location":8,"./util":18}],12:[function(_dereq_,module,exports){
    "use strict";
    
    var tt = _dereq_("./tokentype").types;
    
    var Parser = _dereq_("./state").Parser;
    
    var lineBreak = _dereq_("./whitespace").lineBreak;
    
    var pp = Parser.prototype;
    
    // ## Parser utilities
    
    // Test whether a statement node is the string literal `"use strict"`.
    
    pp.isUseStrict = function (stmt) {
      return this.options.ecmaVersion >= 5 && stmt.type === "ExpressionStatement" && stmt.expression.type === "Literal" && stmt.expression.value === "use strict";
    };
    
    // Predicate that tests whether the next token is of the given
    // type, and if yes, consumes it as a side effect.
    
    pp.eat = function (type) {
      if (this.type === type) {
        this.next();
        return true;
      } else {
        return false;
      }
    };
    
    // Tests whether parsed token is a contextual keyword.
    
    pp.isContextual = function (name) {
      return this.type === tt.name && this.value === name;
    };
    
    // Consumes contextual keyword if possible.
    
    pp.eatContextual = function (name) {
      return this.value === name && this.eat(tt.name);
    };
    
    // Asserts that following token is given contextual keyword.
    
    pp.expectContextual = function (name) {
      if (!this.eatContextual(name)) this.unexpected();
    };
    
    // Test whether a semicolon can be inserted at the current position.
    
    pp.canInsertSemicolon = function () {
      return this.type === tt.eof || this.type === tt.braceR || lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
    };
    
    pp.insertSemicolon = function () {
      if (this.canInsertSemicolon()) {
        if (this.options.onInsertedSemicolon) this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc);
        return true;
      }
    };
    
    // Consume a semicolon, or, failing that, see if we are allowed to
    // pretend that there is a semicolon at this position.
    
    pp.semicolon = function () {
      if (!this.eat(tt.semi) && !this.insertSemicolon()) this.unexpected();
    };
    
    pp.afterTrailingComma = function (tokType) {
      if (this.type == tokType) {
        if (this.options.onTrailingComma) this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc);
        this.next();
        return true;
      }
    };
    
    // Expect a token of a given type. If found, consume it, otherwise,
    // raise an unexpected token error.
    
    pp.expect = function (type) {
      this.eat(type) || this.unexpected();
    };
    
    // Raise an unexpected token error.
    
    pp.unexpected = function (pos) {
      this.raise(pos != null ? pos : this.start, "Unexpected token");
    };
    
    },{"./state":13,"./tokentype":17,"./whitespace":19}],13:[function(_dereq_,module,exports){
    "use strict";
    
    exports.Parser = Parser;
    exports.__esModule = true;
    
    var _identifier = _dereq_("./identifier");
    
    var reservedWords = _identifier.reservedWords;
    var keywords = _identifier.keywords;
    
    var tt = _dereq_("./tokentype").types;
    
    var lineBreak = _dereq_("./whitespace").lineBreak;
    
    function Parser(options, input, startPos) {
      this.options = options;
      this.sourceFile = this.options.sourceFile || null;
      this.isKeyword = keywords[this.options.ecmaVersion >= 6 ? 6 : 5];
      this.isReservedWord = reservedWords[this.options.ecmaVersion];
      this.input = input;
    
      // Load plugins
      this.loadPlugins(this.options.plugins);
    
      // Set up token state
    
      // The current position of the tokenizer in the input.
      if (startPos) {
        this.pos = startPos;
        this.lineStart = Math.max(0, this.input.lastIndexOf("\n", startPos));
        this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
      } else {
        this.pos = this.lineStart = 0;
        this.curLine = 1;
      }
    
      // Properties of the current token:
      // Its type
      this.type = tt.eof;
      // For tokens that include more information than their type, the value
      this.value = null;
      // Its start and end offset
      this.start = this.end = this.pos;
      // And, if locations are used, the {line, column} object
      // corresponding to those offsets
      this.startLoc = this.endLoc = null;
    
      // Position information for the previous token
      this.lastTokEndLoc = this.lastTokStartLoc = null;
      this.lastTokStart = this.lastTokEnd = this.pos;
    
      // The context stack is used to superficially track syntactic
      // context to predict whether a regular expression is allowed in a
      // given position.
      this.context = this.initialContext();
      this.exprAllowed = true;
    
      // Figure out if it's a module code.
      this.strict = this.inModule = this.options.sourceType === "module";
    
      // Used to signify the start of a potential arrow function
      this.potentialArrowAt = -1;
    
      // Flags to track whether we are in a function, a generator.
      this.inFunction = this.inGenerator = false;
      // Labels in scope.
      this.labels = [];
    
      // If enabled, skip leading hashbang line.
      if (this.pos === 0 && this.options.allowHashBang && this.input.slice(0, 2) === "#!") this.skipLineComment(2);
    }
    
    Parser.prototype.extend = function (name, f) {
      this[name] = f(this[name]);
    };
    
    // Registered plugins
    
    var plugins = {};
    
    exports.plugins = plugins;
    Parser.prototype.loadPlugins = function (plugins) {
      for (var _name in plugins) {
        var plugin = exports.plugins[_name];
        if (!plugin) throw new Error("Plugin '" + _name + "' not found");
        plugin(this, plugins[_name]);
      }
    };
    
    },{"./identifier":7,"./tokentype":17,"./whitespace":19}],14:[function(_dereq_,module,exports){
    "use strict";
    
    var tt = _dereq_("./tokentype").types;
    
    var Parser = _dereq_("./state").Parser;
    
    var lineBreak = _dereq_("./whitespace").lineBreak;
    
    var pp = Parser.prototype;
    
    // ### Statement parsing
    
    // Parse a program. Initializes the parser, reads any number of
    // statements, and wraps them in a Program node.  Optionally takes a
    // `program` argument.  If present, the statements will be appended
    // to its body instead of creating a new node.
    
    pp.parseTopLevel = function (node) {
      var first = true;
      if (!node.body) node.body = [];
      while (this.type !== tt.eof) {
        var stmt = this.parseStatement(true, true);
        node.body.push(stmt);
        if (first && this.isUseStrict(stmt)) this.setStrict(true);
        first = false;
      }
      this.next();
      if (this.options.ecmaVersion >= 6) {
        node.sourceType = this.options.sourceType;
      }
      return this.finishNode(node, "Program");
    };
    
    var loopLabel = { kind: "loop" },
        switchLabel = { kind: "switch" };
    
    // Parse a single statement.
    //
    // If expecting a statement and finding a slash operator, parse a
    // regular expression literal. This is to handle cases like
    // `if (foo) /blah/.exec(foo)`, where looking at the previous token
    // does not help.
    
    pp.parseStatement = function (declaration, topLevel) {
      var starttype = this.type,
          node = this.startNode();
    
      // Most types of statements are recognized by the keyword they
      // start with. Many are trivial to parse, some require a bit of
      // complexity.
    
      switch (starttype) {
        case tt._break:case tt._continue:
          return this.parseBreakContinueStatement(node, starttype.keyword);
        case tt._debugger:
          return this.parseDebuggerStatement(node);
        case tt._do:
          return this.parseDoStatement(node);
        case tt._for:
          return this.parseForStatement(node);
        case tt._function:
          if (!declaration && this.options.ecmaVersion >= 6) this.unexpected();
          return this.parseFunctionStatement(node);
        case tt._class:
          if (!declaration) this.unexpected();
          return this.parseClass(node, true);
        case tt._if:
          return this.parseIfStatement(node);
        case tt._return:
          return this.parseReturnStatement(node);
        case tt._switch:
          return this.parseSwitchStatement(node);
        case tt._throw:
          return this.parseThrowStatement(node);
        case tt._try:
          return this.parseTryStatement(node);
        case tt._let:case tt._const:
          if (!declaration) this.unexpected(); // NOTE: falls through to _var
        case tt._var:
          return this.parseVarStatement(node, starttype);
        case tt._while:
          return this.parseWhileStatement(node);
        case tt._with:
          return this.parseWithStatement(node);
        case tt.braceL:
          return this.parseBlock();
        case tt.semi:
          return this.parseEmptyStatement(node);
        case tt._export:
        case tt._import:
          if (!this.options.allowImportExportEverywhere) {
            if (!topLevel) this.raise(this.start, "'import' and 'export' may only appear at the top level");
            if (!this.inModule) this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'");
          }
          return starttype === tt._import ? this.parseImport(node) : this.parseExport(node);
    
        // If the statement does not start with a statement keyword or a
        // brace, it's an ExpressionStatement or LabeledStatement. We
        // simply start parsing an expression, and afterwards, if the
        // next token is a colon and the expression was a simple
        // Identifier node, we switch to interpreting it as a label.
        default:
          var maybeName = this.value,
              expr = this.parseExpression();
          if (starttype === tt.name && expr.type === "Identifier" && this.eat(tt.colon)) return this.parseLabeledStatement(node, maybeName, expr);else return this.parseExpressionStatement(node, expr);
      }
    };
    
    pp.parseBreakContinueStatement = function (node, keyword) {
      var isBreak = keyword == "break";
      this.next();
      if (this.eat(tt.semi) || this.insertSemicolon()) node.label = null;else if (this.type !== tt.name) this.unexpected();else {
        node.label = this.parseIdent();
        this.semicolon();
      }
    
      // Verify that there is an actual destination to break or
      // continue to.
      for (var i = 0; i < this.labels.length; ++i) {
        var lab = this.labels[i];
        if (node.label == null || lab.name === node.label.name) {
          if (lab.kind != null && (isBreak || lab.kind === "loop")) break;
          if (node.label && isBreak) break;
        }
      }
      if (i === this.labels.length) this.raise(node.start, "Unsyntactic " + keyword);
      return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
    };
    
    pp.parseDebuggerStatement = function (node) {
      this.next();
      this.semicolon();
      return this.finishNode(node, "DebuggerStatement");
    };
    
    pp.parseDoStatement = function (node) {
      this.next();
      this.labels.push(loopLabel);
      node.body = this.parseStatement(false);
      this.labels.pop();
      this.expect(tt._while);
      node.test = this.parseParenExpression();
      if (this.options.ecmaVersion >= 6) this.eat(tt.semi);else this.semicolon();
      return this.finishNode(node, "DoWhileStatement");
    };
    
    // Disambiguating between a `for` and a `for`/`in` or `for`/`of`
    // loop is non-trivial. Basically, we have to parse the init `var`
    // statement or expression, disallowing the `in` operator (see
    // the second parameter to `parseExpression`), and then check
    // whether the next token is `in` or `of`. When there is no init
    // part (semicolon immediately after the opening parenthesis), it
    // is a regular `for` loop.
    
    pp.parseForStatement = function (node) {
      this.next();
      this.labels.push(loopLabel);
      this.expect(tt.parenL);
      if (this.type === tt.semi) return this.parseFor(node, null);
      if (this.type === tt._var || this.type === tt._let || this.type === tt._const) {
        var _init = this.startNode(),
            varKind = this.type;
        this.next();
        this.parseVar(_init, true, varKind);
        this.finishNode(_init, "VariableDeclaration");
        if ((this.type === tt._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) && _init.declarations.length === 1 && !(varKind !== tt._var && _init.declarations[0].init)) return this.parseForIn(node, _init);
        return this.parseFor(node, _init);
      }
      var refShorthandDefaultPos = { start: 0 };
      var init = this.parseExpression(true, refShorthandDefaultPos);
      if (this.type === tt._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) {
        this.toAssignable(init);
        this.checkLVal(init);
        return this.parseForIn(node, init);
      } else if (refShorthandDefaultPos.start) {
        this.unexpected(refShorthandDefaultPos.start);
      }
      return this.parseFor(node, init);
    };
    
    pp.parseFunctionStatement = function (node) {
      this.next();
      return this.parseFunction(node, true);
    };
    
    pp.parseIfStatement = function (node) {
      this.next();
      node.test = this.parseParenExpression();
      node.consequent = this.parseStatement(false);
      node.alternate = this.eat(tt._else) ? this.parseStatement(false) : null;
      return this.finishNode(node, "IfStatement");
    };
    
    pp.parseReturnStatement = function (node) {
      if (!this.inFunction && !this.options.allowReturnOutsideFunction) this.raise(this.start, "'return' outside of function");
      this.next();
    
      // In `return` (and `break`/`continue`), the keywords with
      // optional arguments, we eagerly look for a semicolon or the
      // possibility to insert one.
    
      if (this.eat(tt.semi) || this.insertSemicolon()) node.argument = null;else {
        node.argument = this.parseExpression();this.semicolon();
      }
      return this.finishNode(node, "ReturnStatement");
    };
    
    pp.parseSwitchStatement = function (node) {
      this.next();
      node.discriminant = this.parseParenExpression();
      node.cases = [];
      this.expect(tt.braceL);
      this.labels.push(switchLabel);
    
      // Statements under must be grouped (by label) in SwitchCase
      // nodes. `cur` is used to keep the node that we are currently
      // adding statements to.
    
      for (var cur, sawDefault; this.type != tt.braceR;) {
        if (this.type === tt._case || this.type === tt._default) {
          var isCase = this.type === tt._case;
          if (cur) this.finishNode(cur, "SwitchCase");
          node.cases.push(cur = this.startNode());
          cur.consequent = [];
          this.next();
          if (isCase) {
            cur.test = this.parseExpression();
          } else {
            if (sawDefault) this.raise(this.lastTokStart, "Multiple default clauses");
            sawDefault = true;
            cur.test = null;
          }
          this.expect(tt.colon);
        } else {
          if (!cur) this.unexpected();
          cur.consequent.push(this.parseStatement(true));
        }
      }
      if (cur) this.finishNode(cur, "SwitchCase");
      this.next(); // Closing brace
      this.labels.pop();
      return this.finishNode(node, "SwitchStatement");
    };
    
    pp.parseThrowStatement = function (node) {
      this.next();
      if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) this.raise(this.lastTokEnd, "Illegal newline after throw");
      node.argument = this.parseExpression();
      this.semicolon();
      return this.finishNode(node, "ThrowStatement");
    };
    
    // Reused empty array added for node fields that are always empty.
    
    var empty = [];
    
    pp.parseTryStatement = function (node) {
      this.next();
      node.block = this.parseBlock();
      node.handler = null;
      if (this.type === tt._catch) {
        var clause = this.startNode();
        this.next();
        this.expect(tt.parenL);
        clause.param = this.parseBindingAtom();
        this.checkLVal(clause.param, true);
        this.expect(tt.parenR);
        clause.guard = null;
        clause.body = this.parseBlock();
        node.handler = this.finishNode(clause, "CatchClause");
      }
      node.guardedHandlers = empty;
      node.finalizer = this.eat(tt._finally) ? this.parseBlock() : null;
      if (!node.handler && !node.finalizer) this.raise(node.start, "Missing catch or finally clause");
      return this.finishNode(node, "TryStatement");
    };
    
    pp.parseVarStatement = function (node, kind) {
      this.next();
      this.parseVar(node, false, kind);
      this.semicolon();
      return this.finishNode(node, "VariableDeclaration");
    };
    
    pp.parseWhileStatement = function (node) {
      this.next();
      node.test = this.parseParenExpression();
      this.labels.push(loopLabel);
      node.body = this.parseStatement(false);
      this.labels.pop();
      return this.finishNode(node, "WhileStatement");
    };
    
    pp.parseWithStatement = function (node) {
      if (this.strict) this.raise(this.start, "'with' in strict mode");
      this.next();
      node.object = this.parseParenExpression();
      node.body = this.parseStatement(false);
      return this.finishNode(node, "WithStatement");
    };
    
    pp.parseEmptyStatement = function (node) {
      this.next();
      return this.finishNode(node, "EmptyStatement");
    };
    
    pp.parseLabeledStatement = function (node, maybeName, expr) {
      for (var i = 0; i < this.labels.length; ++i) {
        if (this.labels[i].name === maybeName) this.raise(expr.start, "Label '" + maybeName + "' is already declared");
      }var kind = this.type.isLoop ? "loop" : this.type === tt._switch ? "switch" : null;
      this.labels.push({ name: maybeName, kind: kind });
      node.body = this.parseStatement(true);
      this.labels.pop();
      node.label = expr;
      return this.finishNode(node, "LabeledStatement");
    };
    
    pp.parseExpressionStatement = function (node, expr) {
      node.expression = expr;
      this.semicolon();
      return this.finishNode(node, "ExpressionStatement");
    };
    
    // Parse a semicolon-enclosed block of statements, handling `"use
    // strict"` declarations when `allowStrict` is true (used for
    // function bodies).
    
    pp.parseBlock = function (allowStrict) {
      var node = this.startNode(),
          first = true,
          oldStrict = undefined;
      node.body = [];
      this.expect(tt.braceL);
      while (!this.eat(tt.braceR)) {
        var stmt = this.parseStatement(true);
        node.body.push(stmt);
        if (first && allowStrict && this.isUseStrict(stmt)) {
          oldStrict = this.strict;
          this.setStrict(this.strict = true);
        }
        first = false;
      }
      if (oldStrict === false) this.setStrict(false);
      return this.finishNode(node, "BlockStatement");
    };
    
    // Parse a regular `for` loop. The disambiguation code in
    // `parseStatement` will already have parsed the init statement or
    // expression.
    
    pp.parseFor = function (node, init) {
      node.init = init;
      this.expect(tt.semi);
      node.test = this.type === tt.semi ? null : this.parseExpression();
      this.expect(tt.semi);
      node.update = this.type === tt.parenR ? null : this.parseExpression();
      this.expect(tt.parenR);
      node.body = this.parseStatement(false);
      this.labels.pop();
      return this.finishNode(node, "ForStatement");
    };
    
    // Parse a `for`/`in` and `for`/`of` loop, which are almost
    // same from parser's perspective.
    
    pp.parseForIn = function (node, init) {
      var type = this.type === tt._in ? "ForInStatement" : "ForOfStatement";
      this.next();
      node.left = init;
      node.right = this.parseExpression();
      this.expect(tt.parenR);
      node.body = this.parseStatement(false);
      this.labels.pop();
      return this.finishNode(node, type);
    };
    
    // Parse a list of variable declarations.
    
    pp.parseVar = function (node, isFor, kind) {
      node.declarations = [];
      node.kind = kind.keyword;
      for (;;) {
        var decl = this.startNode();
        this.parseVarId(decl);
        if (this.eat(tt.eq)) {
          decl.init = this.parseMaybeAssign(isFor);
        } else if (kind === tt._const && !(this.type === tt._in || this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
          this.unexpected();
        } else if (decl.id.type != "Identifier" && !(isFor && (this.type === tt._in || this.isContextual("of")))) {
          this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
        } else {
          decl.init = null;
        }
        node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
        if (!this.eat(tt.comma)) break;
      }
      return node;
    };
    
    pp.parseVarId = function (decl) {
      decl.id = this.parseBindingAtom();
      this.checkLVal(decl.id, true);
    };
    
    // Parse a function declaration or literal (depending on the
    // `isStatement` parameter).
    
    pp.parseFunction = function (node, isStatement, allowExpressionBody) {
      this.initFunction(node);
      if (this.options.ecmaVersion >= 6) node.generator = this.eat(tt.star);
      if (isStatement || this.type === tt.name) node.id = this.parseIdent();
      this.parseFunctionParams(node);
      this.parseFunctionBody(node, allowExpressionBody);
      return this.finishNode(node, isStatement ? "FunctionDeclaration" : "FunctionExpression");
    };
    
    pp.parseFunctionParams = function (node) {
      this.expect(tt.parenL);
      node.params = this.parseBindingList(tt.parenR, false, false);
    };
    
    // Parse a class declaration or literal (depending on the
    // `isStatement` parameter).
    
    pp.parseClass = function (node, isStatement) {
      this.next();
      this.parseClassId(node, isStatement);
      this.parseClassSuper(node);
      var classBody = this.startNode();
      var hadConstructor = false;
      classBody.body = [];
      this.expect(tt.braceL);
      while (!this.eat(tt.braceR)) {
        if (this.eat(tt.semi)) continue;
        var method = this.startNode();
        var isGenerator = this.eat(tt.star);
        var isMaybeStatic = this.type === tt.name && this.value === "static";
        this.parsePropertyName(method);
        method["static"] = isMaybeStatic && this.type !== tt.parenL;
        if (method["static"]) {
          if (isGenerator) this.unexpected();
          isGenerator = this.eat(tt.star);
          this.parsePropertyName(method);
        }
        method.kind = "method";
        if (!method.computed) {
          var key = method.key;
    
          var isGetSet = false;
          if (!isGenerator && key.type === "Identifier" && this.type !== tt.parenL && (key.name === "get" || key.name === "set")) {
            isGetSet = true;
            method.kind = key.name;
            key = this.parsePropertyName(method);
          }
          if (!method["static"] && (key.type === "Identifier" && key.name === "constructor" || key.type === "Literal" && key.value === "constructor")) {
            if (hadConstructor) this.raise(key.start, "Duplicate constructor in the same class");
            if (isGetSet) this.raise(key.start, "Constructor can't have get/set modifier");
            if (isGenerator) this.raise(key.start, "Constructor can't be a generator");
            method.kind = "constructor";
            hadConstructor = true;
          }
        }
        this.parseClassMethod(classBody, method, isGenerator);
      }
      node.body = this.finishNode(classBody, "ClassBody");
      return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
    };
    
    pp.parseClassMethod = function (classBody, method, isGenerator) {
      method.value = this.parseMethod(isGenerator);
      classBody.body.push(this.finishNode(method, "MethodDefinition"));
    };
    
    pp.parseClassId = function (node, isStatement) {
      node.id = this.type === tt.name ? this.parseIdent() : isStatement ? this.unexpected() : null;
    };
    
    pp.parseClassSuper = function (node) {
      node.superClass = this.eat(tt._extends) ? this.parseExprSubscripts() : null;
    };
    
    // Parses module export declaration.
    
    pp.parseExport = function (node) {
      this.next();
      // export * from '...'
      if (this.eat(tt.star)) {
        this.expectContextual("from");
        node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected();
        this.semicolon();
        return this.finishNode(node, "ExportAllDeclaration");
      }
      if (this.eat(tt._default)) {
        // export default ...
        var expr = this.parseMaybeAssign();
        var needsSemi = true;
        if (expr.type == "FunctionExpression" || expr.type == "ClassExpression") {
          needsSemi = false;
          if (expr.id) {
            expr.type = expr.type == "FunctionExpression" ? "FunctionDeclaration" : "ClassDeclaration";
          }
        }
        node.declaration = expr;
        if (needsSemi) this.semicolon();
        return this.finishNode(node, "ExportDefaultDeclaration");
      }
      // export var|const|let|function|class ...
      if (this.shouldParseExportStatement()) {
        node.declaration = this.parseStatement(true);
        node.specifiers = [];
        node.source = null;
      } else {
        // export { x, y as z } [from '...']
        node.declaration = null;
        node.specifiers = this.parseExportSpecifiers();
        if (this.eatContextual("from")) {
          node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected();
        } else {
          node.source = null;
        }
        this.semicolon();
      }
      return this.finishNode(node, "ExportNamedDeclaration");
    };
    
    pp.shouldParseExportStatement = function () {
      return this.type.keyword;
    };
    
    // Parses a comma-separated list of module exports.
    
    pp.parseExportSpecifiers = function () {
      var nodes = [],
          first = true;
      // export { x, y as z } [from '...']
      this.expect(tt.braceL);
      while (!this.eat(tt.braceR)) {
        if (!first) {
          this.expect(tt.comma);
          if (this.afterTrailingComma(tt.braceR)) break;
        } else first = false;
    
        var node = this.startNode();
        node.local = this.parseIdent(this.type === tt._default);
        node.exported = this.eatContextual("as") ? this.parseIdent(true) : node.local;
        nodes.push(this.finishNode(node, "ExportSpecifier"));
      }
      return nodes;
    };
    
    // Parses import declaration.
    
    pp.parseImport = function (node) {
      this.next();
      // import '...'
      if (this.type === tt.string) {
        node.specifiers = empty;
        node.source = this.parseExprAtom();
        node.kind = "";
      } else {
        node.specifiers = this.parseImportSpecifiers();
        this.expectContextual("from");
        node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected();
      }
      this.semicolon();
      return this.finishNode(node, "ImportDeclaration");
    };
    
    // Parses a comma-separated list of module imports.
    
    pp.parseImportSpecifiers = function () {
      var nodes = [],
          first = true;
      if (this.type === tt.name) {
        // import defaultObj, { x, y as z } from '...'
        var node = this.startNode();
        node.local = this.parseIdent();
        this.checkLVal(node.local, true);
        nodes.push(this.finishNode(node, "ImportDefaultSpecifier"));
        if (!this.eat(tt.comma)) return nodes;
      }
      if (this.type === tt.star) {
        var node = this.startNode();
        this.next();
        this.expectContextual("as");
        node.local = this.parseIdent();
        this.checkLVal(node.local, true);
        nodes.push(this.finishNode(node, "ImportNamespaceSpecifier"));
        return nodes;
      }
      this.expect(tt.braceL);
      while (!this.eat(tt.braceR)) {
        if (!first) {
          this.expect(tt.comma);
          if (this.afterTrailingComma(tt.braceR)) break;
        } else first = false;
    
        var node = this.startNode();
        node.imported = this.parseIdent(true);
        node.local = this.eatContextual("as") ? this.parseIdent() : node.imported;
        this.checkLVal(node.local, true);
        nodes.push(this.finishNode(node, "ImportSpecifier"));
      }
      return nodes;
    };
    
    },{"./state":13,"./tokentype":17,"./whitespace":19}],15:[function(_dereq_,module,exports){
    "use strict";
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
    exports.__esModule = true;
    // The algorithm used to determine whether a regexp can appear at a
    // given point in the program is loosely based on sweet.js' approach.
    // See https://github.com/mozilla/sweet.js/wiki/design
    
    var Parser = _dereq_("./state").Parser;
    
    var tt = _dereq_("./tokentype").types;
    
    var lineBreak = _dereq_("./whitespace").lineBreak;
    
    var TokContext = exports.TokContext = function TokContext(token, isExpr, preserveSpace, override) {
      _classCallCheck(this, TokContext);
    
      this.token = token;
      this.isExpr = isExpr;
      this.preserveSpace = preserveSpace;
      this.override = override;
    };
    
    var types = {
      b_stat: new TokContext("{", false),
      b_expr: new TokContext("{", true),
      b_tmpl: new TokContext("${", true),
      p_stat: new TokContext("(", false),
      p_expr: new TokContext("(", true),
      q_tmpl: new TokContext("`", true, true, function (p) {
        return p.readTmplToken();
      }),
      f_expr: new TokContext("function", true)
    };
    
    exports.types = types;
    var pp = Parser.prototype;
    
    pp.initialContext = function () {
      return [types.b_stat];
    };
    
    pp.braceIsBlock = function (prevType) {
      var parent = undefined;
      if (prevType === tt.colon && (parent = this.curContext()).token == "{") return !parent.isExpr;
      if (prevType === tt._return) return lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
      if (prevType === tt._else || prevType === tt.semi || prevType === tt.eof) return true;
      if (prevType == tt.braceL) return this.curContext() === types.b_stat;
      return !this.exprAllowed;
    };
    
    pp.updateContext = function (prevType) {
      var update = undefined,
          type = this.type;
      if (type.keyword && prevType == tt.dot) this.exprAllowed = false;else if (update = type.updateContext) update.call(this, prevType);else this.exprAllowed = type.beforeExpr;
    };
    
    // Token-specific context update code
    
    tt.parenR.updateContext = tt.braceR.updateContext = function () {
      if (this.context.length == 1) {
        this.exprAllowed = true;
        return;
      }
      var out = this.context.pop();
      if (out === types.b_stat && this.curContext() === types.f_expr) {
        this.context.pop();
        this.exprAllowed = false;
      } else if (out === types.b_tmpl) {
        this.exprAllowed = true;
      } else {
        this.exprAllowed = !out.isExpr;
      }
    };
    
    tt.braceL.updateContext = function (prevType) {
      this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
      this.exprAllowed = true;
    };
    
    tt.dollarBraceL.updateContext = function () {
      this.context.push(types.b_tmpl);
      this.exprAllowed = true;
    };
    
    tt.parenL.updateContext = function (prevType) {
      var statementParens = prevType === tt._if || prevType === tt._for || prevType === tt._with || prevType === tt._while;
      this.context.push(statementParens ? types.p_stat : types.p_expr);
      this.exprAllowed = true;
    };
    
    tt.incDec.updateContext = function () {};
    
    tt._function.updateContext = function () {
      if (this.curContext() !== types.b_stat) this.context.push(types.f_expr);
      this.exprAllowed = false;
    };
    
    tt.backQuote.updateContext = function () {
      if (this.curContext() === types.q_tmpl) this.context.pop();else this.context.push(types.q_tmpl);
      this.exprAllowed = false;
    };
    
    // tokExprAllowed stays unchanged
    
    },{"./state":13,"./tokentype":17,"./whitespace":19}],16:[function(_dereq_,module,exports){
    "use strict";
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
    exports.__esModule = true;
    
    var _identifier = _dereq_("./identifier");
    
    var isIdentifierStart = _identifier.isIdentifierStart;
    var isIdentifierChar = _identifier.isIdentifierChar;
    
    var _tokentype = _dereq_("./tokentype");
    
    var tt = _tokentype.types;
    var keywordTypes = _tokentype.keywords;
    
    var Parser = _dereq_("./state").Parser;
    
    var SourceLocation = _dereq_("./location").SourceLocation;
    
    var _whitespace = _dereq_("./whitespace");
    
    var lineBreak = _whitespace.lineBreak;
    var lineBreakG = _whitespace.lineBreakG;
    var isNewLine = _whitespace.isNewLine;
    var nonASCIIwhitespace = _whitespace.nonASCIIwhitespace;
    
    // Object type used to represent tokens. Note that normally, tokens
    // simply exist as properties on the parser object. This is only
    // used for the onToken callback and the external tokenizer.
    
    var Token = exports.Token = function Token(p) {
      _classCallCheck(this, Token);
    
      this.type = p.type;
      this.value = p.value;
      this.start = p.start;
      this.end = p.end;
      if (p.options.locations) this.loc = new SourceLocation(p, p.startLoc, p.endLoc);
      if (p.options.ranges) this.range = [p.start, p.end];
    };
    
    // ## Tokenizer
    
    var pp = Parser.prototype;
    
    // Are we running under Rhino?
    var isRhino = typeof Packages !== "undefined";
    
    // Move to the next token
    
    pp.next = function () {
      if (this.options.onToken) this.options.onToken(new Token(this));
    
      this.lastTokEnd = this.end;
      this.lastTokStart = this.start;
      this.lastTokEndLoc = this.endLoc;
      this.lastTokStartLoc = this.startLoc;
      this.nextToken();
    };
    
    pp.getToken = function () {
      this.next();
      return new Token(this);
    };
    
    // If we're in an ES6 environment, make parsers iterable
    if (typeof Symbol !== "undefined") pp[Symbol.iterator] = function () {
      var self = this;
      return { next: function next() {
          var token = self.getToken();
          return {
            done: token.type === tt.eof,
            value: token
          };
        } };
    };
    
    // Toggle strict mode. Re-reads the next number or string to please
    // pedantic tests (`"use strict"; 010;` should fail).
    
    pp.setStrict = function (strict) {
      this.strict = strict;
      if (this.type !== tt.num && this.type !== tt.string) return;
      this.pos = this.start;
      if (this.options.locations) {
        while (this.pos < this.lineStart) {
          this.lineStart = this.input.lastIndexOf("\n", this.lineStart - 2) + 1;
          --this.curLine;
        }
      }
      this.nextToken();
    };
    
    pp.curContext = function () {
      return this.context[this.context.length - 1];
    };
    
    // Read a single token, updating the parser object's token-related
    // properties.
    
    pp.nextToken = function () {
      var curContext = this.curContext();
      if (!curContext || !curContext.preserveSpace) this.skipSpace();
    
      this.start = this.pos;
      if (this.options.locations) this.startLoc = this.curPosition();
      if (this.pos >= this.input.length) return this.finishToken(tt.eof);
    
      if (curContext.override) return curContext.override(this);else this.readToken(this.fullCharCodeAtPos());
    };
    
    pp.readToken = function (code) {
      // Identifier or keyword. '\uXXXX' sequences are allowed in
      // identifiers, so '\' also dispatches to that.
      if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */) return this.readWord();
    
      return this.getTokenFromCode(code);
    };
    
    pp.fullCharCodeAtPos = function () {
      var code = this.input.charCodeAt(this.pos);
      if (code <= 55295 || code >= 57344) return code;
      var next = this.input.charCodeAt(this.pos + 1);
      return (code << 10) + next - 56613888;
    };
    
    pp.skipBlockComment = function () {
      var startLoc = this.options.onComment && this.options.locations && this.curPosition();
      var start = this.pos,
          end = this.input.indexOf("*/", this.pos += 2);
      if (end === -1) this.raise(this.pos - 2, "Unterminated comment");
      this.pos = end + 2;
      if (this.options.locations) {
        lineBreakG.lastIndex = start;
        var match = undefined;
        while ((match = lineBreakG.exec(this.input)) && match.index < this.pos) {
          ++this.curLine;
          this.lineStart = match.index + match[0].length;
        }
      }
      if (this.options.onComment) this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos, startLoc, this.options.locations && this.curPosition());
    };
    
    pp.skipLineComment = function (startSkip) {
      var start = this.pos;
      var startLoc = this.options.onComment && this.options.locations && this.curPosition();
      var ch = this.input.charCodeAt(this.pos += startSkip);
      while (this.pos < this.input.length && ch !== 10 && ch !== 13 && ch !== 8232 && ch !== 8233) {
        ++this.pos;
        ch = this.input.charCodeAt(this.pos);
      }
      if (this.options.onComment) this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos, startLoc, this.options.locations && this.curPosition());
    };
    
    // Called at the start of the parse and after every token. Skips
    // whitespace and comments, and.
    
    pp.skipSpace = function () {
      while (this.pos < this.input.length) {
        var ch = this.input.charCodeAt(this.pos);
        if (ch === 32) {
          // ' '
          ++this.pos;
        } else if (ch === 13) {
          ++this.pos;
          var next = this.input.charCodeAt(this.pos);
          if (next === 10) {
            ++this.pos;
          }
          if (this.options.locations) {
            ++this.curLine;
            this.lineStart = this.pos;
          }
        } else if (ch === 10 || ch === 8232 || ch === 8233) {
          ++this.pos;
          if (this.options.locations) {
            ++this.curLine;
            this.lineStart = this.pos;
          }
        } else if (ch > 8 && ch < 14) {
          ++this.pos;
        } else if (ch === 47) {
          // '/'
          var next = this.input.charCodeAt(this.pos + 1);
          if (next === 42) {
            // '*'
            this.skipBlockComment();
          } else if (next === 47) {
            // '/'
            this.skipLineComment(2);
          } else break;
        } else if (ch === 160) {
          // '\xa0'
          ++this.pos;
        } else if (ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
          ++this.pos;
        } else {
          break;
        }
      }
    };
    
    // Called at the end of every token. Sets `end`, `val`, and
    // maintains `context` and `exprAllowed`, and skips the space after
    // the token, so that the next one's `start` will point at the
    // right position.
    
    pp.finishToken = function (type, val) {
      this.end = this.pos;
      if (this.options.locations) this.endLoc = this.curPosition();
      var prevType = this.type;
      this.type = type;
      this.value = val;
    
      this.updateContext(prevType);
    };
    
    // ### Token reading
    
    // This is the function that is called to fetch the next token. It
    // is somewhat obscure, because it works in character codes rather
    // than characters, and because operator parsing has been inlined
    // into it.
    //
    // All in the name of speed.
    //
    pp.readToken_dot = function () {
      var next = this.input.charCodeAt(this.pos + 1);
      if (next >= 48 && next <= 57) return this.readNumber(true);
      var next2 = this.input.charCodeAt(this.pos + 2);
      if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) {
        // 46 = dot '.'
        this.pos += 3;
        return this.finishToken(tt.ellipsis);
      } else {
        ++this.pos;
        return this.finishToken(tt.dot);
      }
    };
    
    pp.readToken_slash = function () {
      // '/'
      var next = this.input.charCodeAt(this.pos + 1);
      if (this.exprAllowed) {
        ++this.pos;return this.readRegexp();
      }
      if (next === 61) return this.finishOp(tt.assign, 2);
      return this.finishOp(tt.slash, 1);
    };
    
    pp.readToken_mult_modulo = function (code) {
      // '%*'
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 61) return this.finishOp(tt.assign, 2);
      return this.finishOp(code === 42 ? tt.star : tt.modulo, 1);
    };
    
    pp.readToken_pipe_amp = function (code) {
      // '|&'
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === code) return this.finishOp(code === 124 ? tt.logicalOR : tt.logicalAND, 2);
      if (next === 61) return this.finishOp(tt.assign, 2);
      return this.finishOp(code === 124 ? tt.bitwiseOR : tt.bitwiseAND, 1);
    };
    
    pp.readToken_caret = function () {
      // '^'
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 61) return this.finishOp(tt.assign, 2);
      return this.finishOp(tt.bitwiseXOR, 1);
    };
    
    pp.readToken_plus_min = function (code) {
      // '+-'
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === code) {
        if (next == 45 && this.input.charCodeAt(this.pos + 2) == 62 && lineBreak.test(this.input.slice(this.lastTokEnd, this.pos))) {
          // A `-->` line comment
          this.skipLineComment(3);
          this.skipSpace();
          return this.nextToken();
        }
        return this.finishOp(tt.incDec, 2);
      }
      if (next === 61) return this.finishOp(tt.assign, 2);
      return this.finishOp(tt.plusMin, 1);
    };
    
    pp.readToken_lt_gt = function (code) {
      // '<>'
      var next = this.input.charCodeAt(this.pos + 1);
      var size = 1;
      if (next === code) {
        size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
        if (this.input.charCodeAt(this.pos + size) === 61) return this.finishOp(tt.assign, size + 1);
        return this.finishOp(tt.bitShift, size);
      }
      if (next == 33 && code == 60 && this.input.charCodeAt(this.pos + 2) == 45 && this.input.charCodeAt(this.pos + 3) == 45) {
        if (this.inModule) this.unexpected();
        // `<!--`, an XML-style comment that should be interpreted as a line comment
        this.skipLineComment(4);
        this.skipSpace();
        return this.nextToken();
      }
      if (next === 61) size = this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2;
      return this.finishOp(tt.relational, size);
    };
    
    pp.readToken_eq_excl = function (code) {
      // '=!'
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 61) return this.finishOp(tt.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2);
      if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) {
        // '=>'
        this.pos += 2;
        return this.finishToken(tt.arrow);
      }
      return this.finishOp(code === 61 ? tt.eq : tt.prefix, 1);
    };
    
    pp.getTokenFromCode = function (code) {
      switch (code) {
        // The interpretation of a dot depends on whether it is followed
        // by a digit or another two dots.
        case 46:
          // '.'
          return this.readToken_dot();
    
        // Punctuation tokens.
        case 40:
          ++this.pos;return this.finishToken(tt.parenL);
        case 41:
          ++this.pos;return this.finishToken(tt.parenR);
        case 59:
          ++this.pos;return this.finishToken(tt.semi);
        case 44:
          ++this.pos;return this.finishToken(tt.comma);
        case 91:
          ++this.pos;return this.finishToken(tt.bracketL);
        case 93:
          ++this.pos;return this.finishToken(tt.bracketR);
        case 123:
          ++this.pos;return this.finishToken(tt.braceL);
        case 125:
          ++this.pos;return this.finishToken(tt.braceR);
        case 58:
          ++this.pos;return this.finishToken(tt.colon);
        case 63:
          ++this.pos;return this.finishToken(tt.question);
    
        case 96:
          // '`'
          if (this.options.ecmaVersion < 6) break;
          ++this.pos;
          return this.finishToken(tt.backQuote);
    
        case 48:
          // '0'
          var next = this.input.charCodeAt(this.pos + 1);
          if (next === 120 || next === 88) return this.readRadixNumber(16); // '0x', '0X' - hex number
          if (this.options.ecmaVersion >= 6) {
            if (next === 111 || next === 79) return this.readRadixNumber(8); // '0o', '0O' - octal number
            if (next === 98 || next === 66) return this.readRadixNumber(2); // '0b', '0B' - binary number
          }
        // Anything else beginning with a digit is an integer, octal
        // number, or float.
        case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:
          // 1-9
          return this.readNumber(false);
    
        // Quotes produce strings.
        case 34:case 39:
          // '"', "'"
          return this.readString(code);
    
        // Operators are parsed inline in tiny state machines. '=' (61) is
        // often referred to. `finishOp` simply skips the amount of
        // characters it is given as second argument, and returns a token
        // of the type given by its first argument.
    
        case 47:
          // '/'
          return this.readToken_slash();
    
        case 37:case 42:
          // '%*'
          return this.readToken_mult_modulo(code);
    
        case 124:case 38:
          // '|&'
          return this.readToken_pipe_amp(code);
    
        case 94:
          // '^'
          return this.readToken_caret();
    
        case 43:case 45:
          // '+-'
          return this.readToken_plus_min(code);
    
        case 60:case 62:
          // '<>'
          return this.readToken_lt_gt(code);
    
        case 61:case 33:
          // '=!'
          return this.readToken_eq_excl(code);
    
        case 126:
          // '~'
          return this.finishOp(tt.prefix, 1);
      }
    
      this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
    };
    
    pp.finishOp = function (type, size) {
      var str = this.input.slice(this.pos, this.pos + size);
      this.pos += size;
      return this.finishToken(type, str);
    };
    
    var regexpUnicodeSupport = false;
    try {
      new RegExp("￿", "u");regexpUnicodeSupport = true;
    } catch (e) {}
    
    // Parse a regular expression. Some context-awareness is necessary,
    // since a '/' inside a '[]' set does not end the expression.
    
    pp.readRegexp = function () {
      var escaped = undefined,
          inClass = undefined,
          start = this.pos;
      for (;;) {
        if (this.pos >= this.input.length) this.raise(start, "Unterminated regular expression");
        var ch = this.input.charAt(this.pos);
        if (lineBreak.test(ch)) this.raise(start, "Unterminated regular expression");
        if (!escaped) {
          if (ch === "[") inClass = true;else if (ch === "]" && inClass) inClass = false;else if (ch === "/" && !inClass) break;
          escaped = ch === "\\";
        } else escaped = false;
        ++this.pos;
      }
      var content = this.input.slice(start, this.pos);
      ++this.pos;
      // Need to use `readWord1` because '\uXXXX' sequences are allowed
      // here (don't ask).
      var mods = this.readWord1();
      var tmp = content;
      if (mods) {
        var validFlags = /^[gmsiy]*$/;
        if (this.options.ecmaVersion >= 6) validFlags = /^[gmsiyu]*$/;
        if (!validFlags.test(mods)) this.raise(start, "Invalid regular expression flag");
        if (mods.indexOf("u") >= 0 && !regexpUnicodeSupport) {
          // Replace each astral symbol and every Unicode escape sequence that
          // possibly represents an astral symbol or a paired surrogate with a
          // single ASCII symbol to avoid throwing on regular expressions that
          // are only valid in combination with the `/u` flag.
          // Note: replacing with the ASCII symbol `x` might cause false
          // negatives in unlikely scenarios. For example, `[\u{61}-b]` is a
          // perfectly valid pattern that is equivalent to `[a-b]`, but it would
          // be replaced by `[x-b]` which throws an error.
          tmp = tmp.replace(/\\u([a-fA-F0-9]{4})|\\u\{([0-9a-fA-F]+)\}|[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "x");
        }
      }
      // Detect invalid regular expressions.
      var value = null;
      // Rhino's regular expression parser is flaky and throws uncatchable exceptions,
      // so don't do detection if we are running under Rhino
      if (!isRhino) {
        try {
          new RegExp(tmp);
        } catch (e) {
          if (e instanceof SyntaxError) this.raise(start, "Error parsing regular expression: " + e.message);
          this.raise(e);
        }
        // Get a regular expression object for this pattern-flag pair, or `null` in
        // case the current environment doesn't support the flags it uses.
        try {
          value = new RegExp(content, mods);
        } catch (err) {}
      }
      return this.finishToken(tt.regexp, { pattern: content, flags: mods, value: value });
    };
    
    // Read an integer in the given radix. Return null if zero digits
    // were read, the integer value otherwise. When `len` is given, this
    // will return `null` unless the integer has exactly `len` digits.
    
    pp.readInt = function (radix, len) {
      var start = this.pos,
          total = 0;
      for (var i = 0, e = len == null ? Infinity : len; i < e; ++i) {
        var code = this.input.charCodeAt(this.pos),
            val = undefined;
        if (code >= 97) val = code - 97 + 10; // a
        else if (code >= 65) val = code - 65 + 10; // A
        else if (code >= 48 && code <= 57) val = code - 48; // 0-9
        else val = Infinity;
        if (val >= radix) break;
        ++this.pos;
        total = total * radix + val;
      }
      if (this.pos === start || len != null && this.pos - start !== len) return null;
    
      return total;
    };
    
    pp.readRadixNumber = function (radix) {
      this.pos += 2; // 0x
      var val = this.readInt(radix);
      if (val == null) this.raise(this.start + 2, "Expected number in radix " + radix);
      if (isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number");
      return this.finishToken(tt.num, val);
    };
    
    // Read an integer, octal integer, or floating-point number.
    
    pp.readNumber = function (startsWithDot) {
      var start = this.pos,
          isFloat = false,
          octal = this.input.charCodeAt(this.pos) === 48;
      if (!startsWithDot && this.readInt(10) === null) this.raise(start, "Invalid number");
      if (this.input.charCodeAt(this.pos) === 46) {
        ++this.pos;
        this.readInt(10);
        isFloat = true;
      }
      var next = this.input.charCodeAt(this.pos);
      if (next === 69 || next === 101) {
        // 'eE'
        next = this.input.charCodeAt(++this.pos);
        if (next === 43 || next === 45) ++this.pos; // '+-'
        if (this.readInt(10) === null) this.raise(start, "Invalid number");
        isFloat = true;
      }
      if (isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number");
    
      var str = this.input.slice(start, this.pos),
          val = undefined;
      if (isFloat) val = parseFloat(str);else if (!octal || str.length === 1) val = parseInt(str, 10);else if (/[89]/.test(str) || this.strict) this.raise(start, "Invalid number");else val = parseInt(str, 8);
      return this.finishToken(tt.num, val);
    };
    
    // Read a string value, interpreting backslash-escapes.
    
    pp.readCodePoint = function () {
      var ch = this.input.charCodeAt(this.pos),
          code = undefined;
    
      if (ch === 123) {
        if (this.options.ecmaVersion < 6) this.unexpected();
        ++this.pos;
        code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
        ++this.pos;
        if (code > 1114111) this.unexpected();
      } else {
        code = this.readHexChar(4);
      }
      return code;
    };
    
    function codePointToString(code) {
      // UTF-16 Decoding
      if (code <= 65535) {
        return String.fromCharCode(code);
      }return String.fromCharCode((code - 65536 >> 10) + 55296, (code - 65536 & 1023) + 56320);
    }
    
    pp.readString = function (quote) {
      var out = "",
          chunkStart = ++this.pos;
      for (;;) {
        if (this.pos >= this.input.length) this.raise(this.start, "Unterminated string constant");
        var ch = this.input.charCodeAt(this.pos);
        if (ch === quote) break;
        if (ch === 92) {
          // '\'
          out += this.input.slice(chunkStart, this.pos);
          out += this.readEscapedChar();
          chunkStart = this.pos;
        } else {
          if (isNewLine(ch)) this.raise(this.start, "Unterminated string constant");
          ++this.pos;
        }
      }
      out += this.input.slice(chunkStart, this.pos++);
      return this.finishToken(tt.string, out);
    };
    
    // Reads template string tokens.
    
    pp.readTmplToken = function () {
      var out = "",
          chunkStart = this.pos;
      for (;;) {
        if (this.pos >= this.input.length) this.raise(this.start, "Unterminated template");
        var ch = this.input.charCodeAt(this.pos);
        if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) {
          // '`', '${'
          if (this.pos === this.start && this.type === tt.template) {
            if (ch === 36) {
              this.pos += 2;
              return this.finishToken(tt.dollarBraceL);
            } else {
              ++this.pos;
              return this.finishToken(tt.backQuote);
            }
          }
          out += this.input.slice(chunkStart, this.pos);
          return this.finishToken(tt.template, out);
        }
        if (ch === 92) {
          // '\'
          out += this.input.slice(chunkStart, this.pos);
          out += this.readEscapedChar();
          chunkStart = this.pos;
        } else if (isNewLine(ch)) {
          out += this.input.slice(chunkStart, this.pos);
          ++this.pos;
          if (ch === 13 && this.input.charCodeAt(this.pos) === 10) {
            ++this.pos;
            out += "\n";
          } else {
            out += String.fromCharCode(ch);
          }
          if (this.options.locations) {
            ++this.curLine;
            this.lineStart = this.pos;
          }
          chunkStart = this.pos;
        } else {
          ++this.pos;
        }
      }
    };
    
    // Used to read escaped characters
    
    pp.readEscapedChar = function () {
      var ch = this.input.charCodeAt(++this.pos);
      var octal = /^[0-7]+/.exec(this.input.slice(this.pos, this.pos + 3));
      if (octal) octal = octal[0];
      while (octal && parseInt(octal, 8) > 255) octal = octal.slice(0, -1);
      if (octal === "0") octal = null;
      ++this.pos;
      if (octal) {
        if (this.strict) this.raise(this.pos - 2, "Octal literal in strict mode");
        this.pos += octal.length - 1;
        return String.fromCharCode(parseInt(octal, 8));
      } else {
        switch (ch) {
          case 110:
            return "\n"; // 'n' -> '\n'
          case 114:
            return "\r"; // 'r' -> '\r'
          case 120:
            return String.fromCharCode(this.readHexChar(2)); // 'x'
          case 117:
            return codePointToString(this.readCodePoint()); // 'u'
          case 116:
            return "\t"; // 't' -> '\t'
          case 98:
            return "\b"; // 'b' -> '\b'
          case 118:
            return "\u000b"; // 'v' -> '\u000b'
          case 102:
            return "\f"; // 'f' -> '\f'
          case 48:
            return "\u0000"; // 0 -> '\0'
          case 13:
            if (this.input.charCodeAt(this.pos) === 10) ++this.pos; // '\r\n'
          case 10:
            // ' \n'
            if (this.options.locations) {
              this.lineStart = this.pos;++this.curLine;
            }
            return "";
          default:
            return String.fromCharCode(ch);
        }
      }
    };
    
    // Used to read character escape sequences ('\x', '\u', '\U').
    
    pp.readHexChar = function (len) {
      var n = this.readInt(16, len);
      if (n === null) this.raise(this.start, "Bad character escape sequence");
      return n;
    };
    
    // Used to signal to callers of `readWord1` whether the word
    // contained any escape sequences. This is needed because words with
    // escape sequences must not be interpreted as keywords.
    
    var containsEsc;
    
    // Read an identifier, and return it as a string. Sets `containsEsc`
    // to whether the word contained a '\u' escape.
    //
    // Incrementally adds only escaped chars, adding other chunks as-is
    // as a micro-optimization.
    
    pp.readWord1 = function () {
      containsEsc = false;
      var word = "",
          first = true,
          chunkStart = this.pos;
      var astral = this.options.ecmaVersion >= 6;
      while (this.pos < this.input.length) {
        var ch = this.fullCharCodeAtPos();
        if (isIdentifierChar(ch, astral)) {
          this.pos += ch <= 65535 ? 1 : 2;
        } else if (ch === 92) {
          // "\"
          containsEsc = true;
          word += this.input.slice(chunkStart, this.pos);
          var escStart = this.pos;
          if (this.input.charCodeAt(++this.pos) != 117) // "u"
            this.raise(this.pos, "Expecting Unicode escape sequence \\uXXXX");
          ++this.pos;
          var esc = this.readCodePoint();
          if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral)) this.raise(escStart, "Invalid Unicode escape");
          word += codePointToString(esc);
          chunkStart = this.pos;
        } else {
          break;
        }
        first = false;
      }
      return word + this.input.slice(chunkStart, this.pos);
    };
    
    // Read an identifier or keyword token. Will check for reserved
    // words when necessary.
    
    pp.readWord = function () {
      var word = this.readWord1();
      var type = tt.name;
      if ((this.options.ecmaVersion >= 6 || !containsEsc) && this.isKeyword(word)) type = keywordTypes[word];
      return this.finishToken(type, word);
    };
    
    },{"./identifier":7,"./location":8,"./state":13,"./tokentype":17,"./whitespace":19}],17:[function(_dereq_,module,exports){
    "use strict";
    
    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };
    
    exports.__esModule = true;
    // ## Token types
    
    // The assignment of fine-grained, information-carrying type objects
    // allows the tokenizer to store the information it has about a
    // token in a way that is very cheap for the parser to look up.
    
    // All token type variables start with an underscore, to make them
    // easy to recognize.
    
    // The `beforeExpr` property is used to disambiguate between regular
    // expressions and divisions. It is set on all token types that can
    // be followed by an expression (thus, a slash after them would be a
    // regular expression).
    //
    // `isLoop` marks a keyword as starting a loop, which is important
    // to know when parsing a label, in order to allow or disallow
    // continue jumps to that label.
    
    var TokenType = exports.TokenType = function TokenType(label) {
      var conf = arguments[1] === undefined ? {} : arguments[1];
    
      _classCallCheck(this, TokenType);
    
      this.label = label;
      this.keyword = conf.keyword;
      this.beforeExpr = !!conf.beforeExpr;
      this.startsExpr = !!conf.startsExpr;
      this.isLoop = !!conf.isLoop;
      this.isAssign = !!conf.isAssign;
      this.prefix = !!conf.prefix;
      this.postfix = !!conf.postfix;
      this.binop = conf.binop || null;
      this.updateContext = null;
    };
    
    function binop(name, prec) {
      return new TokenType(name, { beforeExpr: true, binop: prec });
    }
    var beforeExpr = { beforeExpr: true },
        startsExpr = { startsExpr: true };
    
    var types = {
      num: new TokenType("num", startsExpr),
      regexp: new TokenType("regexp", startsExpr),
      string: new TokenType("string", startsExpr),
      name: new TokenType("name", startsExpr),
      eof: new TokenType("eof"),
    
      // Punctuation token types.
      bracketL: new TokenType("[", { beforeExpr: true, startsExpr: true }),
      bracketR: new TokenType("]"),
      braceL: new TokenType("{", { beforeExpr: true, startsExpr: true }),
      braceR: new TokenType("}"),
      parenL: new TokenType("(", { beforeExpr: true, startsExpr: true }),
      parenR: new TokenType(")"),
      comma: new TokenType(",", beforeExpr),
      semi: new TokenType(";", beforeExpr),
      colon: new TokenType(":", beforeExpr),
      dot: new TokenType("."),
      question: new TokenType("?", beforeExpr),
      arrow: new TokenType("=>", beforeExpr),
      template: new TokenType("template"),
      ellipsis: new TokenType("...", beforeExpr),
      backQuote: new TokenType("`", startsExpr),
      dollarBraceL: new TokenType("${", { beforeExpr: true, startsExpr: true }),
    
      // Operators. These carry several kinds of properties to help the
      // parser use them properly (the presence of these properties is
      // what categorizes them as operators).
      //
      // `binop`, when present, specifies that this operator is a binary
      // operator, and will refer to its precedence.
      //
      // `prefix` and `postfix` mark the operator as a prefix or postfix
      // unary operator.
      //
      // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
      // binary operators with a very low precedence, that should result
      // in AssignmentExpression nodes.
    
      eq: new TokenType("=", { beforeExpr: true, isAssign: true }),
      assign: new TokenType("_=", { beforeExpr: true, isAssign: true }),
      incDec: new TokenType("++/--", { prefix: true, postfix: true, startsExpr: true }),
      prefix: new TokenType("prefix", { beforeExpr: true, prefix: true, startsExpr: true }),
      logicalOR: binop("||", 1),
      logicalAND: binop("&&", 2),
      bitwiseOR: binop("|", 3),
      bitwiseXOR: binop("^", 4),
      bitwiseAND: binop("&", 5),
      equality: binop("==/!=", 6),
      relational: binop("</>", 7),
      bitShift: binop("<</>>", 8),
      plusMin: new TokenType("+/-", { beforeExpr: true, binop: 9, prefix: true, startsExpr: true }),
      modulo: binop("%", 10),
      star: binop("*", 10),
      slash: binop("/", 10)
    };
    
    exports.types = types;
    // Map keyword names to token types.
    
    var keywords = {};
    
    exports.keywords = keywords;
    // Succinct definitions of keyword token types
    function kw(name) {
      var options = arguments[1] === undefined ? {} : arguments[1];
    
      options.keyword = name;
      keywords[name] = types["_" + name] = new TokenType(name, options);
    }
    
    kw("break");
    kw("case", beforeExpr);
    kw("catch");
    kw("continue");
    kw("debugger");
    kw("default");
    kw("do", { isLoop: true });
    kw("else", beforeExpr);
    kw("finally");
    kw("for", { isLoop: true });
    kw("function", startsExpr);
    kw("if");
    kw("return", beforeExpr);
    kw("switch");
    kw("throw", beforeExpr);
    kw("try");
    kw("var");
    kw("let");
    kw("const");
    kw("while", { isLoop: true });
    kw("with");
    kw("new", { beforeExpr: true, startsExpr: true });
    kw("this", startsExpr);
    kw("super", startsExpr);
    kw("class");
    kw("extends", beforeExpr);
    kw("export");
    kw("import");
    kw("yield", { beforeExpr: true, startsExpr: true });
    kw("null", startsExpr);
    kw("true", startsExpr);
    kw("false", startsExpr);
    kw("in", { beforeExpr: true, binop: 7 });
    kw("instanceof", { beforeExpr: true, binop: 7 });
    kw("typeof", { beforeExpr: true, prefix: true, startsExpr: true });
    kw("void", { beforeExpr: true, prefix: true, startsExpr: true });
    kw("delete", { beforeExpr: true, prefix: true, startsExpr: true });
    
    },{}],18:[function(_dereq_,module,exports){
    "use strict";
    
    exports.isArray = isArray;
    
    // Checks if an object has a property.
    
    exports.has = has;
    exports.__esModule = true;
    
    function isArray(obj) {
      return Object.prototype.toString.call(obj) === "[object Array]";
    }
    
    function has(obj, propName) {
      return Object.prototype.hasOwnProperty.call(obj, propName);
    }
    
    },{}],19:[function(_dereq_,module,exports){
    "use strict";
    
    exports.isNewLine = isNewLine;
    exports.__esModule = true;
    // Matches a whole line break (where CRLF is considered a single
    // line break). Used to count lines.
    
    var lineBreak = /\r\n?|\n|\u2028|\u2029/;
    exports.lineBreak = lineBreak;
    var lineBreakG = new RegExp(lineBreak.source, "g");
    
    exports.lineBreakG = lineBreakG;
    
    function isNewLine(code) {
      return code === 10 || code === 13 || code === 8232 || code == 8233;
    }
    
    var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
    exports.nonASCIIwhitespace = nonASCIIwhitespace;
    
    },{}]},{},[1])(1)
    });
    }).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    },{}],4:[function(require,module,exports){
    (function (process,__filename){
    /** vim: et:ts=4:sw=4:sts=4
     * @license amdefine 1.0.1 Copyright (c) 2011-2016, The Dojo Foundation All Rights Reserved.
     * Available via the MIT or new BSD license.
     * see: http://github.com/jrburke/amdefine for details
     */
    
    /*jslint node: true */
    /*global module, process */
    'use strict';
    
    /**
     * Creates a define for node.
     * @param {Object} module the "module" object that is defined by Node for the
     * current module.
     * @param {Function} [requireFn]. Node's require function for the current module.
     * It only needs to be passed in Node versions before 0.5, when module.require
     * did not exist.
     * @returns {Function} a define function that is usable for the current node
     * module.
     */
    function amdefine(module, requireFn) {
        'use strict';
        var defineCache = {},
            loaderCache = {},
            alreadyCalled = false,
            path = require('path'),
            makeRequire, stringRequire;
    
        /**
         * Trims the . and .. from an array of path segments.
         * It will keep a leading path segment if a .. will become
         * the first path segment, to help with module name lookups,
         * which act like paths, but can be remapped. But the end result,
         * all paths that use this function should look normalized.
         * NOTE: this method MODIFIES the input array.
         * @param {Array} ary the array of path segments.
         */
        function trimDots(ary) {
            var i, part;
            for (i = 0; ary[i]; i+= 1) {
                part = ary[i];
                if (part === '.') {
                    ary.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    if (i === 1 && (ary[2] === '..' || ary[0] === '..')) {
                        //End of the line. Keep at least one non-dot
                        //path segment at the front so it can be mapped
                        //correctly to disk. Otherwise, there is likely
                        //no path mapping for a path starting with '..'.
                        //This can still fail, but catches the most reasonable
                        //uses of ..
                        break;
                    } else if (i > 0) {
                        ary.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
        }
    
        function normalize(name, baseName) {
            var baseParts;
    
            //Adjust any relative paths.
            if (name && name.charAt(0) === '.') {
                //If have a base name, try to normalize against it,
                //otherwise, assume it is a top-level require that will
                //be relative to baseUrl in the end.
                if (baseName) {
                    baseParts = baseName.split('/');
                    baseParts = baseParts.slice(0, baseParts.length - 1);
                    baseParts = baseParts.concat(name.split('/'));
                    trimDots(baseParts);
                    name = baseParts.join('/');
                }
            }
    
            return name;
        }
    
        /**
         * Create the normalize() function passed to a loader plugin's
         * normalize method.
         */
        function makeNormalize(relName) {
            return function (name) {
                return normalize(name, relName);
            };
        }
    
        function makeLoad(id) {
            function load(value) {
                loaderCache[id] = value;
            }
    
            load.fromText = function (id, text) {
                //This one is difficult because the text can/probably uses
                //define, and any relative paths and requires should be relative
                //to that id was it would be found on disk. But this would require
                //bootstrapping a module/require fairly deeply from node core.
                //Not sure how best to go about that yet.
                throw new Error('amdefine does not implement load.fromText');
            };
    
            return load;
        }
    
        makeRequire = function (systemRequire, exports, module, relId) {
            function amdRequire(deps, callback) {
                if (typeof deps === 'string') {
                    //Synchronous, single module require('')
                    return stringRequire(systemRequire, exports, module, deps, relId);
                } else {
                    //Array of dependencies with a callback.
    
                    //Convert the dependencies to modules.
                    deps = deps.map(function (depName) {
                        return stringRequire(systemRequire, exports, module, depName, relId);
                    });
    
                    //Wait for next tick to call back the require call.
                    if (callback) {
                        process.nextTick(function () {
                            callback.apply(null, deps);
                        });
                    }
                }
            }
    
            amdRequire.toUrl = function (filePath) {
                if (filePath.indexOf('.') === 0) {
                    return normalize(filePath, path.dirname(module.filename));
                } else {
                    return filePath;
                }
            };
    
            return amdRequire;
        };
    
        //Favor explicit value, passed in if the module wants to support Node 0.4.
        requireFn = requireFn || function req() {
            return module.require.apply(module, arguments);
        };
    
        function runFactory(id, deps, factory) {
            var r, e, m, result;
    
            if (id) {
                e = loaderCache[id] = {};
                m = {
                    id: id,
                    uri: __filename,
                    exports: e
                };
                r = makeRequire(requireFn, e, m, id);
            } else {
                //Only support one define call per file
                if (alreadyCalled) {
                    throw new Error('amdefine with no module ID cannot be called more than once per file.');
                }
                alreadyCalled = true;
    
                //Use the real variables from node
                //Use module.exports for exports, since
                //the exports in here is amdefine exports.
                e = module.exports;
                m = module;
                r = makeRequire(requireFn, e, m, module.id);
            }
    
            //If there are dependencies, they are strings, so need
            //to convert them to dependency values.
            if (deps) {
                deps = deps.map(function (depName) {
                    return r(depName);
                });
            }
    
            //Call the factory with the right dependencies.
            if (typeof factory === 'function') {
                result = factory.apply(m.exports, deps);
            } else {
                result = factory;
            }
    
            if (result !== undefined) {
                m.exports = result;
                if (id) {
                    loaderCache[id] = m.exports;
                }
            }
        }
    
        stringRequire = function (systemRequire, exports, module, id, relId) {
            //Split the ID by a ! so that
            var index = id.indexOf('!'),
                originalId = id,
                prefix, plugin;
    
            if (index === -1) {
                id = normalize(id, relId);
    
                //Straight module lookup. If it is one of the special dependencies,
                //deal with it, otherwise, delegate to node.
                if (id === 'require') {
                    return makeRequire(systemRequire, exports, module, relId);
                } else if (id === 'exports') {
                    return exports;
                } else if (id === 'module') {
                    return module;
                } else if (loaderCache.hasOwnProperty(id)) {
                    return loaderCache[id];
                } else if (defineCache[id]) {
                    runFactory.apply(null, defineCache[id]);
                    return loaderCache[id];
                } else {
                    if(systemRequire) {
                        return systemRequire(originalId);
                    } else {
                        throw new Error('No module with ID: ' + id);
                    }
                }
            } else {
                //There is a plugin in play.
                prefix = id.substring(0, index);
                id = id.substring(index + 1, id.length);
    
                plugin = stringRequire(systemRequire, exports, module, prefix, relId);
    
                if (plugin.normalize) {
                    id = plugin.normalize(id, makeNormalize(relId));
                } else {
                    //Normalize the ID normally.
                    id = normalize(id, relId);
                }
    
                if (loaderCache[id]) {
                    return loaderCache[id];
                } else {
                    plugin.load(id, makeRequire(systemRequire, exports, module, relId), makeLoad(id), {});
    
                    return loaderCache[id];
                }
            }
        };
    
        //Create a define function specific to the module asking for amdefine.
        function define(id, deps, factory) {
            if (Array.isArray(id)) {
                factory = deps;
                deps = id;
                id = undefined;
            } else if (typeof id !== 'string') {
                factory = id;
                id = deps = undefined;
            }
    
            if (deps && !Array.isArray(deps)) {
                factory = deps;
                deps = undefined;
            }
    
            if (!deps) {
                deps = ['require', 'exports', 'module'];
            }
    
            //Set up properties for this module. If an ID, then use
            //internal cache. If no ID, then use the external variables
            //for this node module.
            if (id) {
                //Put the module in deep freeze until there is a
                //require call for it.
                defineCache[id] = [id, deps, factory];
            } else {
                runFactory(id, deps, factory);
            }
        }
    
        //define.require, which has access to all the values in the
        //cache. Useful for AMD modules that all have IDs in the file,
        //but need to finally export a value to node based on one of those
        //IDs.
        define.require = function (id) {
            if (loaderCache[id]) {
                return loaderCache[id];
            }
    
            if (defineCache[id]) {
                runFactory.apply(null, defineCache[id]);
                return loaderCache[id];
            }
        };
    
        define.amd = {};
    
        return define;
    }
    
    module.exports = amdefine;
    
    }).call(this,require('_process'),"/node_modules/amdefine/amdefine.js")
    },{"_process":30,"path":29}],5:[function(require,module,exports){
    // returns true if selector matches the given esprima node
    // example selectors:
    //   *
    //   statement.return
    //   expression.identifier
    //   program declaration.function > block
    //   statement.return > expression
    //   expression.literal, expression.identifier
    function test(selectorString, node) {
        // TODO: complain about syntax errors
        var alternates = selectorString.split(",");
        return alternates.some(function (selectorString) {
            var selector = splitSelector(selectorString + '>');
            return matchUpward(selector, node);
        });
    }
    
    // accepts an array of objects that look like this:
    //   { selector: "statement.return", callback: function (node) { } }
    // returns a function that takes a node and calls the callbacks that have matching selectors.
    // useful as a falafel callback.
    function tester(selectors) {
        return function (node) {
            var self = this, args = Array.prototype.slice.apply(arguments);
            selectors.forEach(function (s) {
                if (test(s.selector, node)) {
                    s.callback.apply(self, args);
                }
            });
        };
    }
    
    function splitSelector(selectorString) {
        var regexp = /([\.a-z]+)(?:\s*(>))?/ig;
        var m, pieces = [];
        while (m = regexp.exec(selectorString)) {
            var selector = {};
            var namePieces = m[1].split('.');
            if (namePieces[0].length > 0) selector.name = namePieces[0];
            if (namePieces.length > 1) selector.classes = namePieces.slice(1);
            if (m[2]) {
                selector.directDescendant = true;
            }
            pieces.push(selector);
        }
        return pieces;
    }
    
    function matchUpward(selector, node) {
        if (selector.length === 0) {
            return true;
        }
        if (!node) {
            return false;
        }
    
        var last = selector[selector.length - 1];
        var tag = nodeTag(node);
    
        if (tag && isMatch(tag, last)) {
            return matchUpward(selector.slice(0, selector.length - 1), node.parent);
        } else if (!last.directDescendant) {
            return matchUpward(selector, node.parent);
        } else {
            return false;
        }
    }
    
    function nodeTag(node) {
        if (node.type === 'Identifier') {
            var exprTag = { name: 'expression', classes: ['identifier'] };
            switch (node.parent.type) {
            case 'VariableDeclarator': if (node.parent.init === node) return decorate(exprTag); break;
            case 'AssignmentExpression': if (node.parent.right === node) return decorate(exprTag); break;
            case 'MemberExpression': if ((node.parent.object === node) || (node.parent.computed && node.parent.property === node)) return decorate(exprTag); break;
            case 'Property': if (node.parent.value === node) return decorate(exprTag); break;
            case 'ArrayExpression': return decorate(exprTag);
            case 'CallExpression': return decorate(exprTag);
            case 'BinaryExpression': return decorate(exprTag);
            case 'ConditionalExpression': return decorate(exprTag);
            case 'ReturnStatement': return decorate(exprTag);
            case 'UnaryExpression': return decorate(exprTag);
            case 'NewExpression': return decorate(exprTag);
            case 'LogicalExpression': return decorate(exprTag);
            case 'UpdateExpression': return decorate(exprTag);
            case 'SequenceExpression': return decorate(exprTag);
            case 'CatchClause': return decorate(exprTag);
            case 'ExpressionStatement': return decorate(exprTag);
            case 'IfStatement': return decorate(exprTag);
            case 'SwitchStatement': return decorate(exprTag);
            case 'ForStatement': return decorate(exprTag);
            case 'ForInStatement': return decorate(exprTag);
            case 'WhileStatement': return decorate(exprTag);
            case 'DoWhileStatement': return decorate(exprTag);
            case 'ThrowStatement': return decorate(exprTag);
            case 'FunctionDeclaration': break;
            case 'FunctionExpression': break;
            case 'LabeledStatement': break;
            case 'BreakStatement': break;
            default: throw new Error('unrecognized identifier parent ' + node.parent.type);
            }
            return undefined;
        } else if (node.type === 'Literal') {
            return decorate({ name: 'expression', classes: ['literal'] });
        } else if (node.type === 'ThisExpression') {
            return decorate({ name: 'expression', classes: ['this'] });
        } else if (node.type === 'CallExpression') {
            return decorate({ name: 'expression', classes: ['call'] });
        } else if (node.type === 'UnaryExpression') {
            return decorate({ name: 'expression', classes: ['unary'] });
        } else if (node.type === 'UpdateExpression') {
            return decorate({ name: 'expression', classes: ['update'] });
        } else if (node.type === 'BinaryExpression') {
            return decorate({ name: 'expression', classes: ['binary'] });
        } else if (node.type === 'ArrayExpression') {
            return decorate({ name: 'expression', classes: ['array'] });
        } else if (node.type === 'AssignmentExpression') {
            return decorate({ name: 'expression', classes: ['assignment'] });
        } else if (node.type === 'MemberExpression') {
            return decorate({ name: 'expression', classes: ['member'] });
        } else if (node.type === 'LogicalExpression') {
            return decorate({ name: 'expression', classes: ['logical'] });
        } else if (node.type === 'ConditionalExpression') {
            return decorate({ name: 'expression', classes: ['ternary'] });
        } else if (node.type === 'SequenceExpression') {
            return decorate({ name: 'expression', classes: ['comma'] });
        } else if (node.type === 'ObjectExpression') {
            return decorate({ name: 'expression', classes: ['object'] });
        } else if (node.type === 'NewExpression') {
            return decorate({ name: 'expression', classes: ['new'] });
        } else if (node.type === 'FunctionExpression') {
            return decorate({ name: 'expression', classes: ['function'] });
    
        } else if (node.type === 'ReturnStatement') {
            return decorate({ name: 'statement', classes: ['return'] });
        } else if (node.type === 'BreakStatement') {
            return decorate({ name: 'statement', classes: ['break'] });
        } else if (node.type === 'ContinueStatement') {
            return decorate({ name: 'statement', classes: ['break'] });
        } else if (node.type === 'LabeledStatement') {
            return decorate({ name: 'statement', classes: ['label'] });
        } else if (node.type === 'ExpressionStatement') {
            return decorate({ name: 'statement', classes: ['expression'] });
        } else if (node.type === 'IfStatement') {
            return decorate({ name: 'statement', classes: ['if'] });
        } else if (node.type === 'WhileStatement') {
            return decorate({ name: 'statement', classes: ['while'] });
        } else if (node.type === 'DoWhileStatement') {
            return decorate({ name: 'statement', classes: ['do-while'] });
        } else if (node.type === 'ThrowStatement') {
            return decorate({ name: 'statement', classes: ['throw'] });
        } else if (node.type === 'TryStatement') {
            return decorate({ name: 'statement', classes: ['try'] });
        } else if (node.type === 'CatchClause') {
            return decorate({ name: 'clause', classes: ['catch'] });
        } else if (node.type === 'ForStatement') {
            return decorate({ name: 'statement', classes: ['for'] });
        } else if (node.type === 'ForInStatement') {
            return decorate({ name: 'statement', classes: ['forin'] });
        } else if (node.type === 'SwitchStatement') {
            return decorate({ name: 'statement', classes: ['switch'] });
        } else if (node.type === 'DebuggerStatement') {
            return decorate({ name: 'statement', classes: ['debugger'] });
    
        } else if (node.type === 'BlockStatement') {
            return decorate({ name: 'block', classes: [] });
    
        } else if (node.type === 'EmptyStatement') {
            return undefined;
    
        } else if (node.type === 'VariableDeclaration') {
            return decorate({ name: 'declaration', classes: ['variable'] });
        } else if (node.type === 'FunctionDeclaration') {
            return decorate({ name: 'declaration', classes: ['function'] });
    
        } else if (node.type === 'VariableDeclarator') {
            return decorate({ name: 'declarator', classes: [] });
    
        } else if (node.type === 'Property') {
            return decorate({ name: 'property', classes: [] });
    
        } else if (node.type === 'SwitchCase') {
            return decorate({ name: 'switch-case', classes: [] });
    
        } else if (node.type === 'Program') {
            return decorate({ name: 'program', classes: [] });
        }
        // console.error(node);
        // console.error(node.source());
        throw new Error('tag not found for ' + node.type);
    
        function decorate(tag) {
            if (node.parent) {
                if (node.parent.type === 'IfStatement') {
                    if (node.parent.consequent === node) {
                        tag.classes.push('branch', 'consequent');
                    } else if (node.parent.alternate === node) {
                        tag.classes.push('branch', 'alternate');
                    }
                }
            }
            return tag;
        }
    }
    
    function isMatch(tag, selector) {
        if (('name' in selector) && selector.name !== '*' && tag.name !== selector.name) {
            return false;
        }
    
        if (('classes' in selector)) {
            for (var i in selector.classes) {
                if (tag.classes.indexOf(selector.classes[i]) === -1) {
                    return false;
                }
            }
        }
    
        return true;
    }
    
    module.exports = test;
    module.exports.tester = tester;
    module.exports.nodeTag = nodeTag;
    
    },{}],6:[function(require,module,exports){
    var eselector = require('esprima-selector');
    
    // decorates the given esprima node with tag-specific helpers.
    // statements and the like get:
    //   node.before(src) - inserts src before the node
    //   node.after(src) - inserts src after the node
    //   node.wrap(beforeSrc, afterSrc) - wraps the node
    //
    // expressions just get:
    //   node.wrap(beforeSrc, afterSrc) - wraps the node (be sure to match parentheses)
    //
    // blocks get:
    //   node.before(src) - inserts src before everything in the block
    //   node.after(src, useFinally) - inserts src after everything in the block; if useFinally is true, the block is wrapped with try-block with src in the finally clause
    module.exports = function (node, options) {
        options = (options || {});
        var primitives = options.falafelMap ? falafelMapPrimitives : falafelPrimitives;
    
        var w = eselector.nodeTag(node);
        if (w) {
            node.update = newUpdate(node);
            if (['statement', 'declaration', 'program', 'block'].indexOf(w.name) !== -1) {
                node.before = before;
                node.after = after;
                node.wrap = wrap;
            } else if (w.name === "expression") {
                node.wrap = rawWrap;
            } else if (['declarator', 'property', 'clause'].indexOf(w.name) !== -1) {
                // skip
            } else {
                throw new Error('unrecognized node ' + w.name + ' (' + node.type + ')');
            }
        }
    
        return node;
    
        function before(src) {
            rawWrap.call(this, primitives.sequence('{', src), '}');
        }
        function after(src, catchSrc) {
            if (catchSrc === true) {
                rawWrap.call(this, '{ try {', primitives.sequence('} finally {', src, '} }'));
            } else if (catchSrc) {
                rawWrap.call(this, '{ try {', primitives.sequence('} catch (__e) {', catchSrc, '} finally {', src, '} }'));
            } else {
                rawWrap.call(this, '{', primitives.sequence(src, '}'));
            }
        }
        function wrap(beforeSrc, afterSrc, useFinally) {
            this.before(beforeSrc);
            this.after(afterSrc, useFinally);
        }
        function rawWrap(beforeSrc, afterSrc) {
            this.update(beforeSrc, primitives.source(this), afterSrc);
        }
        function newUpdate(node) {
            var oldUpdate = node.update;
            return function () {
                var seq = primitives.sequence.apply(this, arguments);
                return oldUpdate.call(this, seq);
            };
        }
    }
    
    // returns a version of f where the node argument has been wrapped with the function above
    module.exports.wrap = function (f, options) {
        return function (node) {
            return f(module.exports(node, options));
        };
    };
    
    var falafelPrimitives = {
        sequence: function () { return Array.prototype.join.call(arguments, '') },
        source: function (node) { return node.source() },
    };
    
    var falafelMapPrimitives = {
        sequence: function () { return Array.prototype.slice.call(arguments) },
        source: function (node) { return node.sourceNodes() },
    };
    
    },{"esprima-selector":5}],7:[function(require,module,exports){
    (function (Buffer){
    var parse = require('esprima').parse;
    var SourceNode = require("source-map").SourceNode;
    
    var objectKeys = Object.keys || function (obj) {
        var keys = [];
        for (var key in obj) keys.push(key);
        return keys;
    };
    var forEach = function (xs, fn) {
        if (xs.forEach) return xs.forEach(fn);
        for (var i = 0; i < xs.length; i++) {
            fn.call(xs, xs[i], i, xs);
        }
    };
    
    var isArray = Array.isArray || function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]';
    };
    
    var base64 = function (str) {
        return new Buffer(str).toString('base64');
    }
    
    module.exports = function (src, opts, fn) {
        if (typeof opts === 'function') {
            fn = opts;
            opts = {};
        }
        if (typeof src === 'object') {
            opts = src;
            src = opts.source;
            delete opts.source;
        }
        src = src === undefined ? opts.source : src;
        opts.range = true;
        opts.loc = true;
        if (typeof src !== 'string') src = String(src);
        
        var ast = parse(src, opts);
        
        var result = {
            chunks : src.split(''),
            map : function () {
                var root = new SourceNode(null, null, null, result.chunks);
                root.setSourceContent(opts.sourceFilename || "in.js", src);
                var sm = root.toStringWithSourceMap({ file: opts.generatedFilename || "out.js" });
                return sm.map.toString();
            },
            toString : function () {
                var root = new SourceNode(null, null, null, result.chunks);
                root.setSourceContent(opts.sourceFilename || "in.js", src);
                var sm = root.toStringWithSourceMap({ file: opts.generatedFilename || "out.js" });
                return sm.code + "\n//@ sourceMappingURL=data:application/json;base64," + base64(sm.map.toString()) + "\n";
            },
            inspect : function () { return result.toString() }
        };
        var index = 0;
        
        (function walk (node, parent) {
            insertHelpers(node, parent, result.chunks, opts);
            
            forEach(objectKeys(node), function (key) {
                if (key === 'parent') return;
                
                var child = node[key];
                if (isArray(child)) {
                    forEach(child, function (c) {
                        if (c && typeof c.type === 'string') {
                            walk(c, node);
                        }
                    });
                }
                else if (child && typeof child.type === 'string') {
                    insertHelpers(child, node, result.chunks, opts);
                    walk(child, node);
                }
            });
            fn(node);
        })(ast, undefined);
        
        return result;
    };
     
    function insertHelpers (node, parent, chunks, opts) {
        if (!node.range) return;
        
        node.parent = parent;
        
        node.source = function () {
            return chunks.slice(
                node.range[0], node.range[1]
            ).join('');
        };
        
        node.sourceNodes = function () {
            return chunks.slice(
                node.range[0], node.range[1]
            );
        };
        
        if (node.update && typeof node.update === 'object') {
            var prev = node.update;
            forEach(objectKeys(prev), function (key) {
                update[key] = prev[key];
            });
            node.update = update;
        }
        else {
            node.update = update;
        }
        
        function update () {
            chunks[node.range[0]] = new SourceNode(
                node.loc.start.line,
                node.loc.start.column,
                opts.sourceFilename || "in.js",
                Array.prototype.slice.apply(arguments));
            for (var i = node.range[0] + 1; i < node.range[1]; i++) {
                chunks[i] = '';
            }
        };
        
        node.replace = function (sourceNode) {
            chunks[node.range[0]] = sourceNode;
            for (var i = node.range[0] + 1; i < node.range[1]; i++) {
                chunks[i] = '';
            }
        };
        
        node.prepend = function () {
            var prevNode = new SourceNode(null, null, null, node.sourceNodes());
            prevNode.prepend(new SourceNode(null, null, null, Array.prototype.slice.apply(arguments)));
            node.replace(prevNode);
        };
        
        node.append = function () {
            var prevNode = new SourceNode(null, null, null, node.sourceNodes());
            prevNode.add(new SourceNode(null, null, null, Array.prototype.slice.apply(arguments)));
            node.replace(prevNode);
        };
    }
    
    }).call(this,require("buffer").Buffer)
    },{"buffer":27,"esprima":8,"source-map":14}],8:[function(require,module,exports){
    /*
      Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>
      Copyright (C) 2012 Mathias Bynens <mathias@qiwi.be>
      Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
      Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
      Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
      Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>
      Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>
    
      Redistribution and use in source and binary forms, with or without
      modification, are permitted provided that the following conditions are met:
    
        * Redistributions of source code must retain the above copyright
          notice, this list of conditions and the following disclaimer.
        * Redistributions in binary form must reproduce the above copyright
          notice, this list of conditions and the following disclaimer in the
          documentation and/or other materials provided with the distribution.
    
      THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
      AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
      IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
      ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
      DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
      (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
      LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
      ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
      (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
      THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    */
    
    /*jslint bitwise:true plusplus:true */
    /*global esprima:true, define:true, exports:true, window: true,
    throwError: true, generateStatement: true, peek: true,
    parseAssignmentExpression: true, parseBlock: true, parseExpression: true,
    parseFunctionDeclaration: true, parseFunctionExpression: true,
    parseFunctionSourceElements: true, parseVariableIdentifier: true,
    parseLeftHandSideExpression: true,
    parseStatement: true, parseSourceElement: true */
    
    (function (root, factory) {
        'use strict';
    
        // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
        // Rhino, and plain browser loading.
        if (typeof define === 'function' && define.amd) {
            define(['exports'], factory);
        } else if (typeof exports !== 'undefined') {
            factory(exports);
        } else {
            factory((root.esprima = {}));
        }
    }(this, function (exports) {
        'use strict';
    
        var Token,
            TokenName,
            Syntax,
            PropertyKind,
            Messages,
            Regex,
            SyntaxTreeDelegate,
            source,
            strict,
            index,
            lineNumber,
            lineStart,
            length,
            delegate,
            lookahead,
            state,
            extra;
    
        Token = {
            BooleanLiteral: 1,
            EOF: 2,
            Identifier: 3,
            Keyword: 4,
            NullLiteral: 5,
            NumericLiteral: 6,
            Punctuator: 7,
            StringLiteral: 8
        };
    
        TokenName = {};
        TokenName[Token.BooleanLiteral] = 'Boolean';
        TokenName[Token.EOF] = '<end>';
        TokenName[Token.Identifier] = 'Identifier';
        TokenName[Token.Keyword] = 'Keyword';
        TokenName[Token.NullLiteral] = 'Null';
        TokenName[Token.NumericLiteral] = 'Numeric';
        TokenName[Token.Punctuator] = 'Punctuator';
        TokenName[Token.StringLiteral] = 'String';
    
        Syntax = {
            AssignmentExpression: 'AssignmentExpression',
            ArrayExpression: 'ArrayExpression',
            BlockStatement: 'BlockStatement',
            BinaryExpression: 'BinaryExpression',
            BreakStatement: 'BreakStatement',
            CallExpression: 'CallExpression',
            CatchClause: 'CatchClause',
            ConditionalExpression: 'ConditionalExpression',
            ContinueStatement: 'ContinueStatement',
            DoWhileStatement: 'DoWhileStatement',
            DebuggerStatement: 'DebuggerStatement',
            EmptyStatement: 'EmptyStatement',
            ExpressionStatement: 'ExpressionStatement',
            ForStatement: 'ForStatement',
            ForInStatement: 'ForInStatement',
            FunctionDeclaration: 'FunctionDeclaration',
            FunctionExpression: 'FunctionExpression',
            Identifier: 'Identifier',
            IfStatement: 'IfStatement',
            Literal: 'Literal',
            LabeledStatement: 'LabeledStatement',
            LogicalExpression: 'LogicalExpression',
            MemberExpression: 'MemberExpression',
            NewExpression: 'NewExpression',
            ObjectExpression: 'ObjectExpression',
            Program: 'Program',
            Property: 'Property',
            ReturnStatement: 'ReturnStatement',
            SequenceExpression: 'SequenceExpression',
            SwitchStatement: 'SwitchStatement',
            SwitchCase: 'SwitchCase',
            ThisExpression: 'ThisExpression',
            ThrowStatement: 'ThrowStatement',
            TryStatement: 'TryStatement',
            UnaryExpression: 'UnaryExpression',
            UpdateExpression: 'UpdateExpression',
            VariableDeclaration: 'VariableDeclaration',
            VariableDeclarator: 'VariableDeclarator',
            WhileStatement: 'WhileStatement',
            WithStatement: 'WithStatement'
        };
    
        PropertyKind = {
            Data: 1,
            Get: 2,
            Set: 4
        };
    
        // Error messages should be identical to V8.
        Messages = {
            UnexpectedToken:  'Unexpected token %0',
            UnexpectedNumber:  'Unexpected number',
            UnexpectedString:  'Unexpected string',
            UnexpectedIdentifier:  'Unexpected identifier',
            UnexpectedReserved:  'Unexpected reserved word',
            UnexpectedEOS:  'Unexpected end of input',
            NewlineAfterThrow:  'Illegal newline after throw',
            InvalidRegExp: 'Invalid regular expression',
            UnterminatedRegExp:  'Invalid regular expression: missing /',
            InvalidLHSInAssignment:  'Invalid left-hand side in assignment',
            InvalidLHSInForIn:  'Invalid left-hand side in for-in',
            MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
            NoCatchOrFinally:  'Missing catch or finally after try',
            UnknownLabel: 'Undefined label \'%0\'',
            Redeclaration: '%0 \'%1\' has already been declared',
            IllegalContinue: 'Illegal continue statement',
            IllegalBreak: 'Illegal break statement',
            IllegalReturn: 'Illegal return statement',
            StrictModeWith:  'Strict mode code may not include a with statement',
            StrictCatchVariable:  'Catch variable may not be eval or arguments in strict mode',
            StrictVarName:  'Variable name may not be eval or arguments in strict mode',
            StrictParamName:  'Parameter name eval or arguments is not allowed in strict mode',
            StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
            StrictFunctionName:  'Function name may not be eval or arguments in strict mode',
            StrictOctalLiteral:  'Octal literals are not allowed in strict mode.',
            StrictDelete:  'Delete of an unqualified identifier in strict mode.',
            StrictDuplicateProperty:  'Duplicate data property in object literal not allowed in strict mode',
            AccessorDataProperty:  'Object literal may not have data and accessor property with the same name',
            AccessorGetSet:  'Object literal may not have multiple get/set accessors with the same name',
            StrictLHSAssignment:  'Assignment to eval or arguments is not allowed in strict mode',
            StrictLHSPostfix:  'Postfix increment/decrement may not have eval or arguments operand in strict mode',
            StrictLHSPrefix:  'Prefix increment/decrement may not have eval or arguments operand in strict mode',
            StrictReservedWord:  'Use of future reserved word in strict mode'
        };
    
        // See also tools/generate-unicode-regex.py.
        Regex = {
            NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
            NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
        };
    
        // Ensure the condition is true, otherwise throw an error.
        // This is only to have a better contract semantic, i.e. another safety net
        // to catch a logic error. The condition shall be fulfilled in normal case.
        // Do NOT use this to enforce a certain condition on any user input.
    
        function assert(condition, message) {
            if (!condition) {
                throw new Error('ASSERT: ' + message);
            }
        }
    
        function isDecimalDigit(ch) {
            return (ch >= 48 && ch <= 57);   // 0..9
        }
    
        function isHexDigit(ch) {
            return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;
        }
    
        function isOctalDigit(ch) {
            return '01234567'.indexOf(ch) >= 0;
        }
    
    
        // 7.2 White Space
    
        function isWhiteSpace(ch) {
            return (ch === 32) ||  // space
                (ch === 9) ||      // tab
                (ch === 0xB) ||
                (ch === 0xC) ||
                (ch === 0xA0) ||
                (ch >= 0x1680 && '\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF'.indexOf(String.fromCharCode(ch)) > 0);
        }
    
        // 7.3 Line Terminators
    
        function isLineTerminator(ch) {
            return (ch === 10) || (ch === 13) || (ch === 0x2028) || (ch === 0x2029);
        }
    
        // 7.6 Identifier Names and Identifiers
    
        function isIdentifierStart(ch) {
            return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
                (ch >= 65 && ch <= 90) ||         // A..Z
                (ch >= 97 && ch <= 122) ||        // a..z
                (ch === 92) ||                    // \ (backslash)
                ((ch >= 0x80) && Regex.NonAsciiIdentifierStart.test(String.fromCharCode(ch)));
        }
    
        function isIdentifierPart(ch) {
            return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
                (ch >= 65 && ch <= 90) ||         // A..Z
                (ch >= 97 && ch <= 122) ||        // a..z
                (ch >= 48 && ch <= 57) ||         // 0..9
                (ch === 92) ||                    // \ (backslash)
                ((ch >= 0x80) && Regex.NonAsciiIdentifierPart.test(String.fromCharCode(ch)));
        }
    
        // 7.6.1.2 Future Reserved Words
    
        function isFutureReservedWord(id) {
            switch (id) {
            case 'class':
            case 'enum':
            case 'export':
            case 'extends':
            case 'import':
            case 'super':
                return true;
            default:
                return false;
            }
        }
    
        function isStrictModeReservedWord(id) {
            switch (id) {
            case 'implements':
            case 'interface':
            case 'package':
            case 'private':
            case 'protected':
            case 'public':
            case 'static':
            case 'yield':
            case 'let':
                return true;
            default:
                return false;
            }
        }
    
        function isRestrictedWord(id) {
            return id === 'eval' || id === 'arguments';
        }
    
        // 7.6.1.1 Keywords
    
        function isKeyword(id) {
            var keywordOverride;
            if (typeof extra.isKeyword === 'function') {
                keywordOverride = extra.isKeyword(id);
                if (typeof keywordOverride === 'boolean'
                || typeof keywordOverride === 'string') {
                    return keywordOverride;
                }
            }
            if (strict && isStrictModeReservedWord(id)) {
                return true;
            }
    
            // 'const' is specialized as Keyword in V8.
            // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
            // Some others are from future reserved words.
    
            switch (id.length) {
            case 2:
                return (id === 'if') || (id === 'in') || (id === 'do');
            case 3:
                return (id === 'var') || (id === 'for') || (id === 'new') ||
                    (id === 'try') || (id === 'let');
            case 4:
                return (id === 'this') || (id === 'else') || (id === 'case') ||
                    (id === 'void') || (id === 'with') || (id === 'enum');
            case 5:
                return (id === 'while') || (id === 'break') || (id === 'catch') ||
                    (id === 'throw') || (id === 'const') || (id === 'yield') ||
                    (id === 'class') || (id === 'super');
            case 6:
                return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
                    (id === 'switch') || (id === 'export') || (id === 'import');
            case 7:
                return (id === 'default') || (id === 'finally') || (id === 'extends');
            case 8:
                return (id === 'function') || (id === 'continue') || (id === 'debugger');
            case 10:
                return (id === 'instanceof');
            default:
                return false;
            }
        }
    
        // 7.4 Comments
    
        function skipComment() {
            var ch, blockComment, lineComment;
    
            blockComment = false;
            lineComment = false;
    
            while (index < length) {
                ch = source.charCodeAt(index);
    
                if (lineComment) {
                    ++index;
                    if (isLineTerminator(ch)) {
                        lineComment = false;
                        if (ch === 13 && source.charCodeAt(index) === 10) {
                            ++index;
                        }
                        ++lineNumber;
                        lineStart = index;
                    }
                } else if (blockComment) {
                    if (isLineTerminator(ch)) {
                        if (ch === 13 && source.charCodeAt(index + 1) === 10) {
                            ++index;
                        }
                        ++lineNumber;
                        ++index;
                        lineStart = index;
                        if (index >= length) {
                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                        }
                    } else {
                        ch = source.charCodeAt(index++);
                        if (index >= length) {
                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                        }
                        // Block comment ends with '*/' (char #42, char #47).
                        if (ch === 42) {
                            ch = source.charCodeAt(index);
                            if (ch === 47) {
                                ++index;
                                blockComment = false;
                            }
                        }
                    }
                } else if (ch === 47) {
                    ch = source.charCodeAt(index + 1);
                    // Line comment starts with '//' (char #47, char #47).
                    if (ch === 47) {
                        index += 2;
                        lineComment = true;
                    } else if (ch === 42) {
                        // Block comment starts with '/*' (char #47, char #42).
                        index += 2;
                        blockComment = true;
                        if (index >= length) {
                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                        }
                    } else {
                        break;
                    }
                } else if (isWhiteSpace(ch)) {
                    ++index;
                } else if (isLineTerminator(ch)) {
                    ++index;
                    if (ch === 13 && source.charCodeAt(index) === 10) {
                        ++index;
                    }
                    ++lineNumber;
                    lineStart = index;
                } else {
                    break;
                }
            }
        }
    
        function scanHexEscape(prefix) {
            var i, len, ch, code = 0;
    
            len = (prefix === 'u') ? 4 : 2;
            for (i = 0; i < len; ++i) {
                if (index < length && isHexDigit(source[index])) {
                    ch = source[index++];
                    code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
                } else {
                    return '';
                }
            }
            return String.fromCharCode(code);
        }
    
        function getEscapedIdentifier() {
            var ch, id;
    
            ch = source.charCodeAt(index++);
            id = String.fromCharCode(ch);
    
            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch === 92) {
                if (source.charCodeAt(index) !== 117) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
                ++index;
                ch = scanHexEscape('u');
                if (!ch || ch === '\\' || !isIdentifierStart(ch.charCodeAt(0))) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
                id = ch;
            }
    
            while (index < length) {
                ch = source.charCodeAt(index);
                if (!isIdentifierPart(ch)) {
                    break;
                }
                ++index;
                id += String.fromCharCode(ch);
    
                // '\u' (char #92, char #117) denotes an escaped character.
                if (ch === 92) {
                    id = id.substr(0, id.length - 1);
                    if (source.charCodeAt(index) !== 117) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                    ++index;
                    ch = scanHexEscape('u');
                    if (!ch || ch === '\\' || !isIdentifierPart(ch.charCodeAt(0))) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                    id += ch;
                }
            }
    
            return id;
        }
    
        function getIdentifier() {
            var start, ch;
    
            start = index++;
            while (index < length) {
                ch = source.charCodeAt(index);
                if (ch === 92) {
                    // Blackslash (char #92) marks Unicode escape sequence.
                    index = start;
                    return getEscapedIdentifier();
                }
                if (isIdentifierPart(ch)) {
                    ++index;
                } else {
                    break;
                }
            }
    
            return source.slice(start, index);
        }
    
        function scanIdentifier() {
            var start, id, fakeId, type;
    
            start = index;
    
            // Backslash (char #92) starts an escaped character.
            id = (source.charCodeAt(index) === 92) ? getEscapedIdentifier() : getIdentifier();
    
            // There is no keyword or literal with only one character.
            // Thus, it must be an identifier.
            if (id.length === 1) {
                type = Token.Identifier;
            } else if (fakeId = isKeyword(id)) {
                if (typeof fakeId === 'string') {
                    if (fakeId === 'block') {
                        lookahead = advance();
                        lookahead.keyword = id;
                        return lookahead;
                    }
                    id = fakeId;
                }
                type = Token.Keyword;
            } else if (id === 'null') {
                type = Token.NullLiteral;
            } else if (id === 'true' || id === 'false') {
                type = Token.BooleanLiteral;
            } else {
                type = Token.Identifier;
            }
    
            return {
                type: type,
                value: id,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }
    
    
        // 7.7 Punctuators
    
        function scanPunctuator() {
            var start = index,
                code = source.charCodeAt(index),
                code2,
                ch1 = source[index],
                ch2,
                ch3,
                ch4;
    
            switch (code) {
    
            // Check for most common single-character punctuators.
            case 46:   // . dot
            case 40:   // ( open bracket
            case 41:   // ) close bracket
            case 59:   // ; semicolon
            case 44:   // , comma
            case 123:  // { open curly brace
            case 125:  // } close curly brace
            case 91:   // [
            case 93:   // ]
            case 58:   // :
            case 63:   // ?
            case 126:  // ~
                ++index;
                return {
                    type: Token.Punctuator,
                    value: String.fromCharCode(code),
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
    
            default:
                code2 = source.charCodeAt(index + 1);
    
                // '=' (char #61) marks an assignment or comparison operator.
                if (code2 === 61) {
                    switch (code) {
                    case 37:  // %
                    case 38:  // &
                    case 42:  // *:
                    case 43:  // +
                    case 45:  // -
                    case 47:  // /
                    case 60:  // <
                    case 62:  // >
                    case 94:  // ^
                    case 124: // |
                        index += 2;
                        return {
                            type: Token.Punctuator,
                            value: String.fromCharCode(code) + String.fromCharCode(code2),
                            lineNumber: lineNumber,
                            lineStart: lineStart,
                            range: [start, index]
                        };
    
                    case 33: // !
                    case 61: // =
                        index += 2;
    
                        // !== and ===
                        if (source.charCodeAt(index) === 61) {
                            ++index;
                        }
                        return {
                            type: Token.Punctuator,
                            value: source.slice(start, index),
                            lineNumber: lineNumber,
                            lineStart: lineStart,
                            range: [start, index]
                        };
                    default:
                        break;
                    }
                }
                break;
            }
    
            // Peek more characters.
    
            ch2 = source[index + 1];
            ch3 = source[index + 2];
            ch4 = source[index + 3];
    
            // 4-character punctuator: >>>=
    
            if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
                if (ch4 === '=') {
                    index += 4;
                    return {
                        type: Token.Punctuator,
                        value: '>>>=',
                        lineNumber: lineNumber,
                        lineStart: lineStart,
                        range: [start, index]
                    };
                }
            }
    
            // 3-character punctuators: === !== >>> <<= >>=
    
            if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
                index += 3;
                return {
                    type: Token.Punctuator,
                    value: '>>>',
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
            }
    
            if (ch1 === '<' && ch2 === '<' && ch3 === '=') {
                index += 3;
                return {
                    type: Token.Punctuator,
                    value: '<<=',
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
            }
    
            if (ch1 === '>' && ch2 === '>' && ch3 === '=') {
                index += 3;
                return {
                    type: Token.Punctuator,
                    value: '>>=',
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
            }
    
            // Other 2-character punctuators: ++ -- << >> && ||
    
            if (ch1 === ch2 && ('+-<>&|'.indexOf(ch1) >= 0)) {
                index += 2;
                return {
                    type: Token.Punctuator,
                    value: ch1 + ch2,
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
            }
    
            if ('<>=!+-*%&|^/'.indexOf(ch1) >= 0) {
                ++index;
                return {
                    type: Token.Punctuator,
                    value: ch1,
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
            }
    
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }
    
        // 7.8.3 Numeric Literals
    
        function scanHexLiteral(start) {
            var number = '';
    
            while (index < length) {
                if (!isHexDigit(source[index])) {
                    break;
                }
                number += source[index++];
            }
    
            if (number.length === 0) {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
    
            if (isIdentifierStart(source.charCodeAt(index))) {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
    
            return {
                type: Token.NumericLiteral,
                value: parseInt('0x' + number, 16),
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }
    
        function scanOctalLiteral(start) {
            var number = '0' + source[index++];
            while (index < length) {
                if (!isOctalDigit(source[index])) {
                    break;
                }
                number += source[index++];
            }
    
            if (isIdentifierStart(source.charCodeAt(index)) || isDecimalDigit(source.charCodeAt(index))) {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
    
            return {
                type: Token.NumericLiteral,
                value: parseInt(number, 8),
                octal: true,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }
    
        function scanNumericLiteral() {
            var number, start, ch;
    
            ch = source[index];
            assert(isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'),
                'Numeric literal must start with a decimal digit or a decimal point');
    
            start = index;
            number = '';
            if (ch !== '.') {
                number = source[index++];
                ch = source[index];
    
                // Hex number starts with '0x'.
                // Octal number starts with '0'.
                if (number === '0') {
                    if (ch === 'x' || ch === 'X') {
                        ++index;
                        return scanHexLiteral(start);
                    }
                    if (isOctalDigit(ch)) {
                        return scanOctalLiteral(start);
                    }
    
                    // decimal number starts with '0' such as '09' is illegal.
                    if (ch && isDecimalDigit(ch.charCodeAt(0))) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                }
    
                while (isDecimalDigit(source.charCodeAt(index))) {
                    number += source[index++];
                }
                ch = source[index];
            }
    
            if (ch === '.') {
                number += source[index++];
                while (isDecimalDigit(source.charCodeAt(index))) {
                    number += source[index++];
                }
                ch = source[index];
            }
    
            if (ch === 'e' || ch === 'E') {
                number += source[index++];
    
                ch = source[index];
                if (ch === '+' || ch === '-') {
                    number += source[index++];
                }
                if (isDecimalDigit(source.charCodeAt(index))) {
                    while (isDecimalDigit(source.charCodeAt(index))) {
                        number += source[index++];
                    }
                } else {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
            }
    
            if (isIdentifierStart(source.charCodeAt(index))) {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
    
            return {
                type: Token.NumericLiteral,
                value: parseFloat(number),
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }
    
        // 7.8.4 String Literals
    
        function scanStringLiteral() {
            var str = '', quote, start, ch, code, unescaped, restore, octal = false;
    
            quote = source[index];
            assert((quote === '\'' || quote === '"'),
                'String literal must starts with a quote');
    
            start = index;
            ++index;
    
            while (index < length) {
                ch = source[index++];
    
                if (ch === quote) {
                    quote = '';
                    break;
                } else if (ch === '\\') {
                    ch = source[index++];
                    if (!ch || !isLineTerminator(ch.charCodeAt(0))) {
                        switch (ch) {
                        case 'n':
                            str += '\n';
                            break;
                        case 'r':
                            str += '\r';
                            break;
                        case 't':
                            str += '\t';
                            break;
                        case 'u':
                        case 'x':
                            restore = index;
                            unescaped = scanHexEscape(ch);
                            if (unescaped) {
                                str += unescaped;
                            } else {
                                index = restore;
                                str += ch;
                            }
                            break;
                        case 'b':
                            str += '\b';
                            break;
                        case 'f':
                            str += '\f';
                            break;
                        case 'v':
                            str += '\v';
                            break;
    
                        default:
                            if (isOctalDigit(ch)) {
                                code = '01234567'.indexOf(ch);
    
                                // \0 is not octal escape sequence
                                if (code !== 0) {
                                    octal = true;
                                }
    
                                if (index < length && isOctalDigit(source[index])) {
                                    octal = true;
                                    code = code * 8 + '01234567'.indexOf(source[index++]);
    
                                    // 3 digits are only allowed when string starts
                                    // with 0, 1, 2, 3
                                    if ('0123'.indexOf(ch) >= 0 &&
                                            index < length &&
                                            isOctalDigit(source[index])) {
                                        code = code * 8 + '01234567'.indexOf(source[index++]);
                                    }
                                }
                                str += String.fromCharCode(code);
                            } else {
                                str += ch;
                            }
                            break;
                        }
                    } else {
                        ++lineNumber;
                        if (ch ===  '\r' && source[index] === '\n') {
                            ++index;
                        }
                    }
                } else if (isLineTerminator(ch.charCodeAt(0))) {
                    break;
                } else {
                    str += ch;
                }
            }
    
            if (quote !== '') {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
    
            return {
                type: Token.StringLiteral,
                value: str,
                octal: octal,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }
    
        function scanRegExp() {
            var str, ch, start, pattern, flags, value, classMarker = false, restore, terminated = false;
    
            lookahead = null;
            skipComment();
    
            start = index;
            ch = source[index];
            assert(ch === '/', 'Regular expression literal must start with a slash');
            str = source[index++];
    
            while (index < length) {
                ch = source[index++];
                str += ch;
                if (classMarker) {
                    if (ch === ']') {
                        classMarker = false;
                    }
                } else {
                    if (ch === '\\') {
                        ch = source[index++];
                        // ECMA-262 7.8.5
                        if (isLineTerminator(ch.charCodeAt(0))) {
                            throwError({}, Messages.UnterminatedRegExp);
                        }
                        str += ch;
                    } else if (ch === '/') {
                        terminated = true;
                        break;
                    } else if (ch === '[') {
                        classMarker = true;
                    } else if (isLineTerminator(ch.charCodeAt(0))) {
                        throwError({}, Messages.UnterminatedRegExp);
                    }
                }
            }
    
            if (!terminated) {
                throwError({}, Messages.UnterminatedRegExp);
            }
    
            // Exclude leading and trailing slash.
            pattern = str.substr(1, str.length - 2);
    
            flags = '';
            while (index < length) {
                ch = source[index];
                if (!isIdentifierPart(ch.charCodeAt(0))) {
                    break;
                }
    
                ++index;
                if (ch === '\\' && index < length) {
                    ch = source[index];
                    if (ch === 'u') {
                        ++index;
                        restore = index;
                        ch = scanHexEscape('u');
                        if (ch) {
                            flags += ch;
                            for (str += '\\u'; restore < index; ++restore) {
                                str += source[restore];
                            }
                        } else {
                            index = restore;
                            flags += 'u';
                            str += '\\u';
                        }
                    } else {
                        str += '\\';
                    }
                } else {
                    flags += ch;
                    str += ch;
                }
            }
    
            try {
                value = new RegExp(pattern, flags);
            } catch (e) {
                throwError({}, Messages.InvalidRegExp);
            }
    
            peek();
    
            return {
                literal: str,
                value: value,
                range: [start, index]
            };
        }
    
        function isIdentifierName(token) {
            return token.type === Token.Identifier ||
                token.type === Token.Keyword ||
                token.type === Token.BooleanLiteral ||
                token.type === Token.NullLiteral;
        }
    
        function advance() {
            var ch;
    
            skipComment();
    
            if (index >= length) {
                return {
                    type: Token.EOF,
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [index, index]
                };
            }
    
            ch = source.charCodeAt(index);
    
            // Very common: ( and ) and ;
            if (ch === 40 || ch === 41 || ch === 58) {
                return scanPunctuator();
            }
    
            // String literal starts with single quote (#39) or double quote (#34).
            if (ch === 39 || ch === 34) {
                return scanStringLiteral();
            }
    
            if (isIdentifierStart(ch)) {
                return scanIdentifier();
            }
    
            // Dot (.) char #46 can also start a floating-point number, hence the need
            // to check the next character.
            if (ch === 46) {
                if (isDecimalDigit(source.charCodeAt(index + 1))) {
                    return scanNumericLiteral();
                }
                return scanPunctuator();
            }
    
            if (isDecimalDigit(ch)) {
                return scanNumericLiteral();
            }
    
            return scanPunctuator();
        }
    
        function lex() {
            var token;
    
            token = lookahead;
            index = token.range[1];
            lineNumber = token.lineNumber;
            lineStart = token.lineStart;
    
            lookahead = advance();
    
            index = token.range[1];
            lineNumber = token.lineNumber;
            lineStart = token.lineStart;
    
            return token;
        }
    
        function peek() {
            var pos, line, start;
    
            pos = index;
            line = lineNumber;
            start = lineStart;
            lookahead = advance();
            index = pos;
            lineNumber = line;
            lineStart = start;
        }
    
        SyntaxTreeDelegate = {
    
            name: 'SyntaxTree',
    
            postProcess: function (node) {
                return node;
            },
    
            createArrayExpression: function (elements) {
                return {
                    type: Syntax.ArrayExpression,
                    elements: elements
                };
            },
    
            createAssignmentExpression: function (operator, left, right) {
                return {
                    type: Syntax.AssignmentExpression,
                    operator: operator,
                    left: left,
                    right: right
                };
            },
    
            createBinaryExpression: function (operator, left, right) {
                var type = (operator === '||' || operator === '&&') ? Syntax.LogicalExpression :
                            Syntax.BinaryExpression;
                return {
                    type: type,
                    operator: operator,
                    left: left,
                    right: right
                };
            },
    
            createBlockStatement: function (body) {
                return {
                    type: Syntax.BlockStatement,
                    body: body
                };
            },
     
            createBreakStatement: function (label) {
                return {
                    type: Syntax.BreakStatement,
                    label: label
                };
            },
    
            createCallExpression: function (callee, args) {
                return {
                    type: Syntax.CallExpression,
                    callee: callee,
                    'arguments': args
                };
            },
    
            createCatchClause: function (param, body) {
                return {
                    type: Syntax.CatchClause,
                    param: param,
                    body: body
                };
            },
    
            createConditionalExpression: function (test, consequent, alternate) {
                return {
                    type: Syntax.ConditionalExpression,
                    test: test,
                    consequent: consequent,
                    alternate: alternate
                };
            },
    
            createContinueStatement: function (label) {
                return {
                    type: Syntax.ContinueStatement,
                    label: label
                };
            },
    
            createDebuggerStatement: function () {
                return {
                    type: Syntax.DebuggerStatement
                };
            },
    
            createDoWhileStatement: function (body, test) {
                return {
                    type: Syntax.DoWhileStatement,
                    body: body,
                    test: test
                };
            },
    
            createEmptyStatement: function () {
                return {
                    type: Syntax.EmptyStatement
                };
            },
    
            createExpressionStatement: function (expression) {
                return {
                    type: Syntax.ExpressionStatement,
                    expression: expression
                };
            },
    
            createForStatement: function (init, test, update, body) {
                return {
                    type: Syntax.ForStatement,
                    init: init,
                    test: test,
                    update: update,
                    body: body
                };
            },
    
            createForInStatement: function (left, right, body) {
                return {
                    type: Syntax.ForInStatement,
                    left: left,
                    right: right,
                    body: body,
                    each: false
                };
            },
    
            createFunctionDeclaration: function (id, params, defaults, body) {
                return {
                    type: Syntax.FunctionDeclaration,
                    id: id,
                    params: params,
                    defaults: defaults,
                    body: body,
                    rest: null,
                    generator: false,
                    expression: false
                };
            },
    
            createFunctionExpression: function (id, params, defaults, body) {
                return {
                    type: Syntax.FunctionExpression,
                    id: id,
                    params: params,
                    defaults: defaults,
                    body: body,
                    rest: null,
                    generator: false,
                    expression: false
                };
            },
    
            createIdentifier: function (name) {
                return {
                    type: Syntax.Identifier,
                    name: name
                };
            },
    
            createIfStatement: function (test, consequent, alternate) {
                return {
                    type: Syntax.IfStatement,
                    test: test,
                    consequent: consequent,
                    alternate: alternate
                };
            },
    
            createLabeledStatement: function (label, body) {
                return {
                    type: Syntax.LabeledStatement,
                    label: label,
                    body: body
                };
            },
    
            createLiteral: function (token) {
                return {
                    type: Syntax.Literal,
                    value: token.value,
                    raw: source.slice(token.range[0], token.range[1])
                };
            },
    
            createMemberExpression: function (accessor, object, property) {
                return {
                    type: Syntax.MemberExpression,
                    computed: accessor === '[',
                    object: object,
                    property: property
                };
            },
    
            createNewExpression: function (callee, args) {
                return {
                    type: Syntax.NewExpression,
                    callee: callee,
                    'arguments': args
                };
            },
    
            createObjectExpression: function (properties) {
                return {
                    type: Syntax.ObjectExpression,
                    properties: properties
                };
            },
    
            createPostfixExpression: function (operator, argument) {
                return {
                    type: Syntax.UpdateExpression,
                    operator: operator,
                    argument: argument,
                    prefix: false
                };
            },
    
            createProgram: function (body) {
                return {
                    type: Syntax.Program,
                    body: body
                };
            },
    
            createProperty: function (kind, key, value) {
                return {
                    type: Syntax.Property,
                    key: key,
                    value: value,
                    kind: kind
                };
            },
    
            createReturnStatement: function (argument) {
                return {
                    type: Syntax.ReturnStatement,
                    argument: argument
                };
            },
    
            createSequenceExpression: function (expressions) {
                return {
                    type: Syntax.SequenceExpression,
                    expressions: expressions
                };
            },
    
            createSwitchCase: function (test, consequent) {
                return {
                    type: Syntax.SwitchCase,
                    test: test,
                    consequent: consequent
                };
            },
    
            createSwitchStatement: function (discriminant, cases) {
                return {
                    type: Syntax.SwitchStatement,
                    discriminant: discriminant,
                    cases: cases
                };
            },
    
            createThisExpression: function () {
                return {
                    type: Syntax.ThisExpression
                };
            },
    
            createThrowStatement: function (argument) {
                return {
                    type: Syntax.ThrowStatement,
                    argument: argument
                };
            },
    
            createTryStatement: function (block, guardedHandlers, handlers, finalizer) {
                return {
                    type: Syntax.TryStatement,
                    block: block,
                    guardedHandlers: guardedHandlers,
                    handlers: handlers,
                    finalizer: finalizer
                };
            },
    
            createUnaryExpression: function (operator, argument) {
                if (operator === '++' || operator === '--') {
                    return {
                        type: Syntax.UpdateExpression,
                        operator: operator,
                        argument: argument,
                        prefix: true
                    };
                }
                var res = {
                    type: Syntax.UnaryExpression,
                    operator: operator,
                    argument: argument
                };
                if (/^\w/.test(operator)) res.keyword = operator;
                return res;
            },
    
            createVariableDeclaration: function (declarations, kind) {
                return {
                    type: Syntax.VariableDeclaration,
                    declarations: declarations,
                    kind: kind
                };
            },
    
            createVariableDeclarator: function (id, init) {
                return {
                    type: Syntax.VariableDeclarator,
                    id: id,
                    init: init
                };
            },
    
            createWhileStatement: function (test, body) {
                return {
                    type: Syntax.WhileStatement,
                    test: test,
                    body: body
                };
            },
    
            createWithStatement: function (object, body) {
                return {
                    type: Syntax.WithStatement,
                    object: object,
                    body: body
                };
            }
        };
    
        // Return true if there is a line terminator before the next token.
    
        function peekLineTerminator() {
            var pos, line, start, found;
    
            pos = index;
            line = lineNumber;
            start = lineStart;
            skipComment();
            found = lineNumber !== line;
            index = pos;
            lineNumber = line;
            lineStart = start;
    
            return found;
        }
    
        // Throw an exception
    
        function throwError(token, messageFormat) {
            var error,
                args = Array.prototype.slice.call(arguments, 2),
                msg = messageFormat.replace(
                    /%(\d)/g,
                    function (whole, index) {
                        assert(index < args.length, 'Message reference must be in range');
                        return args[index];
                    }
                );
    
            if (typeof token.lineNumber === 'number') {
                error = new Error('Line ' + token.lineNumber + ': ' + msg);
                error.index = token.range[0];
                error.lineNumber = token.lineNumber;
                error.column = token.range[0] - lineStart + 1;
            } else {
                error = new Error('Line ' + lineNumber + ': ' + msg);
                error.index = index;
                error.lineNumber = lineNumber;
                error.column = index - lineStart + 1;
            }
    
            error.description = msg;
            throw error;
        }
    
        function throwErrorTolerant() {
            try {
                throwError.apply(null, arguments);
            } catch (e) {
                if (extra.errors) {
                    extra.errors.push(e);
                } else {
                    throw e;
                }
            }
        }
    
    
        // Throw an exception because of the token.
    
        function throwUnexpected(token) {
            if (token.type === Token.EOF) {
                throwError(token, Messages.UnexpectedEOS);
            }
    
            if (token.type === Token.NumericLiteral) {
                throwError(token, Messages.UnexpectedNumber);
            }
    
            if (token.type === Token.StringLiteral) {
                throwError(token, Messages.UnexpectedString);
            }
    
            if (token.type === Token.Identifier) {
                throwError(token, Messages.UnexpectedIdentifier);
            }
    
            if (token.type === Token.Keyword) {
                if (isFutureReservedWord(token.value)) {
                    throwError(token, Messages.UnexpectedReserved);
                } else if (strict && isStrictModeReservedWord(token.value)) {
                    throwErrorTolerant(token, Messages.StrictReservedWord);
                    return;
                }
                throwError(token, Messages.UnexpectedToken, token.value);
            }
    
            // BooleanLiteral, NullLiteral, or Punctuator.
            throwError(token, Messages.UnexpectedToken, token.value);
        }
    
        // Expect the next token to match the specified punctuator.
        // If not, an exception will be thrown.
    
        function expect(value) {
            var token = lex();
            if (token.type !== Token.Punctuator || token.value !== value) {
                throwUnexpected(token);
            }
            else return token;
        }
    
        // Expect the next token to match the specified keyword.
        // If not, an exception will be thrown.
    
        function expectKeyword(keyword) {
            var token = lex();
            if (token.type !== Token.Keyword || token.value !== keyword) {
                throwUnexpected(token);
            }
        }
    
        // Return true if the next token matches the specified punctuator.
    
        function match(value) {
            return lookahead.type === Token.Punctuator && lookahead.value === value;
        }
    
        // Return true if the next token matches the specified keyword
    
        function matchKeyword(keyword) {
            return lookahead.type === Token.Keyword && lookahead.value === keyword;
        }
    
        // Return true if the next token is an assignment operator
    
        function matchAssign() {
            var op;
    
            if (lookahead.type !== Token.Punctuator) {
                return false;
            }
            op = lookahead.value;
            return op === '=' ||
                op === '*=' ||
                op === '/=' ||
                op === '%=' ||
                op === '+=' ||
                op === '-=' ||
                op === '<<=' ||
                op === '>>=' ||
                op === '>>>=' ||
                op === '&=' ||
                op === '^=' ||
                op === '|=';
        }
    
        function consumeSemicolon() {
            var line;
    
            // Catch the very common case first: immediately a semicolon (char #59).
            if (source.charCodeAt(index) === 59) {
                lex();
                return;
            }
    
            line = lineNumber;
            skipComment();
            if (lineNumber !== line) {
                return;
            }
    
            if (match(';')) {
                lex();
                return;
            }
    
            if (lookahead.type !== Token.EOF && !match('}')) {
                throwUnexpected(lookahead);
            }
        }
    
        // Return true if provided expression is LeftHandSideExpression
    
        function isLeftHandSide(expr) {
            return expr.type === Syntax.Identifier || expr.type === Syntax.MemberExpression;
        }
    
        // 11.1.4 Array Initialiser
    
        function parseArrayInitialiser() {
            var elements = [];
    
            expect('[');
    
            while (!match(']')) {
                if (match(',')) {
                    lex();
                    elements.push(null);
                } else {
                    elements.push(parseAssignmentExpression());
    
                    if (!match(']')) {
                        expect(',');
                    }
                }
            }
    
            expect(']');
    
            return delegate.createArrayExpression(elements);
        }
    
        // 11.1.5 Object Initialiser
    
        function parsePropertyFunction(param, first) {
            var previousStrict, body;
    
            previousStrict = strict;
            body = parseFunctionSourceElements();
            if (first && strict && isRestrictedWord(param[0].name)) {
                throwErrorTolerant(first, Messages.StrictParamName);
            }
            strict = previousStrict;
            return delegate.createFunctionExpression(null, param, [], body);
        }
    
        function parseObjectPropertyKey() {
            var token = lex();
    
            // Note: This function is called only from parseObjectProperty(), where
            // EOF and Punctuator tokens are already filtered out.
    
            if (token.type === Token.StringLiteral || token.type === Token.NumericLiteral) {
                if (strict && token.octal) {
                    throwErrorTolerant(token, Messages.StrictOctalLiteral);
                }
                return delegate.createLiteral(token);
            }
    
            return delegate.createIdentifier(token.value);
        }
    
        function parseObjectProperty() {
            var token, key, id, value, param;
    
            token = lookahead;
    
            if (token.type === Token.Identifier) {
    
                id = parseObjectPropertyKey();
    
                // Property Assignment: Getter and Setter.
    
                if (token.value === 'get' && !match(':')) {
                    key = parseObjectPropertyKey();
                    expect('(');
                    expect(')');
                    value = parsePropertyFunction([]);
                    return delegate.createProperty('get', key, value);
                }
                if (token.value === 'set' && !match(':')) {
                    key = parseObjectPropertyKey();
                    expect('(');
                    token = lookahead;
                    if (token.type !== Token.Identifier) {
                        throwUnexpected(lex());
                    }
                    param = [ parseVariableIdentifier() ];
                    expect(')');
                    value = parsePropertyFunction(param, token);
                    return delegate.createProperty('set', key, value);
                }
                expect(':');
                value = parseAssignmentExpression();
                return delegate.createProperty('init', id, value);
            }
            if (token.type === Token.EOF || token.type === Token.Punctuator) {
                throwUnexpected(token);
            } else {
                key = parseObjectPropertyKey();
                expect(':');
                value = parseAssignmentExpression();
                return delegate.createProperty('init', key, value);
            }
        }
    
        function parseObjectInitialiser() {
            var properties = [], property, name, key, kind, map = {}, toString = String;
    
            expect('{');
    
            while (!match('}')) {
                property = parseObjectProperty();
    
                if (property.key.type === Syntax.Identifier) {
                    name = property.key.name;
                } else {
                    name = toString(property.key.value);
                }
                kind = (property.kind === 'init') ? PropertyKind.Data : (property.kind === 'get') ? PropertyKind.Get : PropertyKind.Set;
    
                key = '$' + name;
                if (Object.prototype.hasOwnProperty.call(map, key)) {
                    if (map[key] === PropertyKind.Data) {
                        if (strict && kind === PropertyKind.Data) {
                            throwErrorTolerant({}, Messages.StrictDuplicateProperty);
                        } else if (kind !== PropertyKind.Data) {
                            throwErrorTolerant({}, Messages.AccessorDataProperty);
                        }
                    } else {
                        if (kind === PropertyKind.Data) {
                            throwErrorTolerant({}, Messages.AccessorDataProperty);
                        } else if (map[key] & kind) {
                            throwErrorTolerant({}, Messages.AccessorGetSet);
                        }
                    }
                    map[key] |= kind;
                } else {
                    map[key] = kind;
                }
    
                properties.push(property);
    
                if (!match('}')) {
                    expect(',');
                }
            }
    
            expect('}');
    
            return delegate.createObjectExpression(properties);
        }
    
        // 11.1.6 The Grouping Operator
    
        function parseGroupExpression() {
            var expr;
    
            expect('(');
    
            expr = parseExpression();
    
            expect(')');
    
            return expr;
        }
    
    
        // 11.1 Primary Expressions
    
        function parsePrimaryExpression() {
            var type, token;
    
            type = lookahead.type;
    
            if (type === Token.Identifier) {
                return delegate.createIdentifier(lex().value);
            }
    
            if (type === Token.StringLiteral || type === Token.NumericLiteral) {
                if (strict && lookahead.octal) {
                    throwErrorTolerant(lookahead, Messages.StrictOctalLiteral);
                }
                return delegate.createLiteral(lex());
            }
    
            if (type === Token.Keyword) {
                if (matchKeyword('this')) {
                    lex();
                    return delegate.createThisExpression();
                }
    
                if (matchKeyword('function')) {
                    return parseFunctionExpression();
                }
            }
    
            if (type === Token.BooleanLiteral) {
                token = lex();
                token.value = (token.value === 'true');
                return delegate.createLiteral(token);
            }
    
            if (type === Token.NullLiteral) {
                token = lex();
                token.value = null;
                return delegate.createLiteral(token);
            }
            
            if (match('[')) {
                return parseArrayInitialiser();
            }
    
            if (match('{')) {
                return parseObjectInitialiser();
            }
    
            if (match('(')) {
                return parseGroupExpression();
            }
    
            if (match('/') || match('/=')) {
                return delegate.createLiteral(scanRegExp());
            }
     
            return throwUnexpected(lex());
        }
    
        // 11.2 Left-Hand-Side Expressions
    
        function parseArguments() {
            var args = [];
    
            expect('(');
    
            if (!match(')')) {
                while (index < length) {
                    args.push(parseAssignmentExpression());
                    if (match(')')) {
                        break;
                    }
                    expect(',');
                }
            }
    
            expect(')');
    
            return args;
        }
    
        function parseNonComputedProperty() {
            var token = lex();
    
            if (!isIdentifierName(token)) {
                throwUnexpected(token);
            }
    
            return delegate.createIdentifier(token.value);
        }
    
        function parseNonComputedMember() {
            expect('.');
    
            return parseNonComputedProperty();
        }
    
        function parseComputedMember() {
            var expr;
    
            expect('[');
    
            expr = parseExpression();
    
            expect(']');
    
            return expr;
        }
    
        function parseNewExpression() {
            var callee, args;
    
            expectKeyword('new');
            callee = parseLeftHandSideExpression();
            args = match('(') ? parseArguments() : [];
    
            return delegate.createNewExpression(callee, args);
        }
    
        function parseLeftHandSideExpressionAllowCall() {
            var expr, args, property;
    
            expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();
    
            while (match('.') || match('[') || match('(')) {
                if (match('(')) {
                    args = parseArguments();
                    expr = delegate.createCallExpression(expr, args);
                } else if (match('[')) {
                    property = parseComputedMember();
                    expr = delegate.createMemberExpression('[', expr, property);
                } else {
                    property = parseNonComputedMember();
                    expr = delegate.createMemberExpression('.', expr, property);
                }
            }
    
            return expr;
        }
    
    
        function parseLeftHandSideExpression() {
            var expr, property;
    
            expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();
    
            while (match('.') || match('[')) {
                if (match('[')) {
                    property = parseComputedMember();
                    expr = delegate.createMemberExpression('[', expr, property);
                } else {
                    property = parseNonComputedMember();
                    expr = delegate.createMemberExpression('.', expr, property);
                }
            }
    
            return expr;
        }
    
        // 11.3 Postfix Expressions
    
        function parsePostfixExpression() {
            var expr = parseLeftHandSideExpressionAllowCall(), token;
    
            if (lookahead.type !== Token.Punctuator) {
                return expr;
            }
    
            if ((match('++') || match('--')) && !peekLineTerminator()) {
                // 11.3.1, 11.3.2
                if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                    throwErrorTolerant({}, Messages.StrictLHSPostfix);
                }
    
                if (!isLeftHandSide(expr)) {
                    throwError({}, Messages.InvalidLHSInAssignment);
                }
    
                token = lex();
                expr = delegate.createPostfixExpression(token.value, expr);
            }
    
            return expr;
        }
    
        // 11.4 Unary Operators
    
        function parseUnaryExpression() {
            var token, expr;
    
            if (lookahead.type !== Token.Punctuator && lookahead.type !== Token.Keyword) {
                return parsePostfixExpression();
            }
    
            if (match('++') || match('--')) {
                token = lex();
                expr = parseUnaryExpression();
                // 11.4.4, 11.4.5
                if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                    throwErrorTolerant({}, Messages.StrictLHSPrefix);
                }
    
                if (!isLeftHandSide(expr)) {
                    throwError({}, Messages.InvalidLHSInAssignment);
                }
    
                return delegate.createUnaryExpression(token.value, expr);
            }
    
            if (match('+') || match('-') || match('~') || match('!')) {
                token = lex();
                expr = parseUnaryExpression();
                return delegate.createUnaryExpression(token.value, expr);
            }
    
            if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
                token = lex();
                expr = parseUnaryExpression();
                expr = delegate.createUnaryExpression(token.value, expr);
                if (strict && expr.operator === 'delete' && expr.argument.type === Syntax.Identifier) {
                    throwErrorTolerant({}, Messages.StrictDelete);
                }
                return expr;
            }
    
            if (extra.isKeyword && lookahead.type === 4 && extra.isKeyword(lookahead.value) === true) {
                token = lex();
                expr = parseUnaryExpression();
                expr = delegate.createUnaryExpression(token.value, expr);
                return expr;
            }
    
            return parsePostfixExpression();
        }
    
        function binaryPrecedence(token, allowIn) {
            var prec = 0;
    
            if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
                return 0;
            }
    
            switch (token.value) {
            case '||':
                prec = 1;
                break;
    
            case '&&':
                prec = 2;
                break;
    
            case '|':
                prec = 3;
                break;
    
            case '^':
                prec = 4;
                break;
    
            case '&':
                prec = 5;
                break;
    
            case '==':
            case '!=':
            case '===':
            case '!==':
                prec = 6;
                break;
    
            case '<':
            case '>':
            case '<=':
            case '>=':
            case 'instanceof':
                prec = 7;
                break;
    
            case 'in':
                prec = allowIn ? 7 : 0;
                break;
    
            case '<<':
            case '>>':
            case '>>>':
                prec = 8;
                break;
    
            case '+':
            case '-':
                prec = 9;
                break;
    
            case '*':
            case '/':
            case '%':
                prec = 11;
                break;
    
            default:
                break;
            }
    
            return prec;
        }
    
        // 11.5 Multiplicative Operators
        // 11.6 Additive Operators
        // 11.7 Bitwise Shift Operators
        // 11.8 Relational Operators
        // 11.9 Equality Operators
        // 11.10 Binary Bitwise Operators
        // 11.11 Binary Logical Operators
    
        function parseBinaryExpression() {
            var expr, token, prec, previousAllowIn, stack, right, operator, left, i;
    
            previousAllowIn = state.allowIn;
            state.allowIn = true;
    
            expr = parseUnaryExpression();
    
            token = lookahead;
            prec = binaryPrecedence(token, previousAllowIn);
            if (prec === 0) {
                return expr;
            }
            token.prec = prec;
            lex();
    
            stack = [expr, token, parseUnaryExpression()];
    
            while ((prec = binaryPrecedence(lookahead, previousAllowIn)) > 0) {
    
                // Reduce: make a binary expression from the three topmost entries.
                while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
                    right = stack.pop();
                    operator = stack.pop().value;
                    left = stack.pop();
                    stack.push(delegate.createBinaryExpression(operator, left, right));
                }
    
                // Shift.
                token = lex();
                token.prec = prec;
                stack.push(token);
                stack.push(parseUnaryExpression());
            }
    
            state.allowIn = previousAllowIn;
    
            // Final reduce to clean-up the stack.
            i = stack.length - 1;
            expr = stack[i];
            while (i > 1) {
                expr = delegate.createBinaryExpression(stack[i - 1].value, stack[i - 2], expr);
                i -= 2;
            }
            return expr;
        }
    
    
        // 11.12 Conditional Operator
    
        function parseConditionalExpression() {
            var expr, previousAllowIn, consequent, alternate;
    
            expr = parseBinaryExpression();
    
            if (match('?')) {
                lex();
                previousAllowIn = state.allowIn;
                state.allowIn = true;
                consequent = parseAssignmentExpression();
                state.allowIn = previousAllowIn;
                expect(':');
                alternate = parseAssignmentExpression();
    
                expr = delegate.createConditionalExpression(expr, consequent, alternate);
            }
    
            return expr;
        }
    
        // 11.13 Assignment Operators
    
        function parseAssignmentExpression() {
            var token, left, right;
    
            token = lookahead;
            left = parseConditionalExpression();
    
            if (matchAssign()) {
                // LeftHandSideExpression
                if (!isLeftHandSide(left)) {
                    throwError({}, Messages.InvalidLHSInAssignment);
                }
    
                // 11.13.1
                if (strict && left.type === Syntax.Identifier && isRestrictedWord(left.name)) {
                    throwErrorTolerant(token, Messages.StrictLHSAssignment);
                }
    
                token = lex();
                right = parseAssignmentExpression();
                return delegate.createAssignmentExpression(token.value, left, right);
            }
    
            return left;
        }
    
        // 11.14 Comma Operator
    
        function parseExpression() {
            var expr = parseAssignmentExpression();
    
            if (match(',')) {
                expr = delegate.createSequenceExpression([ expr ]);
    
                while (index < length) {
                    if (!match(',')) {
                        break;
                    }
                    lex();
                    expr.expressions.push(parseAssignmentExpression());
                }
    
            }
            return expr;
        }
    
        // 12.1 Block
    
        function parseStatementList() {
            var list = [],
                statement;
    
            while (index < length) {
                if (match('}')) {
                    break;
                }
                statement = parseSourceElement();
                if (typeof statement === 'undefined') {
                    break;
                }
                list.push(statement);
            }
    
            return list;
        }
    
        function parseBlock() {
            var block;
    
            var t = expect('{');
    
            block = parseStatementList();
    
            expect('}');
    
            var db = delegate.createBlockStatement(block);
            if (t.keyword) db.keyword = t.keyword;
            return db;
        }
    
        // 12.2 Variable Statement
    
        function parseVariableIdentifier() {
            var token = lex();
    
            if (token.type !== Token.Identifier) {
                throwUnexpected(token);
            }
    
            return delegate.createIdentifier(token.value);
        }
    
        function parseVariableDeclaration(kind) {
            var id = parseVariableIdentifier(),
                init = null;
    
            // 12.2.1
            if (strict && isRestrictedWord(id.name)) {
                throwErrorTolerant({}, Messages.StrictVarName);
            }
    
            if (kind === 'const') {
                expect('=');
                init = parseAssignmentExpression();
            } else if (match('=')) {
                lex();
                init = parseAssignmentExpression();
            }
    
            return delegate.createVariableDeclarator(id, init);
        }
    
        function parseVariableDeclarationList(kind) {
            var list = [];
    
            do {
                list.push(parseVariableDeclaration(kind));
                if (!match(',')) {
                    break;
                }
                lex();
            } while (index < length);
    
            return list;
        }
    
        function parseVariableStatement() {
            var declarations;
    
            expectKeyword('var');
    
            declarations = parseVariableDeclarationList();
    
            consumeSemicolon();
    
            return delegate.createVariableDeclaration(declarations, 'var');
        }
    
        // kind may be `const` or `let`
        // Both are experimental and not in the specification yet.
        // see http://wiki.ecmascript.org/doku.php?id=harmony:const
        // and http://wiki.ecmascript.org/doku.php?id=harmony:let
        function parseConstLetDeclaration(kind) {
            var declarations;
    
            expectKeyword(kind);
    
            declarations = parseVariableDeclarationList(kind);
    
            consumeSemicolon();
    
            return delegate.createVariableDeclaration(declarations, kind);
        }
    
        // 12.3 Empty Statement
    
        function parseEmptyStatement() {
            expect(';');
            return delegate.createEmptyStatement();
        }
    
        // 12.4 Expression Statement
    
        function parseExpressionStatement() {
            var expr = parseExpression();
            consumeSemicolon();
            return delegate.createExpressionStatement(expr);
        }
    
        // 12.5 If statement
    
        function parseIfStatement() {
            var test, consequent, alternate;
    
            expectKeyword('if');
    
            expect('(');
    
            test = parseExpression();
    
            expect(')');
    
            consequent = parseStatement();
    
            if (matchKeyword('else')) {
                lex();
                alternate = parseStatement();
            } else {
                alternate = null;
            }
    
            return delegate.createIfStatement(test, consequent, alternate);
        }
    
        // 12.6 Iteration Statements
    
        function parseDoWhileStatement() {
            var body, test, oldInIteration;
    
            expectKeyword('do');
    
            oldInIteration = state.inIteration;
            state.inIteration = true;
    
            body = parseStatement();
    
            state.inIteration = oldInIteration;
    
            expectKeyword('while');
    
            expect('(');
    
            test = parseExpression();
    
            expect(')');
    
            if (match(';')) {
                lex();
            }
    
            return delegate.createDoWhileStatement(body, test);
        }
    
        function parseWhileStatement() {
            var test, body, oldInIteration;
    
            expectKeyword('while');
    
            expect('(');
    
            test = parseExpression();
    
            expect(')');
    
            oldInIteration = state.inIteration;
            state.inIteration = true;
    
            body = parseStatement();
    
            state.inIteration = oldInIteration;
    
            return delegate.createWhileStatement(test, body);
        }
    
        function parseForVariableDeclaration() {
            var token = lex(),
                declarations = parseVariableDeclarationList();
    
            return delegate.createVariableDeclaration(declarations, token.value);
        }
    
        function parseForStatement() {
            var init, test, update, left, right, body, oldInIteration;
    
            init = test = update = null;
    
            expectKeyword('for');
    
            expect('(');
    
            if (match(';')) {
                lex();
            } else {
                if (matchKeyword('var') || matchKeyword('let')) {
                    state.allowIn = false;
                    init = parseForVariableDeclaration();
                    state.allowIn = true;
    
                    if (init.declarations.length === 1 && matchKeyword('in')) {
                        lex();
                        left = init;
                        right = parseExpression();
                        init = null;
                    }
                } else {
                    state.allowIn = false;
                    init = parseExpression();
                    state.allowIn = true;
    
                    if (matchKeyword('in')) {
                        // LeftHandSideExpression
                        if (!isLeftHandSide(init)) {
                            throwError({}, Messages.InvalidLHSInForIn);
                        }
    
                        lex();
                        left = init;
                        right = parseExpression();
                        init = null;
                    }
                }
    
                if (typeof left === 'undefined') {
                    expect(';');
                }
            }
    
            if (typeof left === 'undefined') {
    
                if (!match(';')) {
                    test = parseExpression();
                }
                expect(';');
    
                if (!match(')')) {
                    update = parseExpression();
                }
            }
    
            expect(')');
    
            oldInIteration = state.inIteration;
            state.inIteration = true;
    
            body = parseStatement();
    
            state.inIteration = oldInIteration;
    
            return (typeof left === 'undefined') ?
                    delegate.createForStatement(init, test, update, body) :
                    delegate.createForInStatement(left, right, body);
        }
    
        // 12.7 The continue statement
    
        function parseContinueStatement() {
            var label = null, key;
    
            expectKeyword('continue');
    
            // Optimize the most common form: 'continue;'.
            if (source.charCodeAt(index) === 59) {
                lex();
    
                if (!state.inIteration) {
                    throwError({}, Messages.IllegalContinue);
                }
    
                return delegate.createContinueStatement(null);
            }
    
            if (peekLineTerminator()) {
                if (!state.inIteration) {
                    throwError({}, Messages.IllegalContinue);
                }
    
                return delegate.createContinueStatement(null);
            }
    
            if (lookahead.type === Token.Identifier) {
                label = parseVariableIdentifier();
    
                key = '$' + label.name;
                if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                    throwError({}, Messages.UnknownLabel, label.name);
                }
            }
    
            consumeSemicolon();
    
            if (label === null && !state.inIteration) {
                throwError({}, Messages.IllegalContinue);
            }
    
            return delegate.createContinueStatement(label);
        }
    
        // 12.8 The break statement
    
        function parseBreakStatement() {
            var label = null, key;
    
            expectKeyword('break');
    
            // Catch the very common case first: immediately a semicolon (char #59).
            if (source.charCodeAt(index) === 59) {
                lex();
    
                if (!(state.inIteration || state.inSwitch)) {
                    throwError({}, Messages.IllegalBreak);
                }
    
                return delegate.createBreakStatement(null);
            }
    
            if (peekLineTerminator()) {
                if (!(state.inIteration || state.inSwitch)) {
                    throwError({}, Messages.IllegalBreak);
                }
    
                return delegate.createBreakStatement(null);
            }
    
            if (lookahead.type === Token.Identifier) {
                label = parseVariableIdentifier();
    
                key = '$' + label.name;
                if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                    throwError({}, Messages.UnknownLabel, label.name);
                }
            }
    
            consumeSemicolon();
    
            if (label === null && !(state.inIteration || state.inSwitch)) {
                throwError({}, Messages.IllegalBreak);
            }
    
            return delegate.createBreakStatement(label);
        }
    
        // 12.9 The return statement
    
        function parseReturnStatement() {
            var argument = null;
    
            expectKeyword('return');
    
            if (!state.inFunctionBody) {
                throwErrorTolerant({}, Messages.IllegalReturn);
            }
    
            // 'return' followed by a space and an identifier is very common.
            if (source.charCodeAt(index) === 32) {
                if (isIdentifierStart(source.charCodeAt(index + 1))) {
                    argument = parseExpression();
                    consumeSemicolon();
                    return delegate.createReturnStatement(argument);
                }
            }
    
            if (peekLineTerminator()) {
                return delegate.createReturnStatement(null);
            }
    
            if (!match(';')) {
                if (!match('}') && lookahead.type !== Token.EOF) {
                    argument = parseExpression();
                }
            }
    
            consumeSemicolon();
    
            return delegate.createReturnStatement(argument);
        }
    
        // 12.10 The with statement
    
        function parseWithStatement() {
            var object, body;
    
            if (strict) {
                throwErrorTolerant({}, Messages.StrictModeWith);
            }
    
            expectKeyword('with');
    
            expect('(');
    
            object = parseExpression();
    
            expect(')');
    
            body = parseStatement();
    
            return delegate.createWithStatement(object, body);
        }
    
        // 12.10 The swith statement
    
        function parseSwitchCase() {
            var test,
                consequent = [],
                statement;
    
            if (matchKeyword('default')) {
                lex();
                test = null;
            } else {
                expectKeyword('case');
                test = parseExpression();
            }
            expect(':');
    
            while (index < length) {
                if (match('}') || matchKeyword('default') || matchKeyword('case')) {
                    break;
                }
                statement = parseStatement();
                consequent.push(statement);
            }
    
            return delegate.createSwitchCase(test, consequent);
        }
    
        function parseSwitchStatement() {
            var discriminant, cases, clause, oldInSwitch, defaultFound;
    
            expectKeyword('switch');
    
            expect('(');
    
            discriminant = parseExpression();
    
            expect(')');
    
            expect('{');
    
            if (match('}')) {
                lex();
                return delegate.createSwitchStatement(discriminant);
            }
    
            cases = [];
    
            oldInSwitch = state.inSwitch;
            state.inSwitch = true;
            defaultFound = false;
    
            while (index < length) {
                if (match('}')) {
                    break;
                }
                clause = parseSwitchCase();
                if (clause.test === null) {
                    if (defaultFound) {
                        throwError({}, Messages.MultipleDefaultsInSwitch);
                    }
                    defaultFound = true;
                }
                cases.push(clause);
            }
    
            state.inSwitch = oldInSwitch;
    
            expect('}');
    
            return delegate.createSwitchStatement(discriminant, cases);
        }
    
        // 12.13 The throw statement
    
        function parseThrowStatement() {
            var argument;
    
            expectKeyword('throw');
    
            if (peekLineTerminator()) {
                throwError({}, Messages.NewlineAfterThrow);
            }
    
            argument = parseExpression();
    
            consumeSemicolon();
    
            return delegate.createThrowStatement(argument);
        }
    
        // 12.14 The try statement
    
        function parseCatchClause() {
            var param, body;
    
            expectKeyword('catch');
    
            expect('(');
            if (match(')')) {
                throwUnexpected(lookahead);
            }
    
            param = parseExpression();
            // 12.14.1
            if (strict && param.type === Syntax.Identifier && isRestrictedWord(param.name)) {
                throwErrorTolerant({}, Messages.StrictCatchVariable);
            }
    
            expect(')');
            body = parseBlock();
            return delegate.createCatchClause(param, body);
        }
    
        function parseTryStatement() {
            var block, handlers = [], finalizer = null;
    
            expectKeyword('try');
    
            block = parseBlock();
    
            if (matchKeyword('catch')) {
                handlers.push(parseCatchClause());
            }
    
            if (matchKeyword('finally')) {
                lex();
                finalizer = parseBlock();
            }
    
            if (handlers.length === 0 && !finalizer) {
                throwError({}, Messages.NoCatchOrFinally);
            }
    
            return delegate.createTryStatement(block, [], handlers, finalizer);
        }
    
        // 12.15 The debugger statement
    
        function parseDebuggerStatement() {
            expectKeyword('debugger');
    
            consumeSemicolon();
    
            return delegate.createDebuggerStatement();
        }
    
        // 12 Statements
    
        function parseStatement() {
            var type = lookahead.type,
                expr,
                labeledBody,
                key;
    
            if (type === Token.EOF) {
                throwUnexpected(lookahead);
            }
    
            if (type === Token.Punctuator) {
                switch (lookahead.value) {
                case ';':
                    return parseEmptyStatement();
                case '{':
                    return parseBlock();
                case '(':
                    return parseExpressionStatement();
                default:
                    break;
                }
            }
    
            if (type === Token.Keyword) {
                switch (lookahead.value) {
                case 'break':
                    return parseBreakStatement();
                case 'continue':
                    return parseContinueStatement();
                case 'debugger':
                    return parseDebuggerStatement();
                case 'do':
                    return parseDoWhileStatement();
                case 'for':
                    return parseForStatement();
                case 'function':
                    return parseFunctionDeclaration();
                case 'if':
                    return parseIfStatement();
                case 'return':
                    return parseReturnStatement();
                case 'switch':
                    return parseSwitchStatement();
                case 'throw':
                    return parseThrowStatement();
                case 'try':
                    return parseTryStatement();
                case 'var':
                    return parseVariableStatement();
                case 'while':
                    return parseWhileStatement();
                case 'with':
                    return parseWithStatement();
                default:
                    break;
                }
            }
    
            expr = parseExpression();
    
            // 12.12 Labelled Statements
            if ((expr.type === Syntax.Identifier) && match(':')) {
                lex();
    
                key = '$' + expr.name;
                if (Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                    throwError({}, Messages.Redeclaration, 'Label', expr.name);
                }
    
                state.labelSet[key] = true;
                labeledBody = parseStatement();
                delete state.labelSet[key];
                return delegate.createLabeledStatement(expr, labeledBody);
            }
    
            consumeSemicolon();
    
            return delegate.createExpressionStatement(expr);
        }
    
        // 13 Function Definition
    
        function parseFunctionSourceElements() {
            var sourceElement, sourceElements = [], token, directive, firstRestricted,
                oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody;
    
            expect('{');
    
            while (index < length) {
                if (lookahead.type !== Token.StringLiteral) {
                    break;
                }
                token = lookahead;
    
                sourceElement = parseSourceElement();
                sourceElements.push(sourceElement);
                if (sourceElement.expression.type !== Syntax.Literal) {
                    // this is not directive
                    break;
                }
                directive = source.slice(token.range[0] + 1, token.range[1] - 1);
                if (directive === 'use strict') {
                    strict = true;
                    if (firstRestricted) {
                        throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
                    }
                } else {
                    if (!firstRestricted && token.octal) {
                        firstRestricted = token;
                    }
                }
            }
    
            oldLabelSet = state.labelSet;
            oldInIteration = state.inIteration;
            oldInSwitch = state.inSwitch;
            oldInFunctionBody = state.inFunctionBody;
    
            state.labelSet = {};
            state.inIteration = false;
            state.inSwitch = false;
            state.inFunctionBody = true;
    
            while (index < length) {
                if (match('}')) {
                    break;
                }
                sourceElement = parseSourceElement();
                if (typeof sourceElement === 'undefined') {
                    break;
                }
                sourceElements.push(sourceElement);
            }
    
            expect('}');
    
            state.labelSet = oldLabelSet;
            state.inIteration = oldInIteration;
            state.inSwitch = oldInSwitch;
            state.inFunctionBody = oldInFunctionBody;
    
            return delegate.createBlockStatement(sourceElements);
        }
    
        function parseParams(firstRestricted) {
            var param, params = [], token, stricted, paramSet, key, message;
            expect('(');
    
            if (!match(')')) {
                paramSet = {};
                while (index < length) {
                    token = lookahead;
                    param = parseVariableIdentifier();
                    key = '$' + token.value;
                    if (strict) {
                        if (isRestrictedWord(token.value)) {
                            stricted = token;
                            message = Messages.StrictParamName;
                        }
                        if (Object.prototype.hasOwnProperty.call(paramSet, key)) {
                            stricted = token;
                            message = Messages.StrictParamDupe;
                        }
                    } else if (!firstRestricted) {
                        if (isRestrictedWord(token.value)) {
                            firstRestricted = token;
                            message = Messages.StrictParamName;
                        } else if (isStrictModeReservedWord(token.value)) {
                            firstRestricted = token;
                            message = Messages.StrictReservedWord;
                        } else if (Object.prototype.hasOwnProperty.call(paramSet, key)) {
                            firstRestricted = token;
                            message = Messages.StrictParamDupe;
                        }
                    }
                    params.push(param);
                    paramSet[key] = true;
                    if (match(')')) {
                        break;
                    }
                    expect(',');
                }
            }
    
            expect(')');
    
            return {
                params: params,
                stricted: stricted,
                firstRestricted: firstRestricted,
                message: message
            };
        }
    
        function parseFunctionDeclaration() {
            var id, params = [], body, token, stricted, tmp, firstRestricted, message, previousStrict;
    
            expectKeyword('function');
            token = lookahead;
            id = parseVariableIdentifier();
            if (strict) {
                if (isRestrictedWord(token.value)) {
                    throwErrorTolerant(token, Messages.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictFunctionName;
                } else if (isStrictModeReservedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictReservedWord;
                }
            }
    
            tmp = parseParams(firstRestricted);
            params = tmp.params;
            stricted = tmp.stricted;
            firstRestricted = tmp.firstRestricted;
            if (tmp.message) {
                message = tmp.message;
            }
    
            previousStrict = strict;
            body = parseFunctionSourceElements();
            if (strict && firstRestricted) {
                throwError(firstRestricted, message);
            }
            if (strict && stricted) {
                throwErrorTolerant(stricted, message);
            }
            strict = previousStrict;
    
            return delegate.createFunctionDeclaration(id, params, [], body);
        }
    
        function parseFunctionExpression() {
            var token, id = null, stricted, firstRestricted, message, tmp, params = [], body, previousStrict;
    
            expectKeyword('function');
    
            if (!match('(')) {
                token = lookahead;
                id = parseVariableIdentifier();
                if (strict) {
                    if (isRestrictedWord(token.value)) {
                        throwErrorTolerant(token, Messages.StrictFunctionName);
                    }
                } else {
                    if (isRestrictedWord(token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictFunctionName;
                    } else if (isStrictModeReservedWord(token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictReservedWord;
                    }
                }
            }
    
            tmp = parseParams(firstRestricted);
            params = tmp.params;
            stricted = tmp.stricted;
            firstRestricted = tmp.firstRestricted;
            if (tmp.message) {
                message = tmp.message;
            }
    
            previousStrict = strict;
            body = parseFunctionSourceElements();
            if (strict && firstRestricted) {
                throwError(firstRestricted, message);
            }
            if (strict && stricted) {
                throwErrorTolerant(stricted, message);
            }
            strict = previousStrict;
    
            return delegate.createFunctionExpression(id, params, [], body);
        }
    
        // 14 Program
    
        function parseSourceElement() {
            if (lookahead.type === Token.Keyword) {
                switch (lookahead.value) {
                case 'const':
                case 'let':
                    return parseConstLetDeclaration(lookahead.value);
                case 'function':
                    return parseFunctionDeclaration();
                default:
                    return parseStatement();
                }
            }
    
            if (lookahead.type !== Token.EOF) {
                return parseStatement();
            }
        }
    
        function parseSourceElements() {
            var sourceElement, sourceElements = [], token, directive, firstRestricted;
    
            while (index < length) {
                token = lookahead;
                if (token.type !== Token.StringLiteral) {
                    break;
                }
    
                sourceElement = parseSourceElement();
                sourceElements.push(sourceElement);
                if (sourceElement.expression.type !== Syntax.Literal) {
                    // this is not directive
                    break;
                }
                directive = source.slice(token.range[0] + 1, token.range[1] - 1);
                if (directive === 'use strict') {
                    strict = true;
                    if (firstRestricted) {
                        throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
                    }
                } else {
                    if (!firstRestricted && token.octal) {
                        firstRestricted = token;
                    }
                }
            }
    
            while (index < length) {
                sourceElement = parseSourceElement();
                if (typeof sourceElement === 'undefined') {
                    break;
                }
                sourceElements.push(sourceElement);
            }
            return sourceElements;
        }
    
        function parseProgram() {
            var body;
            strict = false;
            peek();
            body = parseSourceElements();
            return delegate.createProgram(body);
        }
    
        // The following functions are needed only when the option to preserve
        // the comments is active.
    
        function addComment(type, value, start, end, loc) {
            assert(typeof start === 'number', 'Comment must have valid position');
    
            // Because the way the actual token is scanned, often the comments
            // (if any) are skipped twice during the lexical analysis.
            // Thus, we need to skip adding a comment if the comment array already
            // handled it.
            if (extra.comments.length > 0) {
                if (extra.comments[extra.comments.length - 1].range[1] > start) {
                    return;
                }
            }
    
            extra.comments.push({
                type: type,
                value: value,
                range: [start, end],
                loc: loc
            });
        }
    
        function scanComment() {
            var comment, ch, loc, start, blockComment, lineComment;
    
            comment = '';
            blockComment = false;
            lineComment = false;
    
            while (index < length) {
                ch = source[index];
    
                if (lineComment) {
                    ch = source[index++];
                    if (isLineTerminator(ch.charCodeAt(0))) {
                        loc.end = {
                            line: lineNumber,
                            column: index - lineStart - 1
                        };
                        lineComment = false;
                        addComment('Line', comment, start, index - 1, loc);
                        if (ch === '\r' && source[index] === '\n') {
                            ++index;
                        }
                        ++lineNumber;
                        lineStart = index;
                        comment = '';
                    } else if (index >= length) {
                        lineComment = false;
                        comment += ch;
                        loc.end = {
                            line: lineNumber,
                            column: length - lineStart
                        };
                        addComment('Line', comment, start, length, loc);
                    } else {
                        comment += ch;
                    }
                } else if (blockComment) {
                    if (isLineTerminator(ch.charCodeAt(0))) {
                        if (ch === '\r' && source[index + 1] === '\n') {
                            ++index;
                            comment += '\r\n';
                        } else {
                            comment += ch;
                        }
                        ++lineNumber;
                        ++index;
                        lineStart = index;
                        if (index >= length) {
                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                        }
                    } else {
                        ch = source[index++];
                        if (index >= length) {
                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                        }
                        comment += ch;
                        if (ch === '*') {
                            ch = source[index];
                            if (ch === '/') {
                                comment = comment.substr(0, comment.length - 1);
                                blockComment = false;
                                ++index;
                                loc.end = {
                                    line: lineNumber,
                                    column: index - lineStart
                                };
                                addComment('Block', comment, start, index, loc);
                                comment = '';
                            }
                        }
                    }
                } else if (ch === '/') {
                    ch = source[index + 1];
                    if (ch === '/') {
                        loc = {
                            start: {
                                line: lineNumber,
                                column: index - lineStart
                            }
                        };
                        start = index;
                        index += 2;
                        lineComment = true;
                        if (index >= length) {
                            loc.end = {
                                line: lineNumber,
                                column: index - lineStart
                            };
                            lineComment = false;
                            addComment('Line', comment, start, index, loc);
                        }
                    } else if (ch === '*') {
                        start = index;
                        index += 2;
                        blockComment = true;
                        loc = {
                            start: {
                                line: lineNumber,
                                column: index - lineStart - 2
                            }
                        };
                        if (index >= length) {
                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                        }
                    } else {
                        break;
                    }
                } else if (isWhiteSpace(ch.charCodeAt(0))) {
                    ++index;
                } else if (isLineTerminator(ch.charCodeAt(0))) {
                    ++index;
                    if (ch ===  '\r' && source[index] === '\n') {
                        ++index;
                    }
                    ++lineNumber;
                    lineStart = index;
                } else {
                    break;
                }
            }
        }
    
        function filterCommentLocation() {
            var i, entry, comment, comments = [];
    
            for (i = 0; i < extra.comments.length; ++i) {
                entry = extra.comments[i];
                comment = {
                    type: entry.type,
                    value: entry.value
                };
                if (extra.range) {
                    comment.range = entry.range;
                }
                if (extra.loc) {
                    comment.loc = entry.loc;
                }
                comments.push(comment);
            }
    
            extra.comments = comments;
        }
    
        function collectToken() {
            var start, loc, token, range, value;
    
            skipComment();
            start = index;
            loc = {
                start: {
                    line: lineNumber,
                    column: index - lineStart
                }
            };
    
            token = extra.advance();
            loc.end = {
                line: lineNumber,
                column: index - lineStart
            };
    
            if (token.type !== Token.EOF) {
                range = [token.range[0], token.range[1]];
                value = source.slice(token.range[0], token.range[1]);
                extra.tokens.push({
                    type: TokenName[token.type],
                    value: value,
                    range: range,
                    loc: loc
                });
            }
    
            return token;
        }
    
        function collectRegex() {
            var pos, loc, regex, token;
    
            skipComment();
    
            pos = index;
            loc = {
                start: {
                    line: lineNumber,
                    column: index - lineStart
                }
            };
    
            regex = extra.scanRegExp();
            loc.end = {
                line: lineNumber,
                column: index - lineStart
            };
    
            // Pop the previous token, which is likely '/' or '/='
            if (extra.tokens.length > 0) {
                token = extra.tokens[extra.tokens.length - 1];
                if (token.range[0] === pos && token.type === 'Punctuator') {
                    if (token.value === '/' || token.value === '/=') {
                        extra.tokens.pop();
                    }
                }
            }
    
            extra.tokens.push({
                type: 'RegularExpression',
                value: regex.literal,
                range: [pos, index],
                loc: loc
            });
    
            return regex;
        }
    
        function filterTokenLocation() {
            var i, entry, token, tokens = [];
    
            for (i = 0; i < extra.tokens.length; ++i) {
                entry = extra.tokens[i];
                token = {
                    type: entry.type,
                    value: entry.value
                };
                if (extra.range) {
                    token.range = entry.range;
                }
                if (extra.loc) {
                    token.loc = entry.loc;
                }
                tokens.push(token);
            }
    
            extra.tokens = tokens;
        }
    
        function createLocationMarker() {
            var marker = {};
    
            marker.range = [index, index];
            marker.loc = {
                start: {
                    line: lineNumber,
                    column: index - lineStart
                },
                end: {
                    line: lineNumber,
                    column: index - lineStart
                }
            };
    
            marker.end = function () {
                this.range[1] = index;
                this.loc.end.line = lineNumber;
                this.loc.end.column = index - lineStart;
            };
    
            marker.applyGroup = function (node) {
                if (extra.range) {
                    node.groupRange = [this.range[0], this.range[1]];
                }
                if (extra.loc) {
                    node.groupLoc = {
                        start: {
                            line: this.loc.start.line,
                            column: this.loc.start.column
                        },
                        end: {
                            line: this.loc.end.line,
                            column: this.loc.end.column
                        }
                    };
                    node = delegate.postProcess(node);
                }
            };
    
            marker.apply = function (node) {
                if (extra.range) {
                    node.range = [this.range[0], this.range[1]];
                }
                if (extra.loc) {
                    node.loc = {
                        start: {
                            line: this.loc.start.line,
                            column: this.loc.start.column
                        },
                        end: {
                            line: this.loc.end.line,
                            column: this.loc.end.column
                        }
                    };
                    node = delegate.postProcess(node);
                }
            };
    
            return marker;
        }
    
        function trackGroupExpression() {
            var marker, expr;
    
            skipComment();
            marker = createLocationMarker();
            expect('(');
    
            expr = parseExpression();
    
            expect(')');
    
            marker.end();
            marker.applyGroup(expr);
    
            return expr;
        }
    
        function trackLeftHandSideExpression() {
            var marker, expr, property;
    
            skipComment();
            marker = createLocationMarker();
    
            expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();
    
            while (match('.') || match('[')) {
                if (match('[')) {
                    property = parseComputedMember();
                    expr = delegate.createMemberExpression('[', expr, property);
                    marker.end();
                    marker.apply(expr);
                } else {
                    property = parseNonComputedMember();
                    expr = delegate.createMemberExpression('.', expr, property);
                    marker.end();
                    marker.apply(expr);
                }
            }
    
            return expr;
        }
    
        function trackLeftHandSideExpressionAllowCall() {
            var marker, expr, args, property;
    
            skipComment();
            marker = createLocationMarker();
    
            expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();
    
            while (match('.') || match('[') || match('(')) {
                if (match('(')) {
                    args = parseArguments();
                    expr = delegate.createCallExpression(expr, args);
                    marker.end();
                    marker.apply(expr);
                } else if (match('[')) {
                    property = parseComputedMember();
                    expr = delegate.createMemberExpression('[', expr, property);
                    marker.end();
                    marker.apply(expr);
                } else {
                    property = parseNonComputedMember();
                    expr = delegate.createMemberExpression('.', expr, property);
                    marker.end();
                    marker.apply(expr);
                }
            }
    
            return expr;
        }
    
        function filterGroup(node) {
            var n, i, entry;
    
            n = (Object.prototype.toString.apply(node) === '[object Array]') ? [] : {};
            for (i in node) {
                if (node.hasOwnProperty(i) && i !== 'groupRange' && i !== 'groupLoc') {
                    entry = node[i];
                    if (entry === null || typeof entry !== 'object' || entry instanceof RegExp) {
                        n[i] = entry;
                    } else {
                        n[i] = filterGroup(entry);
                    }
                }
            }
            return n;
        }
    
        function wrapTrackingFunction(range, loc) {
    
            return function (parseFunction) {
    
                function isBinary(node) {
                    return node.type === Syntax.LogicalExpression ||
                        node.type === Syntax.BinaryExpression;
                }
    
                function visit(node) {
                    var start, end;
    
                    if (isBinary(node.left)) {
                        visit(node.left);
                    }
                    if (isBinary(node.right)) {
                        visit(node.right);
                    }
    
                    if (range) {
                        if (node.left.groupRange || node.right.groupRange) {
                            start = node.left.groupRange ? node.left.groupRange[0] : node.left.range[0];
                            end = node.right.groupRange ? node.right.groupRange[1] : node.right.range[1];
                            node.range = [start, end];
                        } else if (typeof node.range === 'undefined') {
                            start = node.left.range[0];
                            end = node.right.range[1];
                            node.range = [start, end];
                        }
                    }
                    if (loc) {
                        if (node.left.groupLoc || node.right.groupLoc) {
                            start = node.left.groupLoc ? node.left.groupLoc.start : node.left.loc.start;
                            end = node.right.groupLoc ? node.right.groupLoc.end : node.right.loc.end;
                            node.loc = {
                                start: start,
                                end: end
                            };
                            node = delegate.postProcess(node);
                        } else if (typeof node.loc === 'undefined') {
                            node.loc = {
                                start: node.left.loc.start,
                                end: node.right.loc.end
                            };
                            node = delegate.postProcess(node);
                        }
                    }
                }
    
                return function () {
                    var marker, node;
    
                    skipComment();
    
                    marker = createLocationMarker();
                    node = parseFunction.apply(null, arguments);
                    marker.end();
    
                    if (range && typeof node.range === 'undefined') {
                        marker.apply(node);
                    }
    
                    if (loc && typeof node.loc === 'undefined') {
                        marker.apply(node);
                    }
    
                    if (isBinary(node)) {
                        visit(node);
                    }
    
                    return node;
                };
            };
        }
    
        function patch() {
    
            var wrapTracking;
    
            if (extra.comments) {
                extra.skipComment = skipComment;
                skipComment = scanComment;
            }
    
            if (extra.range || extra.loc) {
    
                extra.parseGroupExpression = parseGroupExpression;
                extra.parseLeftHandSideExpression = parseLeftHandSideExpression;
                extra.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall;
                parseGroupExpression = trackGroupExpression;
                parseLeftHandSideExpression = trackLeftHandSideExpression;
                parseLeftHandSideExpressionAllowCall = trackLeftHandSideExpressionAllowCall;
    
                wrapTracking = wrapTrackingFunction(extra.range, extra.loc);
    
                extra.parseAssignmentExpression = parseAssignmentExpression;
                extra.parseBinaryExpression = parseBinaryExpression;
                extra.parseBlock = parseBlock;
                extra.parseFunctionSourceElements = parseFunctionSourceElements;
                extra.parseCatchClause = parseCatchClause;
                extra.parseComputedMember = parseComputedMember;
                extra.parseConditionalExpression = parseConditionalExpression;
                extra.parseConstLetDeclaration = parseConstLetDeclaration;
                extra.parseExpression = parseExpression;
                extra.parseForVariableDeclaration = parseForVariableDeclaration;
                extra.parseFunctionDeclaration = parseFunctionDeclaration;
                extra.parseFunctionExpression = parseFunctionExpression;
                extra.parseNewExpression = parseNewExpression;
                extra.parseNonComputedProperty = parseNonComputedProperty;
                extra.parseObjectProperty = parseObjectProperty;
                extra.parseObjectPropertyKey = parseObjectPropertyKey;
                extra.parsePostfixExpression = parsePostfixExpression;
                extra.parsePrimaryExpression = parsePrimaryExpression;
                extra.parseProgram = parseProgram;
                extra.parsePropertyFunction = parsePropertyFunction;
                extra.parseStatement = parseStatement;
                extra.parseSwitchCase = parseSwitchCase;
                extra.parseUnaryExpression = parseUnaryExpression;
                extra.parseVariableDeclaration = parseVariableDeclaration;
                extra.parseVariableIdentifier = parseVariableIdentifier;
    
                parseAssignmentExpression = wrapTracking(extra.parseAssignmentExpression);
                parseBinaryExpression = wrapTracking(extra.parseBinaryExpression);
                parseBlock = wrapTracking(extra.parseBlock);
                parseFunctionSourceElements = wrapTracking(extra.parseFunctionSourceElements);
                parseCatchClause = wrapTracking(extra.parseCatchClause);
                parseComputedMember = wrapTracking(extra.parseComputedMember);
                parseConditionalExpression = wrapTracking(extra.parseConditionalExpression);
                parseConstLetDeclaration = wrapTracking(extra.parseConstLetDeclaration);
                parseExpression = wrapTracking(extra.parseExpression);
                parseForVariableDeclaration = wrapTracking(extra.parseForVariableDeclaration);
                parseFunctionDeclaration = wrapTracking(extra.parseFunctionDeclaration);
                parseFunctionExpression = wrapTracking(extra.parseFunctionExpression);
                parseLeftHandSideExpression = wrapTracking(parseLeftHandSideExpression);
                parseNewExpression = wrapTracking(extra.parseNewExpression);
                parseNonComputedProperty = wrapTracking(extra.parseNonComputedProperty);
                parseObjectProperty = wrapTracking(extra.parseObjectProperty);
                parseObjectPropertyKey = wrapTracking(extra.parseObjectPropertyKey);
                parsePostfixExpression = wrapTracking(extra.parsePostfixExpression);
                parsePrimaryExpression = wrapTracking(extra.parsePrimaryExpression);
                parseProgram = wrapTracking(extra.parseProgram);
                parsePropertyFunction = wrapTracking(extra.parsePropertyFunction);
                parseStatement = wrapTracking(extra.parseStatement);
                parseSwitchCase = wrapTracking(extra.parseSwitchCase);
                parseUnaryExpression = wrapTracking(extra.parseUnaryExpression);
                parseVariableDeclaration = wrapTracking(extra.parseVariableDeclaration);
                parseVariableIdentifier = wrapTracking(extra.parseVariableIdentifier);
            }
    
            if (typeof extra.tokens !== 'undefined') {
                extra.advance = advance;
                extra.scanRegExp = scanRegExp;
    
                advance = collectToken;
                scanRegExp = collectRegex;
            }
        }
    
        function unpatch() {
            if (typeof extra.skipComment === 'function') {
                skipComment = extra.skipComment;
            }
    
            if (extra.range || extra.loc) {
                parseAssignmentExpression = extra.parseAssignmentExpression;
                parseBinaryExpression = extra.parseBinaryExpression;
                parseBlock = extra.parseBlock;
                parseFunctionSourceElements = extra.parseFunctionSourceElements;
                parseCatchClause = extra.parseCatchClause;
                parseComputedMember = extra.parseComputedMember;
                parseConditionalExpression = extra.parseConditionalExpression;
                parseConstLetDeclaration = extra.parseConstLetDeclaration;
                parseExpression = extra.parseExpression;
                parseForVariableDeclaration = extra.parseForVariableDeclaration;
                parseFunctionDeclaration = extra.parseFunctionDeclaration;
                parseFunctionExpression = extra.parseFunctionExpression;
                parseGroupExpression = extra.parseGroupExpression;
                parseLeftHandSideExpression = extra.parseLeftHandSideExpression;
                parseLeftHandSideExpressionAllowCall = extra.parseLeftHandSideExpressionAllowCall;
                parseNewExpression = extra.parseNewExpression;
                parseNonComputedProperty = extra.parseNonComputedProperty;
                parseObjectProperty = extra.parseObjectProperty;
                parseObjectPropertyKey = extra.parseObjectPropertyKey;
                parsePrimaryExpression = extra.parsePrimaryExpression;
                parsePostfixExpression = extra.parsePostfixExpression;
                parseProgram = extra.parseProgram;
                parsePropertyFunction = extra.parsePropertyFunction;
                parseStatement = extra.parseStatement;
                parseSwitchCase = extra.parseSwitchCase;
                parseUnaryExpression = extra.parseUnaryExpression;
                parseVariableDeclaration = extra.parseVariableDeclaration;
                parseVariableIdentifier = extra.parseVariableIdentifier;
            }
    
            if (typeof extra.scanRegExp === 'function') {
                advance = extra.advance;
                scanRegExp = extra.scanRegExp;
            }
        }
    
        // This is used to modify the delegate.
    
        function extend(object, properties) {
            var entry, result = {};
    
            for (entry in object) {
                if (object.hasOwnProperty(entry)) {
                    result[entry] = object[entry];
                }
            }
    
            for (entry in properties) {
                if (properties.hasOwnProperty(entry)) {
                    result[entry] = properties[entry];
                }
            }
    
            return result;
        }
    
        function parse(code, options) {
            var program, toString;
    
            toString = String;
            if (typeof code !== 'string' && !(code instanceof String)) {
                code = toString(code);
            }
    
            delegate = SyntaxTreeDelegate;
            source = code;
            index = 0;
            lineNumber = (source.length > 0) ? 1 : 0;
            lineStart = 0;
            length = source.length;
            lookahead = null;
            state = {
                allowIn: true,
                labelSet: {},
                inFunctionBody: false,
                inIteration: false,
                inSwitch: false
            };
    
            extra = {};
            if (typeof options !== 'undefined') {
                extra.range = (typeof options.range === 'boolean') && options.range;
                extra.loc = (typeof options.loc === 'boolean') && options.loc;
                extra.isKeyword = (typeof options.isKeyword === 'function') && options.isKeyword;
    
                if (extra.loc && options.source !== null && options.source !== undefined) {
                    delegate = extend(delegate, {
                        'postProcess': function (node) {
                            node.loc.source = toString(options.source);
                            return node;
                        }
                    });
                }
    
                if (typeof options.tokens === 'boolean' && options.tokens) {
                    extra.tokens = [];
                }
                if (typeof options.comment === 'boolean' && options.comment) {
                    extra.comments = [];
                }
                if (typeof options.tolerant === 'boolean' && options.tolerant) {
                    extra.errors = [];
                }
            }
    
            if (length > 0) {
                if (typeof source[0] === 'undefined') {
                    // Try first to convert to a string. This is good as fast path
                    // for old IE which understands string indexing for string
                    // literals only and not for string object.
                    if (code instanceof String) {
                        source = code.valueOf();
                    }
                }
            }
    
            patch();
            try {
                program = parseProgram();
                if (typeof extra.comments !== 'undefined') {
                    filterCommentLocation();
                    program.comments = extra.comments;
                }
                if (typeof extra.tokens !== 'undefined') {
                    filterTokenLocation();
                    program.tokens = extra.tokens;
                }
                if (typeof extra.errors !== 'undefined') {
                    program.errors = extra.errors;
                }
                if (extra.range || extra.loc) {
                    program.body = filterGroup(program.body);
                }
            } catch (e) {
                throw e;
            } finally {
                unpatch();
                extra = {};
            }
    
            return program;
        }
    
        // Sync with package.json and component.json.
        exports.version = '1.1.0-dev';
    
        exports.parse = parse;
    
        // Deep copy.
        exports.Syntax = (function () {
            var name, types = {};
    
            if (typeof Object.create === 'function') {
                types = Object.create(null);
            }
    
            for (name in Syntax) {
                if (Syntax.hasOwnProperty(name)) {
                    types[name] = Syntax[name];
                }
            }
    
            if (typeof Object.freeze === 'function') {
                Object.freeze(types);
            }
    
            return types;
        }());
    
    }));
    /* vim: set sw=4 ts=4 et tw=80 : */
    
    },{}],9:[function(require,module,exports){
    var parse = require('acorn').parse;
    var isArray = require('isarray');
    var objectKeys = require('object-keys');
    var forEach = require('foreach');
    
    module.exports = function (src, opts, fn) {
        if (typeof opts === 'function') {
            fn = opts;
            opts = {};
        }
        if (src && typeof src === 'object' && src.constructor.name === 'Buffer') {
            src = src.toString();
        }
        else if (src && typeof src === 'object') {
            opts = src;
            src = opts.source;
            delete opts.source;
        }
        src = src === undefined ? opts.source : src;
        if (typeof src !== 'string') src = String(src);
        if (opts.parser) parse = opts.parser.parse;
        var ast = parse(src, opts);
        
        var result = {
            chunks : src.split(''),
            toString : function () { return result.chunks.join('') },
            inspect : function () { return result.toString() }
        };
        var index = 0;
        
        (function walk (node, parent) {
            insertHelpers(node, parent, result.chunks);
            
            forEach(objectKeys(node), function (key) {
                if (key === 'parent') return;
                
                var child = node[key];
                if (isArray(child)) {
                    forEach(child, function (c) {
                        if (c && typeof c.type === 'string') {
                            walk(c, node);
                        }
                    });
                }
                else if (child && typeof child.type === 'string') {
                    walk(child, node);
                }
            });
            fn(node);
        })(ast, undefined);
        
        return result;
    };
     
    function insertHelpers (node, parent, chunks) {
        node.parent = parent;
        
        node.source = function () {
            return chunks.slice(node.start, node.end).join('');
        };
        
        if (node.update && typeof node.update === 'object') {
            var prev = node.update;
            forEach(objectKeys(prev), function (key) {
                update[key] = prev[key];
            });
            node.update = update;
        }
        else {
            node.update = update;
        }
        
        function update (s) {
            chunks[node.start] = s;
            for (var i = node.start + 1; i < node.end; i++) {
                chunks[i] = '';
            }
        }
    }
    
    },{"acorn":3,"foreach":10,"isarray":11,"object-keys":12}],10:[function(require,module,exports){
    
    var hasOwn = Object.prototype.hasOwnProperty;
    var toString = Object.prototype.toString;
    
    module.exports = function forEach (obj, fn, ctx) {
        if (toString.call(fn) !== '[object Function]') {
            throw new TypeError('iterator must be a function');
        }
        var l = obj.length;
        if (l === +l) {
            for (var i = 0; i < l; i++) {
                fn.call(ctx, obj[i], i, obj);
            }
        } else {
            for (var k in obj) {
                if (hasOwn.call(obj, k)) {
                    fn.call(ctx, obj[k], k, obj);
                }
            }
        }
    };
    
    
    },{}],11:[function(require,module,exports){
    module.exports = Array.isArray || function (arr) {
      return Object.prototype.toString.call(arr) == '[object Array]';
    };
    
    },{}],12:[function(require,module,exports){
    'use strict';
    
    // modified from https://github.com/es-shims/es5-shim
    var has = Object.prototype.hasOwnProperty;
    var toStr = Object.prototype.toString;
    var slice = Array.prototype.slice;
    var isArgs = require('./isArguments');
    var isEnumerable = Object.prototype.propertyIsEnumerable;
    var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
    var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
    var dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
    ];
    var equalsConstructorPrototype = function (o) {
        var ctor = o.constructor;
        return ctor && ctor.prototype === o;
    };
    var excludedKeys = {
        $console: true,
        $external: true,
        $frame: true,
        $frameElement: true,
        $frames: true,
        $innerHeight: true,
        $innerWidth: true,
        $outerHeight: true,
        $outerWidth: true,
        $pageXOffset: true,
        $pageYOffset: true,
        $parent: true,
        $scrollLeft: true,
        $scrollTop: true,
        $scrollX: true,
        $scrollY: true,
        $self: true,
        $webkitIndexedDB: true,
        $webkitStorageInfo: true,
        $window: true
    };
    var hasAutomationEqualityBug = (function () {
        /* global window */
        if (typeof window === 'undefined') { return false; }
        for (var k in window) {
            try {
                if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
                    try {
                        equalsConstructorPrototype(window[k]);
                    } catch (e) {
                        return true;
                    }
                }
            } catch (e) {
                return true;
            }
        }
        return false;
    }());
    var equalsConstructorPrototypeIfNotBuggy = function (o) {
        /* global window */
        if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
            return equalsConstructorPrototype(o);
        }
        try {
            return equalsConstructorPrototype(o);
        } catch (e) {
            return false;
        }
    };
    
    var keysShim = function keys(object) {
        var isObject = object !== null && typeof object === 'object';
        var isFunction = toStr.call(object) === '[object Function]';
        var isArguments = isArgs(object);
        var isString = isObject && toStr.call(object) === '[object String]';
        var theKeys = [];
    
        if (!isObject && !isFunction && !isArguments) {
            throw new TypeError('Object.keys called on a non-object');
        }
    
        var skipProto = hasProtoEnumBug && isFunction;
        if (isString && object.length > 0 && !has.call(object, 0)) {
            for (var i = 0; i < object.length; ++i) {
                theKeys.push(String(i));
            }
        }
    
        if (isArguments && object.length > 0) {
            for (var j = 0; j < object.length; ++j) {
                theKeys.push(String(j));
            }
        } else {
            for (var name in object) {
                if (!(skipProto && name === 'prototype') && has.call(object, name)) {
                    theKeys.push(String(name));
                }
            }
        }
    
        if (hasDontEnumBug) {
            var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);
    
            for (var k = 0; k < dontEnums.length; ++k) {
                if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
                    theKeys.push(dontEnums[k]);
                }
            }
        }
        return theKeys;
    };
    
    keysShim.shim = function shimObjectKeys() {
        if (Object.keys) {
            var keysWorksWithArguments = (function () {
                // Safari 5.0 bug
                return (Object.keys(arguments) || '').length === 2;
            }(1, 2));
            if (!keysWorksWithArguments) {
                var originalKeys = Object.keys;
                Object.keys = function keys(object) {
                    if (isArgs(object)) {
                        return originalKeys(slice.call(object));
                    } else {
                        return originalKeys(object);
                    }
                };
            }
        } else {
            Object.keys = keysShim;
        }
        return Object.keys || keysShim;
    };
    
    module.exports = keysShim;
    
    },{"./isArguments":13}],13:[function(require,module,exports){
    'use strict';
    
    var toStr = Object.prototype.toString;
    
    module.exports = function isArguments(value) {
        var str = toStr.call(value);
        var isArgs = str === '[object Arguments]';
        if (!isArgs) {
            isArgs = str !== '[object Array]' &&
                value !== null &&
                typeof value === 'object' &&
                typeof value.length === 'number' &&
                value.length >= 0 &&
                toStr.call(value.callee) === '[object Function]';
        }
        return isArgs;
    };
    
    },{}],14:[function(require,module,exports){
    /*
     * Copyright 2009-2011 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE.txt or:
     * http://opensource.org/licenses/BSD-3-Clause
     */
    exports.SourceMapGenerator = require('./source-map/source-map-generator').SourceMapGenerator;
    exports.SourceMapConsumer = require('./source-map/source-map-consumer').SourceMapConsumer;
    exports.SourceNode = require('./source-map/source-node').SourceNode;
    
    },{"./source-map/source-map-consumer":20,"./source-map/source-map-generator":21,"./source-map/source-node":22}],15:[function(require,module,exports){
    /* -*- Mode: js; js-indent-level: 2; -*- */
    /*
     * Copyright 2011 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     */
    if (typeof define !== 'function') {
        var define = require('amdefine')(module, require);
    }
    define(function (require, exports, module) {
    
      var util = require('./util');
    
      /**
       * A data structure which is a combination of an array and a set. Adding a new
       * member is O(1), testing for membership is O(1), and finding the index of an
       * element is O(1). Removing elements from the set is not supported. Only
       * strings are supported for membership.
       */
      function ArraySet() {
        this._array = [];
        this._set = {};
      }
    
      /**
       * Static method for creating ArraySet instances from an existing array.
       */
      ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
        var set = new ArraySet();
        for (var i = 0, len = aArray.length; i < len; i++) {
          set.add(aArray[i], aAllowDuplicates);
        }
        return set;
      };
    
      /**
       * Add the given string to this set.
       *
       * @param String aStr
       */
      ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
        var isDuplicate = this.has(aStr);
        var idx = this._array.length;
        if (!isDuplicate || aAllowDuplicates) {
          this._array.push(aStr);
        }
        if (!isDuplicate) {
          this._set[util.toSetString(aStr)] = idx;
        }
      };
    
      /**
       * Is the given string a member of this set?
       *
       * @param String aStr
       */
      ArraySet.prototype.has = function ArraySet_has(aStr) {
        return Object.prototype.hasOwnProperty.call(this._set,
                                                    util.toSetString(aStr));
      };
    
      /**
       * What is the index of the given string in the array?
       *
       * @param String aStr
       */
      ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
        if (this.has(aStr)) {
          return this._set[util.toSetString(aStr)];
        }
        throw new Error('"' + aStr + '" is not in the set.');
      };
    
      /**
       * What is the element at the given index?
       *
       * @param Number aIdx
       */
      ArraySet.prototype.at = function ArraySet_at(aIdx) {
        if (aIdx >= 0 && aIdx < this._array.length) {
          return this._array[aIdx];
        }
        throw new Error('No element indexed by ' + aIdx);
      };
    
      /**
       * Returns the array representation of this set (which has the proper indices
       * indicated by indexOf). Note that this is a copy of the internal array used
       * for storing the members so that no one can mess with internal state.
       */
      ArraySet.prototype.toArray = function ArraySet_toArray() {
        return this._array.slice();
      };
    
      exports.ArraySet = ArraySet;
    
    });
    
    },{"./util":23,"amdefine":4}],16:[function(require,module,exports){
    /* -*- Mode: js; js-indent-level: 2; -*- */
    /*
     * Copyright 2011 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     *
     * Based on the Base 64 VLQ implementation in Closure Compiler:
     * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
     *
     * Copyright 2011 The Closure Compiler Authors. All rights reserved.
     * Redistribution and use in source and binary forms, with or without
     * modification, are permitted provided that the following conditions are
     * met:
     *
     *  * Redistributions of source code must retain the above copyright
     *    notice, this list of conditions and the following disclaimer.
     *  * Redistributions in binary form must reproduce the above
     *    copyright notice, this list of conditions and the following
     *    disclaimer in the documentation and/or other materials provided
     *    with the distribution.
     *  * Neither the name of Google Inc. nor the names of its
     *    contributors may be used to endorse or promote products derived
     *    from this software without specific prior written permission.
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
     * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
     * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
     * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
     * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
     * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
     * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
     * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
     * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
     * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
     * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */
    if (typeof define !== 'function') {
        var define = require('amdefine')(module, require);
    }
    define(function (require, exports, module) {
    
      var base64 = require('./base64');
    
      // A single base 64 digit can contain 6 bits of data. For the base 64 variable
      // length quantities we use in the source map spec, the first bit is the sign,
      // the next four bits are the actual value, and the 6th bit is the
      // continuation bit. The continuation bit tells us whether there are more
      // digits in this value following this digit.
      //
      //   Continuation
      //   |    Sign
      //   |    |
      //   V    V
      //   101011
    
      var VLQ_BASE_SHIFT = 5;
    
      // binary: 100000
      var VLQ_BASE = 1 << VLQ_BASE_SHIFT;
    
      // binary: 011111
      var VLQ_BASE_MASK = VLQ_BASE - 1;
    
      // binary: 100000
      var VLQ_CONTINUATION_BIT = VLQ_BASE;
    
      /**
       * Converts from a two-complement value to a value where the sign bit is
       * placed in the least significant bit.  For example, as decimals:
       *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
       *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
       */
      function toVLQSigned(aValue) {
        return aValue < 0
          ? ((-aValue) << 1) + 1
          : (aValue << 1) + 0;
      }
    
      /**
       * Converts to a two-complement value from a value where the sign bit is
       * placed in the least significant bit.  For example, as decimals:
       *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
       *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
       */
      function fromVLQSigned(aValue) {
        var isNegative = (aValue & 1) === 1;
        var shifted = aValue >> 1;
        return isNegative
          ? -shifted
          : shifted;
      }
    
      /**
       * Returns the base 64 VLQ encoded value.
       */
      exports.encode = function base64VLQ_encode(aValue) {
        var encoded = "";
        var digit;
    
        var vlq = toVLQSigned(aValue);
    
        do {
          digit = vlq & VLQ_BASE_MASK;
          vlq >>>= VLQ_BASE_SHIFT;
          if (vlq > 0) {
            // There are still more digits in this value, so we must make sure the
            // continuation bit is marked.
            digit |= VLQ_CONTINUATION_BIT;
          }
          encoded += base64.encode(digit);
        } while (vlq > 0);
    
        return encoded;
      };
    
      /**
       * Decodes the next base 64 VLQ value from the given string and returns the
       * value and the rest of the string via the out parameter.
       */
      exports.decode = function base64VLQ_decode(aStr, aOutParam) {
        var i = 0;
        var strLen = aStr.length;
        var result = 0;
        var shift = 0;
        var continuation, digit;
    
        do {
          if (i >= strLen) {
            throw new Error("Expected more digits in base 64 VLQ value.");
          }
          digit = base64.decode(aStr.charAt(i++));
          continuation = !!(digit & VLQ_CONTINUATION_BIT);
          digit &= VLQ_BASE_MASK;
          result = result + (digit << shift);
          shift += VLQ_BASE_SHIFT;
        } while (continuation);
    
        aOutParam.value = fromVLQSigned(result);
        aOutParam.rest = aStr.slice(i);
      };
    
    });
    
    },{"./base64":17,"amdefine":4}],17:[function(require,module,exports){
    /* -*- Mode: js; js-indent-level: 2; -*- */
    /*
     * Copyright 2011 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     */
    if (typeof define !== 'function') {
        var define = require('amdefine')(module, require);
    }
    define(function (require, exports, module) {
    
      var charToIntMap = {};
      var intToCharMap = {};
    
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
        .split('')
        .forEach(function (ch, index) {
          charToIntMap[ch] = index;
          intToCharMap[index] = ch;
        });
    
      /**
       * Encode an integer in the range of 0 to 63 to a single base 64 digit.
       */
      exports.encode = function base64_encode(aNumber) {
        if (aNumber in intToCharMap) {
          return intToCharMap[aNumber];
        }
        throw new TypeError("Must be between 0 and 63: " + aNumber);
      };
    
      /**
       * Decode a single base 64 digit to an integer.
       */
      exports.decode = function base64_decode(aChar) {
        if (aChar in charToIntMap) {
          return charToIntMap[aChar];
        }
        throw new TypeError("Not a valid base 64 digit: " + aChar);
      };
    
    });
    
    },{"amdefine":4}],18:[function(require,module,exports){
    /* -*- Mode: js; js-indent-level: 2; -*- */
    /*
     * Copyright 2011 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     */
    if (typeof define !== 'function') {
        var define = require('amdefine')(module, require);
    }
    define(function (require, exports, module) {
    
      /**
       * Recursive implementation of binary search.
       *
       * @param aLow Indices here and lower do not contain the needle.
       * @param aHigh Indices here and higher do not contain the needle.
       * @param aNeedle The element being searched for.
       * @param aHaystack The non-empty array being searched.
       * @param aCompare Function which takes two elements and returns -1, 0, or 1.
       */
      function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare) {
        // This function terminates when one of the following is true:
        //
        //   1. We find the exact element we are looking for.
        //
        //   2. We did not find the exact element, but we can return the index of
        //      the next closest element that is less than that element.
        //
        //   3. We did not find the exact element, and there is no next-closest
        //      element which is less than the one we are searching for, so we
        //      return -1.
        var mid = Math.floor((aHigh - aLow) / 2) + aLow;
        var cmp = aCompare(aNeedle, aHaystack[mid], true);
        if (cmp === 0) {
          // Found the element we are looking for.
          return mid;
        }
        else if (cmp > 0) {
          // aHaystack[mid] is greater than our needle.
          if (aHigh - mid > 1) {
            // The element is in the upper half.
            return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare);
          }
          // We did not find an exact match, return the next closest one
          // (termination case 2).
          return mid;
        }
        else {
          // aHaystack[mid] is less than our needle.
          if (mid - aLow > 1) {
            // The element is in the lower half.
            return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare);
          }
          // The exact needle element was not found in this haystack. Determine if
          // we are in termination case (2) or (3) and return the appropriate thing.
          return aLow < 0 ? -1 : aLow;
        }
      }
    
      /**
       * This is an implementation of binary search which will always try and return
       * the index of next lowest value checked if there is no exact hit. This is
       * because mappings between original and generated line/col pairs are single
       * points, and there is an implicit region between each of them, so a miss
       * just means that you aren't on the very start of a region.
       *
       * @param aNeedle The element you are looking for.
       * @param aHaystack The array that is being searched.
       * @param aCompare A function which takes the needle and an element in the
       *     array and returns -1, 0, or 1 depending on whether the needle is less
       *     than, equal to, or greater than the element, respectively.
       */
      exports.search = function search(aNeedle, aHaystack, aCompare) {
        if (aHaystack.length === 0) {
          return -1;
        }
        return recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare)
      };
    
    });
    
    },{"amdefine":4}],19:[function(require,module,exports){
    /* -*- Mode: js; js-indent-level: 2; -*- */
    /*
     * Copyright 2014 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     */
    if (typeof define !== 'function') {
        var define = require('amdefine')(module, require);
    }
    define(function (require, exports, module) {
    
      var util = require('./util');
    
      /**
       * Determine whether mappingB is after mappingA with respect to generated
       * position.
       */
      function generatedPositionAfter(mappingA, mappingB) {
        // Optimized for most common case
        var lineA = mappingA.generatedLine;
        var lineB = mappingB.generatedLine;
        var columnA = mappingA.generatedColumn;
        var columnB = mappingB.generatedColumn;
        return lineB > lineA || lineB == lineA && columnB >= columnA ||
               util.compareByGeneratedPositions(mappingA, mappingB) <= 0;
      }
    
      /**
       * A data structure to provide a sorted view of accumulated mappings in a
       * performance conscious manner. It trades a neglibable overhead in general
       * case for a large speedup in case of mappings being added in order.
       */
      function MappingList() {
        this._array = [];
        this._sorted = true;
        // Serves as infimum
        this._last = {generatedLine: -1, generatedColumn: 0};
      }
    
      /**
       * Iterate through internal items. This method takes the same arguments that
       * `Array.prototype.forEach` takes.
       *
       * NOTE: The order of the mappings is NOT guaranteed.
       */
      MappingList.prototype.unsortedForEach =
        function MappingList_forEach(aCallback, aThisArg) {
          this._array.forEach(aCallback, aThisArg);
        };
    
      /**
       * Add the given source mapping.
       *
       * @param Object aMapping
       */
      MappingList.prototype.add = function MappingList_add(aMapping) {
        var mapping;
        if (generatedPositionAfter(this._last, aMapping)) {
          this._last = aMapping;
          this._array.push(aMapping);
        } else {
          this._sorted = false;
          this._array.push(aMapping);
        }
      };
    
      /**
       * Returns the flat, sorted array of mappings. The mappings are sorted by
       * generated position.
       *
       * WARNING: This method returns internal data without copying, for
       * performance. The return value must NOT be mutated, and should be treated as
       * an immutable borrow. If you want to take ownership, you must make your own
       * copy.
       */
      MappingList.prototype.toArray = function MappingList_toArray() {
        if (!this._sorted) {
          this._array.sort(util.compareByGeneratedPositions);
          this._sorted = true;
        }
        return this._array;
      };
    
      exports.MappingList = MappingList;
    
    });
    
    },{"./util":23,"amdefine":4}],20:[function(require,module,exports){
    /* -*- Mode: js; js-indent-level: 2; -*- */
    /*
     * Copyright 2011 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     */
    if (typeof define !== 'function') {
        var define = require('amdefine')(module, require);
    }
    define(function (require, exports, module) {
    
      var util = require('./util');
      var binarySearch = require('./binary-search');
      var ArraySet = require('./array-set').ArraySet;
      var base64VLQ = require('./base64-vlq');
    
      /**
       * A SourceMapConsumer instance represents a parsed source map which we can
       * query for information about the original file positions by giving it a file
       * position in the generated source.
       *
       * The only parameter is the raw source map (either as a JSON string, or
       * already parsed to an object). According to the spec, source maps have the
       * following attributes:
       *
       *   - version: Which version of the source map spec this map is following.
       *   - sources: An array of URLs to the original source files.
       *   - names: An array of identifiers which can be referrenced by individual mappings.
       *   - sourceRoot: Optional. The URL root from which all sources are relative.
       *   - sourcesContent: Optional. An array of contents of the original source files.
       *   - mappings: A string of base64 VLQs which contain the actual mappings.
       *   - file: Optional. The generated file this source map is associated with.
       *
       * Here is an example source map, taken from the source map spec[0]:
       *
       *     {
       *       version : 3,
       *       file: "out.js",
       *       sourceRoot : "",
       *       sources: ["foo.js", "bar.js"],
       *       names: ["src", "maps", "are", "fun"],
       *       mappings: "AA,AB;;ABCDE;"
       *     }
       *
       * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
       */
      function SourceMapConsumer(aSourceMap) {
        var sourceMap = aSourceMap;
        if (typeof aSourceMap === 'string') {
          sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
        }
    
        var version = util.getArg(sourceMap, 'version');
        var sources = util.getArg(sourceMap, 'sources');
        // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
        // requires the array) to play nice here.
        var names = util.getArg(sourceMap, 'names', []);
        var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
        var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
        var mappings = util.getArg(sourceMap, 'mappings');
        var file = util.getArg(sourceMap, 'file', null);
    
        // Once again, Sass deviates from the spec and supplies the version as a
        // string rather than a number, so we use loose equality checking here.
        if (version != this._version) {
          throw new Error('Unsupported version: ' + version);
        }
    
        // Some source maps produce relative source paths like "./foo.js" instead of
        // "foo.js".  Normalize these first so that future comparisons will succeed.
        // See bugzil.la/1090768.
        sources = sources.map(util.normalize);
    
        // Pass `true` below to allow duplicate names and sources. While source maps
        // are intended to be compressed and deduplicated, the TypeScript compiler
        // sometimes generates source maps with duplicates in them. See Github issue
        // #72 and bugzil.la/889492.
        this._names = ArraySet.fromArray(names, true);
        this._sources = ArraySet.fromArray(sources, true);
    
        this.sourceRoot = sourceRoot;
        this.sourcesContent = sourcesContent;
        this._mappings = mappings;
        this.file = file;
      }
    
      /**
       * Create a SourceMapConsumer from a SourceMapGenerator.
       *
       * @param SourceMapGenerator aSourceMap
       *        The source map that will be consumed.
       * @returns SourceMapConsumer
       */
      SourceMapConsumer.fromSourceMap =
        function SourceMapConsumer_fromSourceMap(aSourceMap) {
          var smc = Object.create(SourceMapConsumer.prototype);
    
          smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
          smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
          smc.sourceRoot = aSourceMap._sourceRoot;
          smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                                  smc.sourceRoot);
          smc.file = aSourceMap._file;
    
          smc.__generatedMappings = aSourceMap._mappings.toArray().slice();
          smc.__originalMappings = aSourceMap._mappings.toArray().slice()
            .sort(util.compareByOriginalPositions);
    
          return smc;
        };
    
      /**
       * The version of the source mapping spec that we are consuming.
       */
      SourceMapConsumer.prototype._version = 3;
    
      /**
       * The list of original sources.
       */
      Object.defineProperty(SourceMapConsumer.prototype, 'sources', {
        get: function () {
          return this._sources.toArray().map(function (s) {
            return this.sourceRoot != null ? util.join(this.sourceRoot, s) : s;
          }, this);
        }
      });
    
      // `__generatedMappings` and `__originalMappings` are arrays that hold the
      // parsed mapping coordinates from the source map's "mappings" attribute. They
      // are lazily instantiated, accessed via the `_generatedMappings` and
      // `_originalMappings` getters respectively, and we only parse the mappings
      // and create these arrays once queried for a source location. We jump through
      // these hoops because there can be many thousands of mappings, and parsing
      // them is expensive, so we only want to do it if we must.
      //
      // Each object in the arrays is of the form:
      //
      //     {
      //       generatedLine: The line number in the generated code,
      //       generatedColumn: The column number in the generated code,
      //       source: The path to the original source file that generated this
      //               chunk of code,
      //       originalLine: The line number in the original source that
      //                     corresponds to this chunk of generated code,
      //       originalColumn: The column number in the original source that
      //                       corresponds to this chunk of generated code,
      //       name: The name of the original symbol which generated this chunk of
      //             code.
      //     }
      //
      // All properties except for `generatedLine` and `generatedColumn` can be
      // `null`.
      //
      // `_generatedMappings` is ordered by the generated positions.
      //
      // `_originalMappings` is ordered by the original positions.
    
      SourceMapConsumer.prototype.__generatedMappings = null;
      Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
        get: function () {
          if (!this.__generatedMappings) {
            this.__generatedMappings = [];
            this.__originalMappings = [];
            this._parseMappings(this._mappings, this.sourceRoot);
          }
    
          return this.__generatedMappings;
        }
      });
    
      SourceMapConsumer.prototype.__originalMappings = null;
      Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
        get: function () {
          if (!this.__originalMappings) {
            this.__generatedMappings = [];
            this.__originalMappings = [];
            this._parseMappings(this._mappings, this.sourceRoot);
          }
    
          return this.__originalMappings;
        }
      });
    
      SourceMapConsumer.prototype._nextCharIsMappingSeparator =
        function SourceMapConsumer_nextCharIsMappingSeparator(aStr) {
          var c = aStr.charAt(0);
          return c === ";" || c === ",";
        };
    
      /**
       * Parse the mappings in a string in to a data structure which we can easily
       * query (the ordered arrays in the `this.__generatedMappings` and
       * `this.__originalMappings` properties).
       */
      SourceMapConsumer.prototype._parseMappings =
        function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
          var generatedLine = 1;
          var previousGeneratedColumn = 0;
          var previousOriginalLine = 0;
          var previousOriginalColumn = 0;
          var previousSource = 0;
          var previousName = 0;
          var str = aStr;
          var temp = {};
          var mapping;
    
          while (str.length > 0) {
            if (str.charAt(0) === ';') {
              generatedLine++;
              str = str.slice(1);
              previousGeneratedColumn = 0;
            }
            else if (str.charAt(0) === ',') {
              str = str.slice(1);
            }
            else {
              mapping = {};
              mapping.generatedLine = generatedLine;
    
              // Generated column.
              base64VLQ.decode(str, temp);
              mapping.generatedColumn = previousGeneratedColumn + temp.value;
              previousGeneratedColumn = mapping.generatedColumn;
              str = temp.rest;
    
              if (str.length > 0 && !this._nextCharIsMappingSeparator(str)) {
                // Original source.
                base64VLQ.decode(str, temp);
                mapping.source = this._sources.at(previousSource + temp.value);
                previousSource += temp.value;
                str = temp.rest;
                if (str.length === 0 || this._nextCharIsMappingSeparator(str)) {
                  throw new Error('Found a source, but no line and column');
                }
    
                // Original line.
                base64VLQ.decode(str, temp);
                mapping.originalLine = previousOriginalLine + temp.value;
                previousOriginalLine = mapping.originalLine;
                // Lines are stored 0-based
                mapping.originalLine += 1;
                str = temp.rest;
                if (str.length === 0 || this._nextCharIsMappingSeparator(str)) {
                  throw new Error('Found a source and line, but no column');
                }
    
                // Original column.
                base64VLQ.decode(str, temp);
                mapping.originalColumn = previousOriginalColumn + temp.value;
                previousOriginalColumn = mapping.originalColumn;
                str = temp.rest;
    
                if (str.length > 0 && !this._nextCharIsMappingSeparator(str)) {
                  // Original name.
                  base64VLQ.decode(str, temp);
                  mapping.name = this._names.at(previousName + temp.value);
                  previousName += temp.value;
                  str = temp.rest;
                }
              }
    
              this.__generatedMappings.push(mapping);
              if (typeof mapping.originalLine === 'number') {
                this.__originalMappings.push(mapping);
              }
            }
          }
    
          this.__generatedMappings.sort(util.compareByGeneratedPositions);
          this.__originalMappings.sort(util.compareByOriginalPositions);
        };
    
      /**
       * Find the mapping that best matches the hypothetical "needle" mapping that
       * we are searching for in the given "haystack" of mappings.
       */
      SourceMapConsumer.prototype._findMapping =
        function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                               aColumnName, aComparator) {
          // To return the position we are searching for, we must first find the
          // mapping for the given position and then return the opposite position it
          // points to. Because the mappings are sorted, we can use binary search to
          // find the best mapping.
    
          if (aNeedle[aLineName] <= 0) {
            throw new TypeError('Line must be greater than or equal to 1, got '
                                + aNeedle[aLineName]);
          }
          if (aNeedle[aColumnName] < 0) {
            throw new TypeError('Column must be greater than or equal to 0, got '
                                + aNeedle[aColumnName]);
          }
    
          return binarySearch.search(aNeedle, aMappings, aComparator);
        };
    
      /**
       * Compute the last column for each generated mapping. The last column is
       * inclusive.
       */
      SourceMapConsumer.prototype.computeColumnSpans =
        function SourceMapConsumer_computeColumnSpans() {
          for (var index = 0; index < this._generatedMappings.length; ++index) {
            var mapping = this._generatedMappings[index];
    
            // Mappings do not contain a field for the last generated columnt. We
            // can come up with an optimistic estimate, however, by assuming that
            // mappings are contiguous (i.e. given two consecutive mappings, the
            // first mapping ends where the second one starts).
            if (index + 1 < this._generatedMappings.length) {
              var nextMapping = this._generatedMappings[index + 1];
    
              if (mapping.generatedLine === nextMapping.generatedLine) {
                mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
                continue;
              }
            }
    
            // The last mapping for each line spans the entire line.
            mapping.lastGeneratedColumn = Infinity;
          }
        };
    
      /**
       * Returns the original source, line, and column information for the generated
       * source's line and column positions provided. The only argument is an object
       * with the following properties:
       *
       *   - line: The line number in the generated source.
       *   - column: The column number in the generated source.
       *
       * and an object is returned with the following properties:
       *
       *   - source: The original source file, or null.
       *   - line: The line number in the original source, or null.
       *   - column: The column number in the original source, or null.
       *   - name: The original identifier, or null.
       */
      SourceMapConsumer.prototype.originalPositionFor =
        function SourceMapConsumer_originalPositionFor(aArgs) {
          var needle = {
            generatedLine: util.getArg(aArgs, 'line'),
            generatedColumn: util.getArg(aArgs, 'column')
          };
    
          var index = this._findMapping(needle,
                                        this._generatedMappings,
                                        "generatedLine",
                                        "generatedColumn",
                                        util.compareByGeneratedPositions);
    
          if (index >= 0) {
            var mapping = this._generatedMappings[index];
    
            if (mapping.generatedLine === needle.generatedLine) {
              var source = util.getArg(mapping, 'source', null);
              if (source != null && this.sourceRoot != null) {
                source = util.join(this.sourceRoot, source);
              }
              return {
                source: source,
                line: util.getArg(mapping, 'originalLine', null),
                column: util.getArg(mapping, 'originalColumn', null),
                name: util.getArg(mapping, 'name', null)
              };
            }
          }
    
          return {
            source: null,
            line: null,
            column: null,
            name: null
          };
        };
    
      /**
       * Returns the original source content. The only argument is the url of the
       * original source file. Returns null if no original source content is
       * availible.
       */
      SourceMapConsumer.prototype.sourceContentFor =
        function SourceMapConsumer_sourceContentFor(aSource) {
          if (!this.sourcesContent) {
            return null;
          }
    
          if (this.sourceRoot != null) {
            aSource = util.relative(this.sourceRoot, aSource);
          }
    
          if (this._sources.has(aSource)) {
            return this.sourcesContent[this._sources.indexOf(aSource)];
          }
    
          var url;
          if (this.sourceRoot != null
              && (url = util.urlParse(this.sourceRoot))) {
            // XXX: file:// URIs and absolute paths lead to unexpected behavior for
            // many users. We can help them out when they expect file:// URIs to
            // behave like it would if they were running a local HTTP server. See
            // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
            var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
            if (url.scheme == "file"
                && this._sources.has(fileUriAbsPath)) {
              return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
            }
    
            if ((!url.path || url.path == "/")
                && this._sources.has("/" + aSource)) {
              return this.sourcesContent[this._sources.indexOf("/" + aSource)];
            }
          }
    
          throw new Error('"' + aSource + '" is not in the SourceMap.');
        };
    
      /**
       * Returns the generated line and column information for the original source,
       * line, and column positions provided. The only argument is an object with
       * the following properties:
       *
       *   - source: The filename of the original source.
       *   - line: The line number in the original source.
       *   - column: The column number in the original source.
       *
       * and an object is returned with the following properties:
       *
       *   - line: The line number in the generated source, or null.
       *   - column: The column number in the generated source, or null.
       */
      SourceMapConsumer.prototype.generatedPositionFor =
        function SourceMapConsumer_generatedPositionFor(aArgs) {
          var needle = {
            source: util.getArg(aArgs, 'source'),
            originalLine: util.getArg(aArgs, 'line'),
            originalColumn: util.getArg(aArgs, 'column')
          };
    
          if (this.sourceRoot != null) {
            needle.source = util.relative(this.sourceRoot, needle.source);
          }
    
          var index = this._findMapping(needle,
                                        this._originalMappings,
                                        "originalLine",
                                        "originalColumn",
                                        util.compareByOriginalPositions);
    
          if (index >= 0) {
            var mapping = this._originalMappings[index];
    
            return {
              line: util.getArg(mapping, 'generatedLine', null),
              column: util.getArg(mapping, 'generatedColumn', null),
              lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
            };
          }
    
          return {
            line: null,
            column: null,
            lastColumn: null
          };
        };
    
      /**
       * Returns all generated line and column information for the original source
       * and line provided. The only argument is an object with the following
       * properties:
       *
       *   - source: The filename of the original source.
       *   - line: The line number in the original source.
       *
       * and an array of objects is returned, each with the following properties:
       *
       *   - line: The line number in the generated source, or null.
       *   - column: The column number in the generated source, or null.
       */
      SourceMapConsumer.prototype.allGeneratedPositionsFor =
        function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
          // When there is no exact match, SourceMapConsumer.prototype._findMapping
          // returns the index of the closest mapping less than the needle. By
          // setting needle.originalColumn to Infinity, we thus find the last
          // mapping for the given line, provided such a mapping exists.
          var needle = {
            source: util.getArg(aArgs, 'source'),
            originalLine: util.getArg(aArgs, 'line'),
            originalColumn: Infinity
          };
    
          if (this.sourceRoot != null) {
            needle.source = util.relative(this.sourceRoot, needle.source);
          }
    
          var mappings = [];
    
          var index = this._findMapping(needle,
                                        this._originalMappings,
                                        "originalLine",
                                        "originalColumn",
                                        util.compareByOriginalPositions);
          if (index >= 0) {
            var mapping = this._originalMappings[index];
    
            while (mapping && mapping.originalLine === needle.originalLine) {
              mappings.push({
                line: util.getArg(mapping, 'generatedLine', null),
                column: util.getArg(mapping, 'generatedColumn', null),
                lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
              });
    
              mapping = this._originalMappings[--index];
            }
          }
    
          return mappings.reverse();
        };
    
      SourceMapConsumer.GENERATED_ORDER = 1;
      SourceMapConsumer.ORIGINAL_ORDER = 2;
    
      /**
       * Iterate over each mapping between an original source/line/column and a
       * generated line/column in this source map.
       *
       * @param Function aCallback
       *        The function that is called with each mapping.
       * @param Object aContext
       *        Optional. If specified, this object will be the value of `this` every
       *        time that `aCallback` is called.
       * @param aOrder
       *        Either `SourceMapConsumer.GENERATED_ORDER` or
       *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
       *        iterate over the mappings sorted by the generated file's line/column
       *        order or the original's source/line/column order, respectively. Defaults to
       *        `SourceMapConsumer.GENERATED_ORDER`.
       */
      SourceMapConsumer.prototype.eachMapping =
        function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
          var context = aContext || null;
          var order = aOrder || SourceMapConsumer.GENERATED_ORDER;
    
          var mappings;
          switch (order) {
          case SourceMapConsumer.GENERATED_ORDER:
            mappings = this._generatedMappings;
            break;
          case SourceMapConsumer.ORIGINAL_ORDER:
            mappings = this._originalMappings;
            break;
          default:
            throw new Error("Unknown order of iteration.");
          }
    
          var sourceRoot = this.sourceRoot;
          mappings.map(function (mapping) {
            var source = mapping.source;
            if (source != null && sourceRoot != null) {
              source = util.join(sourceRoot, source);
            }
            return {
              source: source,
              generatedLine: mapping.generatedLine,
              generatedColumn: mapping.generatedColumn,
              originalLine: mapping.originalLine,
              originalColumn: mapping.originalColumn,
              name: mapping.name
            };
          }).forEach(aCallback, context);
        };
    
      exports.SourceMapConsumer = SourceMapConsumer;
    
    });
    
    },{"./array-set":15,"./base64-vlq":16,"./binary-search":18,"./util":23,"amdefine":4}],21:[function(require,module,exports){
    /* -*- Mode: js; js-indent-level: 2; -*- */
    /*
     * Copyright 2011 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     */
    if (typeof define !== 'function') {
        var define = require('amdefine')(module, require);
    }
    define(function (require, exports, module) {
    
      var base64VLQ = require('./base64-vlq');
      var util = require('./util');
      var ArraySet = require('./array-set').ArraySet;
      var MappingList = require('./mapping-list').MappingList;
    
      /**
       * An instance of the SourceMapGenerator represents a source map which is
       * being built incrementally. You may pass an object with the following
       * properties:
       *
       *   - file: The filename of the generated source.
       *   - sourceRoot: A root for all relative URLs in this source map.
       */
      function SourceMapGenerator(aArgs) {
        if (!aArgs) {
          aArgs = {};
        }
        this._file = util.getArg(aArgs, 'file', null);
        this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
        this._skipValidation = util.getArg(aArgs, 'skipValidation', false);
        this._sources = new ArraySet();
        this._names = new ArraySet();
        this._mappings = new MappingList();
        this._sourcesContents = null;
      }
    
      SourceMapGenerator.prototype._version = 3;
    
      /**
       * Creates a new SourceMapGenerator based on a SourceMapConsumer
       *
       * @param aSourceMapConsumer The SourceMap.
       */
      SourceMapGenerator.fromSourceMap =
        function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
          var sourceRoot = aSourceMapConsumer.sourceRoot;
          var generator = new SourceMapGenerator({
            file: aSourceMapConsumer.file,
            sourceRoot: sourceRoot
          });
          aSourceMapConsumer.eachMapping(function (mapping) {
            var newMapping = {
              generated: {
                line: mapping.generatedLine,
                column: mapping.generatedColumn
              }
            };
    
            if (mapping.source != null) {
              newMapping.source = mapping.source;
              if (sourceRoot != null) {
                newMapping.source = util.relative(sourceRoot, newMapping.source);
              }
    
              newMapping.original = {
                line: mapping.originalLine,
                column: mapping.originalColumn
              };
    
              if (mapping.name != null) {
                newMapping.name = mapping.name;
              }
            }
    
            generator.addMapping(newMapping);
          });
          aSourceMapConsumer.sources.forEach(function (sourceFile) {
            var content = aSourceMapConsumer.sourceContentFor(sourceFile);
            if (content != null) {
              generator.setSourceContent(sourceFile, content);
            }
          });
          return generator;
        };
    
      /**
       * Add a single mapping from original source line and column to the generated
       * source's line and column for this source map being created. The mapping
       * object should have the following properties:
       *
       *   - generated: An object with the generated line and column positions.
       *   - original: An object with the original line and column positions.
       *   - source: The original source file (relative to the sourceRoot).
       *   - name: An optional original token name for this mapping.
       */
      SourceMapGenerator.prototype.addMapping =
        function SourceMapGenerator_addMapping(aArgs) {
          var generated = util.getArg(aArgs, 'generated');
          var original = util.getArg(aArgs, 'original', null);
          var source = util.getArg(aArgs, 'source', null);
          var name = util.getArg(aArgs, 'name', null);
    
          if (!this._skipValidation) {
            this._validateMapping(generated, original, source, name);
          }
    
          if (source != null && !this._sources.has(source)) {
            this._sources.add(source);
          }
    
          if (name != null && !this._names.has(name)) {
            this._names.add(name);
          }
    
          this._mappings.add({
            generatedLine: generated.line,
            generatedColumn: generated.column,
            originalLine: original != null && original.line,
            originalColumn: original != null && original.column,
            source: source,
            name: name
          });
        };
    
      /**
       * Set the source content for a source file.
       */
      SourceMapGenerator.prototype.setSourceContent =
        function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
          var source = aSourceFile;
          if (this._sourceRoot != null) {
            source = util.relative(this._sourceRoot, source);
          }
    
          if (aSourceContent != null) {
            // Add the source content to the _sourcesContents map.
            // Create a new _sourcesContents map if the property is null.
            if (!this._sourcesContents) {
              this._sourcesContents = {};
            }
            this._sourcesContents[util.toSetString(source)] = aSourceContent;
          } else if (this._sourcesContents) {
            // Remove the source file from the _sourcesContents map.
            // If the _sourcesContents map is empty, set the property to null.
            delete this._sourcesContents[util.toSetString(source)];
            if (Object.keys(this._sourcesContents).length === 0) {
              this._sourcesContents = null;
            }
          }
        };
    
      /**
       * Applies the mappings of a sub-source-map for a specific source file to the
       * source map being generated. Each mapping to the supplied source file is
       * rewritten using the supplied source map. Note: The resolution for the
       * resulting mappings is the minimium of this map and the supplied map.
       *
       * @param aSourceMapConsumer The source map to be applied.
       * @param aSourceFile Optional. The filename of the source file.
       *        If omitted, SourceMapConsumer's file property will be used.
       * @param aSourceMapPath Optional. The dirname of the path to the source map
       *        to be applied. If relative, it is relative to the SourceMapConsumer.
       *        This parameter is needed when the two source maps aren't in the same
       *        directory, and the source map to be applied contains relative source
       *        paths. If so, those relative source paths need to be rewritten
       *        relative to the SourceMapGenerator.
       */
      SourceMapGenerator.prototype.applySourceMap =
        function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
          var sourceFile = aSourceFile;
          // If aSourceFile is omitted, we will use the file property of the SourceMap
          if (aSourceFile == null) {
            if (aSourceMapConsumer.file == null) {
              throw new Error(
                'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
                'or the source map\'s "file" property. Both were omitted.'
              );
            }
            sourceFile = aSourceMapConsumer.file;
          }
          var sourceRoot = this._sourceRoot;
          // Make "sourceFile" relative if an absolute Url is passed.
          if (sourceRoot != null) {
            sourceFile = util.relative(sourceRoot, sourceFile);
          }
          // Applying the SourceMap can add and remove items from the sources and
          // the names array.
          var newSources = new ArraySet();
          var newNames = new ArraySet();
    
          // Find mappings for the "sourceFile"
          this._mappings.unsortedForEach(function (mapping) {
            if (mapping.source === sourceFile && mapping.originalLine != null) {
              // Check if it can be mapped by the source map, then update the mapping.
              var original = aSourceMapConsumer.originalPositionFor({
                line: mapping.originalLine,
                column: mapping.originalColumn
              });
              if (original.source != null) {
                // Copy mapping
                mapping.source = original.source;
                if (aSourceMapPath != null) {
                  mapping.source = util.join(aSourceMapPath, mapping.source)
                }
                if (sourceRoot != null) {
                  mapping.source = util.relative(sourceRoot, mapping.source);
                }
                mapping.originalLine = original.line;
                mapping.originalColumn = original.column;
                if (original.name != null) {
                  mapping.name = original.name;
                }
              }
            }
    
            var source = mapping.source;
            if (source != null && !newSources.has(source)) {
              newSources.add(source);
            }
    
            var name = mapping.name;
            if (name != null && !newNames.has(name)) {
              newNames.add(name);
            }
    
          }, this);
          this._sources = newSources;
          this._names = newNames;
    
          // Copy sourcesContents of applied map.
          aSourceMapConsumer.sources.forEach(function (sourceFile) {
            var content = aSourceMapConsumer.sourceContentFor(sourceFile);
            if (content != null) {
              if (aSourceMapPath != null) {
                sourceFile = util.join(aSourceMapPath, sourceFile);
              }
              if (sourceRoot != null) {
                sourceFile = util.relative(sourceRoot, sourceFile);
              }
              this.setSourceContent(sourceFile, content);
            }
          }, this);
        };
    
      /**
       * A mapping can have one of the three levels of data:
       *
       *   1. Just the generated position.
       *   2. The Generated position, original position, and original source.
       *   3. Generated and original position, original source, as well as a name
       *      token.
       *
       * To maintain consistency, we validate that any new mapping being added falls
       * in to one of these categories.
       */
      SourceMapGenerator.prototype._validateMapping =
        function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                                    aName) {
          if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
              && aGenerated.line > 0 && aGenerated.column >= 0
              && !aOriginal && !aSource && !aName) {
            // Case 1.
            return;
          }
          else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
                   && aOriginal && 'line' in aOriginal && 'column' in aOriginal
                   && aGenerated.line > 0 && aGenerated.column >= 0
                   && aOriginal.line > 0 && aOriginal.column >= 0
                   && aSource) {
            // Cases 2 and 3.
            return;
          }
          else {
            throw new Error('Invalid mapping: ' + JSON.stringify({
              generated: aGenerated,
              source: aSource,
              original: aOriginal,
              name: aName
            }));
          }
        };
    
      /**
       * Serialize the accumulated mappings in to the stream of base 64 VLQs
       * specified by the source map format.
       */
      SourceMapGenerator.prototype._serializeMappings =
        function SourceMapGenerator_serializeMappings() {
          var previousGeneratedColumn = 0;
          var previousGeneratedLine = 1;
          var previousOriginalColumn = 0;
          var previousOriginalLine = 0;
          var previousName = 0;
          var previousSource = 0;
          var result = '';
          var mapping;
    
          var mappings = this._mappings.toArray();
    
          for (var i = 0, len = mappings.length; i < len; i++) {
            mapping = mappings[i];
    
            if (mapping.generatedLine !== previousGeneratedLine) {
              previousGeneratedColumn = 0;
              while (mapping.generatedLine !== previousGeneratedLine) {
                result += ';';
                previousGeneratedLine++;
              }
            }
            else {
              if (i > 0) {
                if (!util.compareByGeneratedPositions(mapping, mappings[i - 1])) {
                  continue;
                }
                result += ',';
              }
            }
    
            result += base64VLQ.encode(mapping.generatedColumn
                                       - previousGeneratedColumn);
            previousGeneratedColumn = mapping.generatedColumn;
    
            if (mapping.source != null) {
              result += base64VLQ.encode(this._sources.indexOf(mapping.source)
                                         - previousSource);
              previousSource = this._sources.indexOf(mapping.source);
    
              // lines are stored 0-based in SourceMap spec version 3
              result += base64VLQ.encode(mapping.originalLine - 1
                                         - previousOriginalLine);
              previousOriginalLine = mapping.originalLine - 1;
    
              result += base64VLQ.encode(mapping.originalColumn
                                         - previousOriginalColumn);
              previousOriginalColumn = mapping.originalColumn;
    
              if (mapping.name != null) {
                result += base64VLQ.encode(this._names.indexOf(mapping.name)
                                           - previousName);
                previousName = this._names.indexOf(mapping.name);
              }
            }
          }
    
          return result;
        };
    
      SourceMapGenerator.prototype._generateSourcesContent =
        function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
          return aSources.map(function (source) {
            if (!this._sourcesContents) {
              return null;
            }
            if (aSourceRoot != null) {
              source = util.relative(aSourceRoot, source);
            }
            var key = util.toSetString(source);
            return Object.prototype.hasOwnProperty.call(this._sourcesContents,
                                                        key)
              ? this._sourcesContents[key]
              : null;
          }, this);
        };
    
      /**
       * Externalize the source map.
       */
      SourceMapGenerator.prototype.toJSON =
        function SourceMapGenerator_toJSON() {
          var map = {
            version: this._version,
            sources: this._sources.toArray(),
            names: this._names.toArray(),
            mappings: this._serializeMappings()
          };
          if (this._file != null) {
            map.file = this._file;
          }
          if (this._sourceRoot != null) {
            map.sourceRoot = this._sourceRoot;
          }
          if (this._sourcesContents) {
            map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
          }
    
          return map;
        };
    
      /**
       * Render the source map being generated to a string.
       */
      SourceMapGenerator.prototype.toString =
        function SourceMapGenerator_toString() {
          return JSON.stringify(this);
        };
    
      exports.SourceMapGenerator = SourceMapGenerator;
    
    });
    
    },{"./array-set":15,"./base64-vlq":16,"./mapping-list":19,"./util":23,"amdefine":4}],22:[function(require,module,exports){
    /* -*- Mode: js; js-indent-level: 2; -*- */
    /*
     * Copyright 2011 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     */
    if (typeof define !== 'function') {
        var define = require('amdefine')(module, require);
    }
    define(function (require, exports, module) {
    
      var SourceMapGenerator = require('./source-map-generator').SourceMapGenerator;
      var util = require('./util');
    
      // Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
      // operating systems these days (capturing the result).
      var REGEX_NEWLINE = /(\r?\n)/;
    
      // Newline character code for charCodeAt() comparisons
      var NEWLINE_CODE = 10;
    
      // Private symbol for identifying `SourceNode`s when multiple versions of
      // the source-map library are loaded. This MUST NOT CHANGE across
      // versions!
      var isSourceNode = "$$$isSourceNode$$$";
    
      /**
       * SourceNodes provide a way to abstract over interpolating/concatenating
       * snippets of generated JavaScript source code while maintaining the line and
       * column information associated with the original source code.
       *
       * @param aLine The original line number.
       * @param aColumn The original column number.
       * @param aSource The original source's filename.
       * @param aChunks Optional. An array of strings which are snippets of
       *        generated JS, or other SourceNodes.
       * @param aName The original identifier.
       */
      function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
        this.children = [];
        this.sourceContents = {};
        this.line = aLine == null ? null : aLine;
        this.column = aColumn == null ? null : aColumn;
        this.source = aSource == null ? null : aSource;
        this.name = aName == null ? null : aName;
        this[isSourceNode] = true;
        if (aChunks != null) this.add(aChunks);
      }
    
      /**
       * Creates a SourceNode from generated code and a SourceMapConsumer.
       *
       * @param aGeneratedCode The generated code
       * @param aSourceMapConsumer The SourceMap for the generated code
       * @param aRelativePath Optional. The path that relative sources in the
       *        SourceMapConsumer should be relative to.
       */
      SourceNode.fromStringWithSourceMap =
        function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
          // The SourceNode we want to fill with the generated code
          // and the SourceMap
          var node = new SourceNode();
    
          // All even indices of this array are one line of the generated code,
          // while all odd indices are the newlines between two adjacent lines
          // (since `REGEX_NEWLINE` captures its match).
          // Processed fragments are removed from this array, by calling `shiftNextLine`.
          var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
          var shiftNextLine = function() {
            var lineContents = remainingLines.shift();
            // The last line of a file might not have a newline.
            var newLine = remainingLines.shift() || "";
            return lineContents + newLine;
          };
    
          // We need to remember the position of "remainingLines"
          var lastGeneratedLine = 1, lastGeneratedColumn = 0;
    
          // The generate SourceNodes we need a code range.
          // To extract it current and last mapping is used.
          // Here we store the last mapping.
          var lastMapping = null;
    
          aSourceMapConsumer.eachMapping(function (mapping) {
            if (lastMapping !== null) {
              // We add the code from "lastMapping" to "mapping":
              // First check if there is a new line in between.
              if (lastGeneratedLine < mapping.generatedLine) {
                var code = "";
                // Associate first line with "lastMapping"
                addMappingWithCode(lastMapping, shiftNextLine());
                lastGeneratedLine++;
                lastGeneratedColumn = 0;
                // The remaining code is added without mapping
              } else {
                // There is no new line in between.
                // Associate the code between "lastGeneratedColumn" and
                // "mapping.generatedColumn" with "lastMapping"
                var nextLine = remainingLines[0];
                var code = nextLine.substr(0, mapping.generatedColumn -
                                              lastGeneratedColumn);
                remainingLines[0] = nextLine.substr(mapping.generatedColumn -
                                                    lastGeneratedColumn);
                lastGeneratedColumn = mapping.generatedColumn;
                addMappingWithCode(lastMapping, code);
                // No more remaining code, continue
                lastMapping = mapping;
                return;
              }
            }
            // We add the generated code until the first mapping
            // to the SourceNode without any mapping.
            // Each line is added as separate string.
            while (lastGeneratedLine < mapping.generatedLine) {
              node.add(shiftNextLine());
              lastGeneratedLine++;
            }
            if (lastGeneratedColumn < mapping.generatedColumn) {
              var nextLine = remainingLines[0];
              node.add(nextLine.substr(0, mapping.generatedColumn));
              remainingLines[0] = nextLine.substr(mapping.generatedColumn);
              lastGeneratedColumn = mapping.generatedColumn;
            }
            lastMapping = mapping;
          }, this);
          // We have processed all mappings.
          if (remainingLines.length > 0) {
            if (lastMapping) {
              // Associate the remaining code in the current line with "lastMapping"
              addMappingWithCode(lastMapping, shiftNextLine());
            }
            // and add the remaining lines without any mapping
            node.add(remainingLines.join(""));
          }
    
          // Copy sourcesContent into SourceNode
          aSourceMapConsumer.sources.forEach(function (sourceFile) {
            var content = aSourceMapConsumer.sourceContentFor(sourceFile);
            if (content != null) {
              if (aRelativePath != null) {
                sourceFile = util.join(aRelativePath, sourceFile);
              }
              node.setSourceContent(sourceFile, content);
            }
          });
    
          return node;
    
          function addMappingWithCode(mapping, code) {
            if (mapping === null || mapping.source === undefined) {
              node.add(code);
            } else {
              var source = aRelativePath
                ? util.join(aRelativePath, mapping.source)
                : mapping.source;
              node.add(new SourceNode(mapping.originalLine,
                                      mapping.originalColumn,
                                      source,
                                      code,
                                      mapping.name));
            }
          }
        };
    
      /**
       * Add a chunk of generated JS to this source node.
       *
       * @param aChunk A string snippet of generated JS code, another instance of
       *        SourceNode, or an array where each member is one of those things.
       */
      SourceNode.prototype.add = function SourceNode_add(aChunk) {
        if (Array.isArray(aChunk)) {
          aChunk.forEach(function (chunk) {
            this.add(chunk);
          }, this);
        }
        else if (aChunk[isSourceNode] || typeof aChunk === "string") {
          if (aChunk) {
            this.children.push(aChunk);
          }
        }
        else {
          throw new TypeError(
            "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
          );
        }
        return this;
      };
    
      /**
       * Add a chunk of generated JS to the beginning of this source node.
       *
       * @param aChunk A string snippet of generated JS code, another instance of
       *        SourceNode, or an array where each member is one of those things.
       */
      SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
        if (Array.isArray(aChunk)) {
          for (var i = aChunk.length-1; i >= 0; i--) {
            this.prepend(aChunk[i]);
          }
        }
        else if (aChunk[isSourceNode] || typeof aChunk === "string") {
          this.children.unshift(aChunk);
        }
        else {
          throw new TypeError(
            "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
          );
        }
        return this;
      };
    
      /**
       * Walk over the tree of JS snippets in this node and its children. The
       * walking function is called once for each snippet of JS and is passed that
       * snippet and the its original associated source's line/column location.
       *
       * @param aFn The traversal function.
       */
      SourceNode.prototype.walk = function SourceNode_walk(aFn) {
        var chunk;
        for (var i = 0, len = this.children.length; i < len; i++) {
          chunk = this.children[i];
          if (chunk[isSourceNode]) {
            chunk.walk(aFn);
          }
          else {
            if (chunk !== '') {
              aFn(chunk, { source: this.source,
                           line: this.line,
                           column: this.column,
                           name: this.name });
            }
          }
        }
      };
    
      /**
       * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
       * each of `this.children`.
       *
       * @param aSep The separator.
       */
      SourceNode.prototype.join = function SourceNode_join(aSep) {
        var newChildren;
        var i;
        var len = this.children.length;
        if (len > 0) {
          newChildren = [];
          for (i = 0; i < len-1; i++) {
            newChildren.push(this.children[i]);
            newChildren.push(aSep);
          }
          newChildren.push(this.children[i]);
          this.children = newChildren;
        }
        return this;
      };
    
      /**
       * Call String.prototype.replace on the very right-most source snippet. Useful
       * for trimming whitespace from the end of a source node, etc.
       *
       * @param aPattern The pattern to replace.
       * @param aReplacement The thing to replace the pattern with.
       */
      SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
        var lastChild = this.children[this.children.length - 1];
        if (lastChild[isSourceNode]) {
          lastChild.replaceRight(aPattern, aReplacement);
        }
        else if (typeof lastChild === 'string') {
          this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
        }
        else {
          this.children.push(''.replace(aPattern, aReplacement));
        }
        return this;
      };
    
      /**
       * Set the source content for a source file. This will be added to the SourceMapGenerator
       * in the sourcesContent field.
       *
       * @param aSourceFile The filename of the source file
       * @param aSourceContent The content of the source file
       */
      SourceNode.prototype.setSourceContent =
        function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
          this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
        };
    
      /**
       * Walk over the tree of SourceNodes. The walking function is called for each
       * source file content and is passed the filename and source content.
       *
       * @param aFn The traversal function.
       */
      SourceNode.prototype.walkSourceContents =
        function SourceNode_walkSourceContents(aFn) {
          for (var i = 0, len = this.children.length; i < len; i++) {
            if (this.children[i][isSourceNode]) {
              this.children[i].walkSourceContents(aFn);
            }
          }
    
          var sources = Object.keys(this.sourceContents);
          for (var i = 0, len = sources.length; i < len; i++) {
            aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
          }
        };
    
      /**
       * Return the string representation of this source node. Walks over the tree
       * and concatenates all the various snippets together to one string.
       */
      SourceNode.prototype.toString = function SourceNode_toString() {
        var str = "";
        this.walk(function (chunk) {
          str += chunk;
        });
        return str;
      };
    
      /**
       * Returns the string representation of this source node along with a source
       * map.
       */
      SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
        var generated = {
          code: "",
          line: 1,
          column: 0
        };
        var map = new SourceMapGenerator(aArgs);
        var sourceMappingActive = false;
        var lastOriginalSource = null;
        var lastOriginalLine = null;
        var lastOriginalColumn = null;
        var lastOriginalName = null;
        this.walk(function (chunk, original) {
          generated.code += chunk;
          if (original.source !== null
              && original.line !== null
              && original.column !== null) {
            if(lastOriginalSource !== original.source
               || lastOriginalLine !== original.line
               || lastOriginalColumn !== original.column
               || lastOriginalName !== original.name) {
              map.addMapping({
                source: original.source,
                original: {
                  line: original.line,
                  column: original.column
                },
                generated: {
                  line: generated.line,
                  column: generated.column
                },
                name: original.name
              });
            }
            lastOriginalSource = original.source;
            lastOriginalLine = original.line;
            lastOriginalColumn = original.column;
            lastOriginalName = original.name;
            sourceMappingActive = true;
          } else if (sourceMappingActive) {
            map.addMapping({
              generated: {
                line: generated.line,
                column: generated.column
              }
            });
            lastOriginalSource = null;
            sourceMappingActive = false;
          }
          for (var idx = 0, length = chunk.length; idx < length; idx++) {
            if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
              generated.line++;
              generated.column = 0;
              // Mappings end at eol
              if (idx + 1 === length) {
                lastOriginalSource = null;
                sourceMappingActive = false;
              } else if (sourceMappingActive) {
                map.addMapping({
                  source: original.source,
                  original: {
                    line: original.line,
                    column: original.column
                  },
                  generated: {
                    line: generated.line,
                    column: generated.column
                  },
                  name: original.name
                });
              }
            } else {
              generated.column++;
            }
          }
        });
        this.walkSourceContents(function (sourceFile, sourceContent) {
          map.setSourceContent(sourceFile, sourceContent);
        });
    
        return { code: generated.code, map: map };
      };
    
      exports.SourceNode = SourceNode;
    
    });
    
    },{"./source-map-generator":21,"./util":23,"amdefine":4}],23:[function(require,module,exports){
    /* -*- Mode: js; js-indent-level: 2; -*- */
    /*
     * Copyright 2011 Mozilla Foundation and contributors
     * Licensed under the New BSD license. See LICENSE or:
     * http://opensource.org/licenses/BSD-3-Clause
     */
    if (typeof define !== 'function') {
        var define = require('amdefine')(module, require);
    }
    define(function (require, exports, module) {
    
      /**
       * This is a helper function for getting values from parameter/options
       * objects.
       *
       * @param args The object we are extracting values from
       * @param name The name of the property we are getting.
       * @param defaultValue An optional value to return if the property is missing
       * from the object. If this is not specified and the property is missing, an
       * error will be thrown.
       */
      function getArg(aArgs, aName, aDefaultValue) {
        if (aName in aArgs) {
          return aArgs[aName];
        } else if (arguments.length === 3) {
          return aDefaultValue;
        } else {
          throw new Error('"' + aName + '" is a required argument.');
        }
      }
      exports.getArg = getArg;
    
      var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/;
      var dataUrlRegexp = /^data:.+\,.+$/;
    
      function urlParse(aUrl) {
        var match = aUrl.match(urlRegexp);
        if (!match) {
          return null;
        }
        return {
          scheme: match[1],
          auth: match[2],
          host: match[3],
          port: match[4],
          path: match[5]
        };
      }
      exports.urlParse = urlParse;
    
      function urlGenerate(aParsedUrl) {
        var url = '';
        if (aParsedUrl.scheme) {
          url += aParsedUrl.scheme + ':';
        }
        url += '//';
        if (aParsedUrl.auth) {
          url += aParsedUrl.auth + '@';
        }
        if (aParsedUrl.host) {
          url += aParsedUrl.host;
        }
        if (aParsedUrl.port) {
          url += ":" + aParsedUrl.port
        }
        if (aParsedUrl.path) {
          url += aParsedUrl.path;
        }
        return url;
      }
      exports.urlGenerate = urlGenerate;
    
      /**
       * Normalizes a path, or the path portion of a URL:
       *
       * - Replaces consequtive slashes with one slash.
       * - Removes unnecessary '.' parts.
       * - Removes unnecessary '<dir>/..' parts.
       *
       * Based on code in the Node.js 'path' core module.
       *
       * @param aPath The path or url to normalize.
       */
      function normalize(aPath) {
        var path = aPath;
        var url = urlParse(aPath);
        if (url) {
          if (!url.path) {
            return aPath;
          }
          path = url.path;
        }
        var isAbsolute = (path.charAt(0) === '/');
    
        var parts = path.split(/\/+/);
        for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
          part = parts[i];
          if (part === '.') {
            parts.splice(i, 1);
          } else if (part === '..') {
            up++;
          } else if (up > 0) {
            if (part === '') {
              // The first part is blank if the path is absolute. Trying to go
              // above the root is a no-op. Therefore we can remove all '..' parts
              // directly after the root.
              parts.splice(i + 1, up);
              up = 0;
            } else {
              parts.splice(i, 2);
              up--;
            }
          }
        }
        path = parts.join('/');
    
        if (path === '') {
          path = isAbsolute ? '/' : '.';
        }
    
        if (url) {
          url.path = path;
          return urlGenerate(url);
        }
        return path;
      }
      exports.normalize = normalize;
    
      /**
       * Joins two paths/URLs.
       *
       * @param aRoot The root path or URL.
       * @param aPath The path or URL to be joined with the root.
       *
       * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
       *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
       *   first.
       * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
       *   is updated with the result and aRoot is returned. Otherwise the result
       *   is returned.
       *   - If aPath is absolute, the result is aPath.
       *   - Otherwise the two paths are joined with a slash.
       * - Joining for example 'http://' and 'www.example.com' is also supported.
       */
      function join(aRoot, aPath) {
        if (aRoot === "") {
          aRoot = ".";
        }
        if (aPath === "") {
          aPath = ".";
        }
        var aPathUrl = urlParse(aPath);
        var aRootUrl = urlParse(aRoot);
        if (aRootUrl) {
          aRoot = aRootUrl.path || '/';
        }
    
        // `join(foo, '//www.example.org')`
        if (aPathUrl && !aPathUrl.scheme) {
          if (aRootUrl) {
            aPathUrl.scheme = aRootUrl.scheme;
          }
          return urlGenerate(aPathUrl);
        }
    
        if (aPathUrl || aPath.match(dataUrlRegexp)) {
          return aPath;
        }
    
        // `join('http://', 'www.example.com')`
        if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
          aRootUrl.host = aPath;
          return urlGenerate(aRootUrl);
        }
    
        var joined = aPath.charAt(0) === '/'
          ? aPath
          : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);
    
        if (aRootUrl) {
          aRootUrl.path = joined;
          return urlGenerate(aRootUrl);
        }
        return joined;
      }
      exports.join = join;
    
      /**
       * Make a path relative to a URL or another path.
       *
       * @param aRoot The root path or URL.
       * @param aPath The path or URL to be made relative to aRoot.
       */
      function relative(aRoot, aPath) {
        if (aRoot === "") {
          aRoot = ".";
        }
    
        aRoot = aRoot.replace(/\/$/, '');
    
        // XXX: It is possible to remove this block, and the tests still pass!
        var url = urlParse(aRoot);
        if (aPath.charAt(0) == "/" && url && url.path == "/") {
          return aPath.slice(1);
        }
    
        return aPath.indexOf(aRoot + '/') === 0
          ? aPath.substr(aRoot.length + 1)
          : aPath;
      }
      exports.relative = relative;
    
      /**
       * Because behavior goes wacky when you set `__proto__` on objects, we
       * have to prefix all the strings in our set with an arbitrary character.
       *
       * See https://github.com/mozilla/source-map/pull/31 and
       * https://github.com/mozilla/source-map/issues/30
       *
       * @param String aStr
       */
      function toSetString(aStr) {
        return '$' + aStr;
      }
      exports.toSetString = toSetString;
    
      function fromSetString(aStr) {
        return aStr.substr(1);
      }
      exports.fromSetString = fromSetString;
    
      function strcmp(aStr1, aStr2) {
        var s1 = aStr1 || "";
        var s2 = aStr2 || "";
        return (s1 > s2) - (s1 < s2);
      }
    
      /**
       * Comparator between two mappings where the original positions are compared.
       *
       * Optionally pass in `true` as `onlyCompareGenerated` to consider two
       * mappings with the same original source/line/column, but different generated
       * line and column the same. Useful when searching for a mapping with a
       * stubbed out mapping.
       */
      function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
        var cmp;
    
        cmp = strcmp(mappingA.source, mappingB.source);
        if (cmp) {
          return cmp;
        }
    
        cmp = mappingA.originalLine - mappingB.originalLine;
        if (cmp) {
          return cmp;
        }
    
        cmp = mappingA.originalColumn - mappingB.originalColumn;
        if (cmp || onlyCompareOriginal) {
          return cmp;
        }
    
        cmp = strcmp(mappingA.name, mappingB.name);
        if (cmp) {
          return cmp;
        }
    
        cmp = mappingA.generatedLine - mappingB.generatedLine;
        if (cmp) {
          return cmp;
        }
    
        return mappingA.generatedColumn - mappingB.generatedColumn;
      };
      exports.compareByOriginalPositions = compareByOriginalPositions;
    
      /**
       * Comparator between two mappings where the generated positions are
       * compared.
       *
       * Optionally pass in `true` as `onlyCompareGenerated` to consider two
       * mappings with the same generated line and column, but different
       * source/name/original line and column the same. Useful when searching for a
       * mapping with a stubbed out mapping.
       */
      function compareByGeneratedPositions(mappingA, mappingB, onlyCompareGenerated) {
        var cmp;
    
        cmp = mappingA.generatedLine - mappingB.generatedLine;
        if (cmp) {
          return cmp;
        }
    
        cmp = mappingA.generatedColumn - mappingB.generatedColumn;
        if (cmp || onlyCompareGenerated) {
          return cmp;
        }
    
        cmp = strcmp(mappingA.source, mappingB.source);
        if (cmp) {
          return cmp;
        }
    
        cmp = mappingA.originalLine - mappingB.originalLine;
        if (cmp) {
          return cmp;
        }
    
        cmp = mappingA.originalColumn - mappingB.originalColumn;
        if (cmp) {
          return cmp;
        }
    
        return strcmp(mappingA.name, mappingB.name);
      };
      exports.compareByGeneratedPositions = compareByGeneratedPositions;
    
    });
    
    },{"amdefine":4}],24:[function(require,module,exports){
    module.exports={
        "name" : "fondue-es6",
        "description" : "rewrites JavaScript code to collect partial execution traces, forked for es6 compatibility",
        "license" : "MIT",
        "author" : "Tom Lieber <tom@alltom.com>",
        "version" : "0.7.0",
        "main" : "./index",
        "repository" : {
            "type" : "git",
            "url" : "https://github.com/polo2ro/fondue.git"
        },
        "dependencies" : {
            "falafel" : "1.2.0",
            "falafel-map" : "0.3.2",
            "esprima-selector" : "~0.0.3",
            "falafel-helpers" : "~0.0.3"
        },
        "devDependencies" : {
            "tap" : "0.4.x"
        },
        "keywords" : [
            "source",
            "trace",
            "instrumentation"
        ],
        "scripts" : {
            "test" : "tap test/test-*.js",
            "build-browser" : "node build-browser.js"
        },
        "bin" : {
            "node-theseus" : "./bin/fondue"
        }
    }
    
    },{}],25:[function(require,module,exports){
    
    },{}],26:[function(require,module,exports){
    'use strict'
    
    exports.byteLength = byteLength
    exports.toByteArray = toByteArray
    exports.fromByteArray = fromByteArray
    
    var lookup = []
    var revLookup = []
    var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array
    
    var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i]
      revLookup[code.charCodeAt(i)] = i
    }
    
    revLookup['-'.charCodeAt(0)] = 62
    revLookup['_'.charCodeAt(0)] = 63
    
    function placeHoldersCount (b64) {
      var len = b64.length
      if (len % 4 > 0) {
        throw new Error('Invalid string. Length must be a multiple of 4')
      }
    
      // the number of equal signs (place holders)
      // if there are two placeholders, than the two characters before it
      // represent one byte
      // if there is only one, then the three characters before it represent 2 bytes
      // this is just a cheap hack to not do indexOf twice
      return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
    }
    
    function byteLength (b64) {
      // base64 is 4/3 + up to two characters of the original data
      return (b64.length * 3 / 4) - placeHoldersCount(b64)
    }
    
    function toByteArray (b64) {
      var i, l, tmp, placeHolders, arr
      var len = b64.length
      placeHolders = placeHoldersCount(b64)
    
      arr = new Arr((len * 3 / 4) - placeHolders)
    
      // if there are placeholders, only get up to the last complete 4 chars
      l = placeHolders > 0 ? len - 4 : len
    
      var L = 0
    
      for (i = 0; i < l; i += 4) {
        tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
        arr[L++] = (tmp >> 16) & 0xFF
        arr[L++] = (tmp >> 8) & 0xFF
        arr[L++] = tmp & 0xFF
      }
    
      if (placeHolders === 2) {
        tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
        arr[L++] = tmp & 0xFF
      } else if (placeHolders === 1) {
        tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
        arr[L++] = (tmp >> 8) & 0xFF
        arr[L++] = tmp & 0xFF
      }
    
      return arr
    }
    
    function tripletToBase64 (num) {
      return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
    }
    
    function encodeChunk (uint8, start, end) {
      var tmp
      var output = []
      for (var i = start; i < end; i += 3) {
        tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
        output.push(tripletToBase64(tmp))
      }
      return output.join('')
    }
    
    function fromByteArray (uint8) {
      var tmp
      var len = uint8.length
      var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
      var output = ''
      var parts = []
      var maxChunkLength = 16383 // must be multiple of 3
    
      // go through the array every three bytes, we'll deal with trailing stuff later
      for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
        parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
      }
    
      // pad the end with zeros, but make sure to not forget the extra bytes
      if (extraBytes === 1) {
        tmp = uint8[len - 1]
        output += lookup[tmp >> 2]
        output += lookup[(tmp << 4) & 0x3F]
        output += '=='
      } else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
        output += lookup[tmp >> 10]
        output += lookup[(tmp >> 4) & 0x3F]
        output += lookup[(tmp << 2) & 0x3F]
        output += '='
      }
    
      parts.push(output)
    
      return parts.join('')
    }
    
    },{}],27:[function(require,module,exports){
    /*!
     * The buffer module from node.js, for the browser.
     *
     * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
     * @license  MIT
     */
    /* eslint-disable no-proto */
    
    'use strict'
    
    var base64 = require('base64-js')
    var ieee754 = require('ieee754')
    
    exports.Buffer = Buffer
    exports.SlowBuffer = SlowBuffer
    exports.INSPECT_MAX_BYTES = 50
    
    var K_MAX_LENGTH = 0x7fffffff
    exports.kMaxLength = K_MAX_LENGTH
    
    /**
     * If `Buffer.TYPED_ARRAY_SUPPORT`:
     *   === true    Use Uint8Array implementation (fastest)
     *   === false   Print warning and recommend using `buffer` v4.x which has an Object
     *               implementation (most compatible, even IE6)
     *
     * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
     * Opera 11.6+, iOS 4.2+.
     *
     * We report that the browser does not support typed arrays if the are not subclassable
     * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
     * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
     * for __proto__ and has a buggy typed array implementation.
     */
    Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()
    
    if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
        typeof console.error === 'function') {
      console.error(
        'This browser lacks typed array (Uint8Array) support which is required by ' +
        '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
      )
    }
    
    function typedArraySupport () {
      // Can typed array instances can be augmented?
      try {
        var arr = new Uint8Array(1)
        arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
        return arr.foo() === 42
      } catch (e) {
        return false
      }
    }
    
    function createBuffer (length) {
      if (length > K_MAX_LENGTH) {
        throw new RangeError('Invalid typed array length')
      }
      // Return an augmented `Uint8Array` instance
      var buf = new Uint8Array(length)
      buf.__proto__ = Buffer.prototype
      return buf
    }
    
    /**
     * The Buffer constructor returns instances of `Uint8Array` that have their
     * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
     * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
     * and the `Uint8Array` methods. Square bracket notation works as expected -- it
     * returns a single octet.
     *
     * The `Uint8Array` prototype remains unmodified.
     */
    
    function Buffer (arg, encodingOrOffset, length) {
      // Common case.
      if (typeof arg === 'number') {
        if (typeof encodingOrOffset === 'string') {
          throw new Error(
            'If encoding is specified then the first argument must be a string'
          )
        }
        return allocUnsafe(arg)
      }
      return from(arg, encodingOrOffset, length)
    }
    
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    if (typeof Symbol !== 'undefined' && Symbol.species &&
        Buffer[Symbol.species] === Buffer) {
      Object.defineProperty(Buffer, Symbol.species, {
        value: null,
        configurable: true,
        enumerable: false,
        writable: false
      })
    }
    
    Buffer.poolSize = 8192 // not used by this implementation
    
    function from (value, encodingOrOffset, length) {
      if (typeof value === 'number') {
        throw new TypeError('"value" argument must not be a number')
      }
    
      if (value instanceof ArrayBuffer) {
        return fromArrayBuffer(value, encodingOrOffset, length)
      }
    
      if (typeof value === 'string') {
        return fromString(value, encodingOrOffset)
      }
    
      return fromObject(value)
    }
    
    /**
     * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
     * if value is a number.
     * Buffer.from(str[, encoding])
     * Buffer.from(array)
     * Buffer.from(buffer)
     * Buffer.from(arrayBuffer[, byteOffset[, length]])
     **/
    Buffer.from = function (value, encodingOrOffset, length) {
      return from(value, encodingOrOffset, length)
    }
    
    // Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
    // https://github.com/feross/buffer/pull/148
    Buffer.prototype.__proto__ = Uint8Array.prototype
    Buffer.__proto__ = Uint8Array
    
    function assertSize (size) {
      if (typeof size !== 'number') {
        throw new TypeError('"size" argument must be a number')
      } else if (size < 0) {
        throw new RangeError('"size" argument must not be negative')
      }
    }
    
    function alloc (size, fill, encoding) {
      assertSize(size)
      if (size <= 0) {
        return createBuffer(size)
      }
      if (fill !== undefined) {
        // Only pay attention to encoding if it's a string. This
        // prevents accidentally sending in a number that would
        // be interpretted as a start offset.
        return typeof encoding === 'string'
          ? createBuffer(size).fill(fill, encoding)
          : createBuffer(size).fill(fill)
      }
      return createBuffer(size)
    }
    
    /**
     * Creates a new filled Buffer instance.
     * alloc(size[, fill[, encoding]])
     **/
    Buffer.alloc = function (size, fill, encoding) {
      return alloc(size, fill, encoding)
    }
    
    function allocUnsafe (size) {
      assertSize(size)
      return createBuffer(size < 0 ? 0 : checked(size) | 0)
    }
    
    /**
     * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
     * */
    Buffer.allocUnsafe = function (size) {
      return allocUnsafe(size)
    }
    /**
     * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
     */
    Buffer.allocUnsafeSlow = function (size) {
      return allocUnsafe(size)
    }
    
    function fromString (string, encoding) {
      if (typeof encoding !== 'string' || encoding === '') {
        encoding = 'utf8'
      }
    
      if (!Buffer.isEncoding(encoding)) {
        throw new TypeError('"encoding" must be a valid string encoding')
      }
    
      var length = byteLength(string, encoding) | 0
      var buf = createBuffer(length)
    
      var actual = buf.write(string, encoding)
    
      if (actual !== length) {
        // Writing a hex string, for example, that contains invalid characters will
        // cause everything after the first invalid character to be ignored. (e.g.
        // 'abxxcd' will be treated as 'ab')
        buf = buf.slice(0, actual)
      }
    
      return buf
    }
    
    function fromArrayLike (array) {
      var length = array.length < 0 ? 0 : checked(array.length) | 0
      var buf = createBuffer(length)
      for (var i = 0; i < length; i += 1) {
        buf[i] = array[i] & 255
      }
      return buf
    }
    
    function fromArrayBuffer (array, byteOffset, length) {
      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('\'offset\' is out of bounds')
      }
    
      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('\'length\' is out of bounds')
      }
    
      var buf
      if (byteOffset === undefined && length === undefined) {
        buf = new Uint8Array(array)
      } else if (length === undefined) {
        buf = new Uint8Array(array, byteOffset)
      } else {
        buf = new Uint8Array(array, byteOffset, length)
      }
    
      // Return an augmented `Uint8Array` instance
      buf.__proto__ = Buffer.prototype
      return buf
    }
    
    function fromObject (obj) {
      if (Buffer.isBuffer(obj)) {
        var len = checked(obj.length) | 0
        var buf = createBuffer(len)
    
        if (buf.length === 0) {
          return buf
        }
    
        obj.copy(buf, 0, 0, len)
        return buf
      }
    
      if (obj) {
        if (isArrayBufferView(obj) || 'length' in obj) {
          if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
            return createBuffer(0)
          }
          return fromArrayLike(obj)
        }
    
        if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
          return fromArrayLike(obj.data)
        }
      }
    
      throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
    }
    
    function checked (length) {
      // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
      // length is NaN (which is otherwise coerced to zero.)
      if (length >= K_MAX_LENGTH) {
        throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                             'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
      }
      return length | 0
    }
    
    function SlowBuffer (length) {
      if (+length != length) { // eslint-disable-line eqeqeq
        length = 0
      }
      return Buffer.alloc(+length)
    }
    
    Buffer.isBuffer = function isBuffer (b) {
      return b != null && b._isBuffer === true
    }
    
    Buffer.compare = function compare (a, b) {
      if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
        throw new TypeError('Arguments must be Buffers')
      }
    
      if (a === b) return 0
    
      var x = a.length
      var y = b.length
    
      for (var i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i]
          y = b[i]
          break
        }
      }
    
      if (x < y) return -1
      if (y < x) return 1
      return 0
    }
    
    Buffer.isEncoding = function isEncoding (encoding) {
      switch (String(encoding).toLowerCase()) {
        case 'hex':
        case 'utf8':
        case 'utf-8':
        case 'ascii':
        case 'latin1':
        case 'binary':
        case 'base64':
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return true
        default:
          return false
      }
    }
    
    Buffer.concat = function concat (list, length) {
      if (!Array.isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers')
      }
    
      if (list.length === 0) {
        return Buffer.alloc(0)
      }
    
      var i
      if (length === undefined) {
        length = 0
        for (i = 0; i < list.length; ++i) {
          length += list[i].length
        }
      }
    
      var buffer = Buffer.allocUnsafe(length)
      var pos = 0
      for (i = 0; i < list.length; ++i) {
        var buf = list[i]
        if (!Buffer.isBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers')
        }
        buf.copy(buffer, pos)
        pos += buf.length
      }
      return buffer
    }
    
    function byteLength (string, encoding) {
      if (Buffer.isBuffer(string)) {
        return string.length
      }
      if (isArrayBufferView(string) || string instanceof ArrayBuffer) {
        return string.byteLength
      }
      if (typeof string !== 'string') {
        string = '' + string
      }
    
      var len = string.length
      if (len === 0) return 0
    
      // Use a for loop to avoid recursion
      var loweredCase = false
      for (;;) {
        switch (encoding) {
          case 'ascii':
          case 'latin1':
          case 'binary':
            return len
          case 'utf8':
          case 'utf-8':
          case undefined:
            return utf8ToBytes(string).length
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return len * 2
          case 'hex':
            return len >>> 1
          case 'base64':
            return base64ToBytes(string).length
          default:
            if (loweredCase) return utf8ToBytes(string).length // assume utf8
            encoding = ('' + encoding).toLowerCase()
            loweredCase = true
        }
      }
    }
    Buffer.byteLength = byteLength
    
    function slowToString (encoding, start, end) {
      var loweredCase = false
    
      // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
      // property of a typed array.
    
      // This behaves neither like String nor Uint8Array in that we set start/end
      // to their upper/lower bounds if the value passed is out of range.
      // undefined is handled specially as per ECMA-262 6th Edition,
      // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
      if (start === undefined || start < 0) {
        start = 0
      }
      // Return early if start > this.length. Done here to prevent potential uint32
      // coercion fail below.
      if (start > this.length) {
        return ''
      }
    
      if (end === undefined || end > this.length) {
        end = this.length
      }
    
      if (end <= 0) {
        return ''
      }
    
      // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
      end >>>= 0
      start >>>= 0
    
      if (end <= start) {
        return ''
      }
    
      if (!encoding) encoding = 'utf8'
    
      while (true) {
        switch (encoding) {
          case 'hex':
            return hexSlice(this, start, end)
    
          case 'utf8':
          case 'utf-8':
            return utf8Slice(this, start, end)
    
          case 'ascii':
            return asciiSlice(this, start, end)
    
          case 'latin1':
          case 'binary':
            return latin1Slice(this, start, end)
    
          case 'base64':
            return base64Slice(this, start, end)
    
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return utf16leSlice(this, start, end)
    
          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
            encoding = (encoding + '').toLowerCase()
            loweredCase = true
        }
      }
    }
    
    // This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
    // to detect a Buffer instance. It's not possible to use `instanceof Buffer`
    // reliably in a browserify context because there could be multiple different
    // copies of the 'buffer' package in use. This method works even for Buffer
    // instances that were created from another copy of the `buffer` package.
    // See: https://github.com/feross/buffer/issues/154
    Buffer.prototype._isBuffer = true
    
    function swap (b, n, m) {
      var i = b[n]
      b[n] = b[m]
      b[m] = i
    }
    
    Buffer.prototype.swap16 = function swap16 () {
      var len = this.length
      if (len % 2 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 16-bits')
      }
      for (var i = 0; i < len; i += 2) {
        swap(this, i, i + 1)
      }
      return this
    }
    
    Buffer.prototype.swap32 = function swap32 () {
      var len = this.length
      if (len % 4 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 32-bits')
      }
      for (var i = 0; i < len; i += 4) {
        swap(this, i, i + 3)
        swap(this, i + 1, i + 2)
      }
      return this
    }
    
    Buffer.prototype.swap64 = function swap64 () {
      var len = this.length
      if (len % 8 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 64-bits')
      }
      for (var i = 0; i < len; i += 8) {
        swap(this, i, i + 7)
        swap(this, i + 1, i + 6)
        swap(this, i + 2, i + 5)
        swap(this, i + 3, i + 4)
      }
      return this
    }
    
    Buffer.prototype.toString = function toString () {
      var length = this.length
      if (length === 0) return ''
      if (arguments.length === 0) return utf8Slice(this, 0, length)
      return slowToString.apply(this, arguments)
    }
    
    Buffer.prototype.equals = function equals (b) {
      if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
      if (this === b) return true
      return Buffer.compare(this, b) === 0
    }
    
    Buffer.prototype.inspect = function inspect () {
      var str = ''
      var max = exports.INSPECT_MAX_BYTES
      if (this.length > 0) {
        str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
        if (this.length > max) str += ' ... '
      }
      return '<Buffer ' + str + '>'
    }
    
    Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
      if (!Buffer.isBuffer(target)) {
        throw new TypeError('Argument must be a Buffer')
      }
    
      if (start === undefined) {
        start = 0
      }
      if (end === undefined) {
        end = target ? target.length : 0
      }
      if (thisStart === undefined) {
        thisStart = 0
      }
      if (thisEnd === undefined) {
        thisEnd = this.length
      }
    
      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError('out of range index')
      }
    
      if (thisStart >= thisEnd && start >= end) {
        return 0
      }
      if (thisStart >= thisEnd) {
        return -1
      }
      if (start >= end) {
        return 1
      }
    
      start >>>= 0
      end >>>= 0
      thisStart >>>= 0
      thisEnd >>>= 0
    
      if (this === target) return 0
    
      var x = thisEnd - thisStart
      var y = end - start
      var len = Math.min(x, y)
    
      var thisCopy = this.slice(thisStart, thisEnd)
      var targetCopy = target.slice(start, end)
    
      for (var i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i]
          y = targetCopy[i]
          break
        }
      }
    
      if (x < y) return -1
      if (y < x) return 1
      return 0
    }
    
    // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
    // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
    //
    // Arguments:
    // - buffer - a Buffer to search
    // - val - a string, Buffer, or number
    // - byteOffset - an index into `buffer`; will be clamped to an int32
    // - encoding - an optional encoding, relevant is val is a string
    // - dir - true for indexOf, false for lastIndexOf
    function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
      // Empty buffer means no match
      if (buffer.length === 0) return -1
    
      // Normalize byteOffset
      if (typeof byteOffset === 'string') {
        encoding = byteOffset
        byteOffset = 0
      } else if (byteOffset > 0x7fffffff) {
        byteOffset = 0x7fffffff
      } else if (byteOffset < -0x80000000) {
        byteOffset = -0x80000000
      }
      byteOffset = +byteOffset  // Coerce to Number.
      if (numberIsNaN(byteOffset)) {
        // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
        byteOffset = dir ? 0 : (buffer.length - 1)
      }
    
      // Normalize byteOffset: negative offsets start from the end of the buffer
      if (byteOffset < 0) byteOffset = buffer.length + byteOffset
      if (byteOffset >= buffer.length) {
        if (dir) return -1
        else byteOffset = buffer.length - 1
      } else if (byteOffset < 0) {
        if (dir) byteOffset = 0
        else return -1
      }
    
      // Normalize val
      if (typeof val === 'string') {
        val = Buffer.from(val, encoding)
      }
    
      // Finally, search either indexOf (if dir is true) or lastIndexOf
      if (Buffer.isBuffer(val)) {
        // Special case: looking for empty string/buffer always fails
        if (val.length === 0) {
          return -1
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
      } else if (typeof val === 'number') {
        val = val & 0xFF // Search for a byte value [0-255]
        if (typeof Uint8Array.prototype.indexOf === 'function') {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
          }
        }
        return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
      }
    
      throw new TypeError('val must be string, number or Buffer')
    }
    
    function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
      var indexSize = 1
      var arrLength = arr.length
      var valLength = val.length
    
      if (encoding !== undefined) {
        encoding = String(encoding).toLowerCase()
        if (encoding === 'ucs2' || encoding === 'ucs-2' ||
            encoding === 'utf16le' || encoding === 'utf-16le') {
          if (arr.length < 2 || val.length < 2) {
            return -1
          }
          indexSize = 2
          arrLength /= 2
          valLength /= 2
          byteOffset /= 2
        }
      }
    
      function read (buf, i) {
        if (indexSize === 1) {
          return buf[i]
        } else {
          return buf.readUInt16BE(i * indexSize)
        }
      }
    
      var i
      if (dir) {
        var foundIndex = -1
        for (i = byteOffset; i < arrLength; i++) {
          if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
            if (foundIndex === -1) foundIndex = i
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
          } else {
            if (foundIndex !== -1) i -= i - foundIndex
            foundIndex = -1
          }
        }
      } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
        for (i = byteOffset; i >= 0; i--) {
          var found = true
          for (var j = 0; j < valLength; j++) {
            if (read(arr, i + j) !== read(val, j)) {
              found = false
              break
            }
          }
          if (found) return i
        }
      }
    
      return -1
    }
    
    Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1
    }
    
    Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
    }
    
    Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
    }
    
    function hexWrite (buf, string, offset, length) {
      offset = Number(offset) || 0
      var remaining = buf.length - offset
      if (!length) {
        length = remaining
      } else {
        length = Number(length)
        if (length > remaining) {
          length = remaining
        }
      }
    
      // must be an even number of digits
      var strLen = string.length
      if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')
    
      if (length > strLen / 2) {
        length = strLen / 2
      }
      for (var i = 0; i < length; ++i) {
        var parsed = parseInt(string.substr(i * 2, 2), 16)
        if (numberIsNaN(parsed)) return i
        buf[offset + i] = parsed
      }
      return i
    }
    
    function utf8Write (buf, string, offset, length) {
      return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
    }
    
    function asciiWrite (buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length)
    }
    
    function latin1Write (buf, string, offset, length) {
      return asciiWrite(buf, string, offset, length)
    }
    
    function base64Write (buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length)
    }
    
    function ucs2Write (buf, string, offset, length) {
      return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
    }
    
    Buffer.prototype.write = function write (string, offset, length, encoding) {
      // Buffer#write(string)
      if (offset === undefined) {
        encoding = 'utf8'
        length = this.length
        offset = 0
      // Buffer#write(string, encoding)
      } else if (length === undefined && typeof offset === 'string') {
        encoding = offset
        length = this.length
        offset = 0
      // Buffer#write(string, offset[, length][, encoding])
      } else if (isFinite(offset)) {
        offset = offset >>> 0
        if (isFinite(length)) {
          length = length >>> 0
          if (encoding === undefined) encoding = 'utf8'
        } else {
          encoding = length
          length = undefined
        }
      } else {
        throw new Error(
          'Buffer.write(string, encoding, offset[, length]) is no longer supported'
        )
      }
    
      var remaining = this.length - offset
      if (length === undefined || length > remaining) length = remaining
    
      if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
        throw new RangeError('Attempt to write outside buffer bounds')
      }
    
      if (!encoding) encoding = 'utf8'
    
      var loweredCase = false
      for (;;) {
        switch (encoding) {
          case 'hex':
            return hexWrite(this, string, offset, length)
    
          case 'utf8':
          case 'utf-8':
            return utf8Write(this, string, offset, length)
    
          case 'ascii':
            return asciiWrite(this, string, offset, length)
    
          case 'latin1':
          case 'binary':
            return latin1Write(this, string, offset, length)
    
          case 'base64':
            // Warning: maxLength not taken into account in base64Write
            return base64Write(this, string, offset, length)
    
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return ucs2Write(this, string, offset, length)
    
          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
            encoding = ('' + encoding).toLowerCase()
            loweredCase = true
        }
      }
    }
    
    Buffer.prototype.toJSON = function toJSON () {
      return {
        type: 'Buffer',
        data: Array.prototype.slice.call(this._arr || this, 0)
      }
    }
    
    function base64Slice (buf, start, end) {
      if (start === 0 && end === buf.length) {
        return base64.fromByteArray(buf)
      } else {
        return base64.fromByteArray(buf.slice(start, end))
      }
    }
    
    function utf8Slice (buf, start, end) {
      end = Math.min(buf.length, end)
      var res = []
    
      var i = start
      while (i < end) {
        var firstByte = buf[i]
        var codePoint = null
        var bytesPerSequence = (firstByte > 0xEF) ? 4
          : (firstByte > 0xDF) ? 3
          : (firstByte > 0xBF) ? 2
          : 1
    
        if (i + bytesPerSequence <= end) {
          var secondByte, thirdByte, fourthByte, tempCodePoint
    
          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 0x80) {
                codePoint = firstByte
              }
              break
            case 2:
              secondByte = buf[i + 1]
              if ((secondByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
                if (tempCodePoint > 0x7F) {
                  codePoint = tempCodePoint
                }
              }
              break
            case 3:
              secondByte = buf[i + 1]
              thirdByte = buf[i + 2]
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
                if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                  codePoint = tempCodePoint
                }
              }
              break
            case 4:
              secondByte = buf[i + 1]
              thirdByte = buf[i + 2]
              fourthByte = buf[i + 3]
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
                if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                  codePoint = tempCodePoint
                }
              }
          }
        }
    
        if (codePoint === null) {
          // we did not generate a valid codePoint so insert a
          // replacement char (U+FFFD) and advance only 1 byte
          codePoint = 0xFFFD
          bytesPerSequence = 1
        } else if (codePoint > 0xFFFF) {
          // encode to utf16 (surrogate pair dance)
          codePoint -= 0x10000
          res.push(codePoint >>> 10 & 0x3FF | 0xD800)
          codePoint = 0xDC00 | codePoint & 0x3FF
        }
    
        res.push(codePoint)
        i += bytesPerSequence
      }
    
      return decodeCodePointsArray(res)
    }
    
    // Based on http://stackoverflow.com/a/22747272/680742, the browser with
    // the lowest limit is Chrome, with 0x10000 args.
    // We go 1 magnitude less, for safety
    var MAX_ARGUMENTS_LENGTH = 0x1000
    
    function decodeCodePointsArray (codePoints) {
      var len = codePoints.length
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
      }
    
      // Decode in chunks to avoid "call stack size exceeded".
      var res = ''
      var i = 0
      while (i < len) {
        res += String.fromCharCode.apply(
          String,
          codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
        )
      }
      return res
    }
    
    function asciiSlice (buf, start, end) {
      var ret = ''
      end = Math.min(buf.length, end)
    
      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 0x7F)
      }
      return ret
    }
    
    function latin1Slice (buf, start, end) {
      var ret = ''
      end = Math.min(buf.length, end)
    
      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i])
      }
      return ret
    }
    
    function hexSlice (buf, start, end) {
      var len = buf.length
    
      if (!start || start < 0) start = 0
      if (!end || end < 0 || end > len) end = len
    
      var out = ''
      for (var i = start; i < end; ++i) {
        out += toHex(buf[i])
      }
      return out
    }
    
    function utf16leSlice (buf, start, end) {
      var bytes = buf.slice(start, end)
      var res = ''
      for (var i = 0; i < bytes.length; i += 2) {
        res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
      }
      return res
    }
    
    Buffer.prototype.slice = function slice (start, end) {
      var len = this.length
      start = ~~start
      end = end === undefined ? len : ~~end
    
      if (start < 0) {
        start += len
        if (start < 0) start = 0
      } else if (start > len) {
        start = len
      }
    
      if (end < 0) {
        end += len
        if (end < 0) end = 0
      } else if (end > len) {
        end = len
      }
    
      if (end < start) end = start
    
      var newBuf = this.subarray(start, end)
      // Return an augmented `Uint8Array` instance
      newBuf.__proto__ = Buffer.prototype
      return newBuf
    }
    
    /*
     * Need to make sure that buffer isn't trying to write out of bounds.
     */
    function checkOffset (offset, ext, length) {
      if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
      if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
    }
    
    Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
      offset = offset >>> 0
      byteLength = byteLength >>> 0
      if (!noAssert) checkOffset(offset, byteLength, this.length)
    
      var val = this[offset]
      var mul = 1
      var i = 0
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul
      }
    
      return val
    }
    
    Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
      offset = offset >>> 0
      byteLength = byteLength >>> 0
      if (!noAssert) {
        checkOffset(offset, byteLength, this.length)
      }
    
      var val = this[offset + --byteLength]
      var mul = 1
      while (byteLength > 0 && (mul *= 0x100)) {
        val += this[offset + --byteLength] * mul
      }
    
      return val
    }
    
    Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 1, this.length)
      return this[offset]
    }
    
    Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 2, this.length)
      return this[offset] | (this[offset + 1] << 8)
    }
    
    Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 2, this.length)
      return (this[offset] << 8) | this[offset + 1]
    }
    
    Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 4, this.length)
    
      return ((this[offset]) |
          (this[offset + 1] << 8) |
          (this[offset + 2] << 16)) +
          (this[offset + 3] * 0x1000000)
    }
    
    Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 4, this.length)
    
      return (this[offset] * 0x1000000) +
        ((this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        this[offset + 3])
    }
    
    Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
      offset = offset >>> 0
      byteLength = byteLength >>> 0
      if (!noAssert) checkOffset(offset, byteLength, this.length)
    
      var val = this[offset]
      var mul = 1
      var i = 0
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul
      }
      mul *= 0x80
    
      if (val >= mul) val -= Math.pow(2, 8 * byteLength)
    
      return val
    }
    
    Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
      offset = offset >>> 0
      byteLength = byteLength >>> 0
      if (!noAssert) checkOffset(offset, byteLength, this.length)
    
      var i = byteLength
      var mul = 1
      var val = this[offset + --i]
      while (i > 0 && (mul *= 0x100)) {
        val += this[offset + --i] * mul
      }
      mul *= 0x80
    
      if (val >= mul) val -= Math.pow(2, 8 * byteLength)
    
      return val
    }
    
    Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 1, this.length)
      if (!(this[offset] & 0x80)) return (this[offset])
      return ((0xff - this[offset] + 1) * -1)
    }
    
    Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 2, this.length)
      var val = this[offset] | (this[offset + 1] << 8)
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    }
    
    Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 2, this.length)
      var val = this[offset + 1] | (this[offset] << 8)
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    }
    
    Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 4, this.length)
    
      return (this[offset]) |
        (this[offset + 1] << 8) |
        (this[offset + 2] << 16) |
        (this[offset + 3] << 24)
    }
    
    Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 4, this.length)
    
      return (this[offset] << 24) |
        (this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        (this[offset + 3])
    }
    
    Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 4, this.length)
      return ieee754.read(this, offset, true, 23, 4)
    }
    
    Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 4, this.length)
      return ieee754.read(this, offset, false, 23, 4)
    }
    
    Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 8, this.length)
      return ieee754.read(this, offset, true, 52, 8)
    }
    
    Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 8, this.length)
      return ieee754.read(this, offset, false, 52, 8)
    }
    
    function checkInt (buf, value, offset, ext, max, min) {
      if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
      if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
    }
    
    Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
      value = +value
      offset = offset >>> 0
      byteLength = byteLength >>> 0
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1
        checkInt(this, value, offset, byteLength, maxBytes, 0)
      }
    
      var mul = 1
      var i = 0
      this[offset] = value & 0xFF
      while (++i < byteLength && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF
      }
    
      return offset + byteLength
    }
    
    Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
      value = +value
      offset = offset >>> 0
      byteLength = byteLength >>> 0
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1
        checkInt(this, value, offset, byteLength, maxBytes, 0)
      }
    
      var i = byteLength - 1
      var mul = 1
      this[offset + i] = value & 0xFF
      while (--i >= 0 && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF
      }
    
      return offset + byteLength
    }
    
    Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
      this[offset] = (value & 0xff)
      return offset + 1
    }
    
    Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
      this[offset] = (value & 0xff)
      this[offset + 1] = (value >>> 8)
      return offset + 2
    }
    
    Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
      this[offset] = (value >>> 8)
      this[offset + 1] = (value & 0xff)
      return offset + 2
    }
    
    Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
      this[offset + 3] = (value >>> 24)
      this[offset + 2] = (value >>> 16)
      this[offset + 1] = (value >>> 8)
      this[offset] = (value & 0xff)
      return offset + 4
    }
    
    Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
      this[offset] = (value >>> 24)
      this[offset + 1] = (value >>> 16)
      this[offset + 2] = (value >>> 8)
      this[offset + 3] = (value & 0xff)
      return offset + 4
    }
    
    Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) {
        var limit = Math.pow(2, (8 * byteLength) - 1)
    
        checkInt(this, value, offset, byteLength, limit - 1, -limit)
      }
    
      var i = 0
      var mul = 1
      var sub = 0
      this[offset] = value & 0xFF
      while (++i < byteLength && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
          sub = 1
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
      }
    
      return offset + byteLength
    }
    
    Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) {
        var limit = Math.pow(2, (8 * byteLength) - 1)
    
        checkInt(this, value, offset, byteLength, limit - 1, -limit)
      }
    
      var i = byteLength - 1
      var mul = 1
      var sub = 0
      this[offset + i] = value & 0xFF
      while (--i >= 0 && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
          sub = 1
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
      }
    
      return offset + byteLength
    }
    
    Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
      if (value < 0) value = 0xff + value + 1
      this[offset] = (value & 0xff)
      return offset + 1
    }
    
    Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
      this[offset] = (value & 0xff)
      this[offset + 1] = (value >>> 8)
      return offset + 2
    }
    
    Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
      this[offset] = (value >>> 8)
      this[offset + 1] = (value & 0xff)
      return offset + 2
    }
    
    Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
      this[offset] = (value & 0xff)
      this[offset + 1] = (value >>> 8)
      this[offset + 2] = (value >>> 16)
      this[offset + 3] = (value >>> 24)
      return offset + 4
    }
    
    Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
      if (value < 0) value = 0xffffffff + value + 1
      this[offset] = (value >>> 24)
      this[offset + 1] = (value >>> 16)
      this[offset + 2] = (value >>> 8)
      this[offset + 3] = (value & 0xff)
      return offset + 4
    }
    
    function checkIEEE754 (buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
      if (offset < 0) throw new RangeError('Index out of range')
    }
    
    function writeFloat (buf, value, offset, littleEndian, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
      }
      ieee754.write(buf, value, offset, littleEndian, 23, 4)
      return offset + 4
    }
    
    Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert)
    }
    
    Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert)
    }
    
    function writeDouble (buf, value, offset, littleEndian, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
      }
      ieee754.write(buf, value, offset, littleEndian, 52, 8)
      return offset + 8
    }
    
    Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert)
    }
    
    Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert)
    }
    
    // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
    Buffer.prototype.copy = function copy (target, targetStart, start, end) {
      if (!start) start = 0
      if (!end && end !== 0) end = this.length
      if (targetStart >= target.length) targetStart = target.length
      if (!targetStart) targetStart = 0
      if (end > 0 && end < start) end = start
    
      // Copy 0 bytes; we're done
      if (end === start) return 0
      if (target.length === 0 || this.length === 0) return 0
    
      // Fatal error conditions
      if (targetStart < 0) {
        throw new RangeError('targetStart out of bounds')
      }
      if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
      if (end < 0) throw new RangeError('sourceEnd out of bounds')
    
      // Are we oob?
      if (end > this.length) end = this.length
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start
      }
    
      var len = end - start
      var i
    
      if (this === target && start < targetStart && targetStart < end) {
        // descending copy from end
        for (i = len - 1; i >= 0; --i) {
          target[i + targetStart] = this[i + start]
        }
      } else if (len < 1000) {
        // ascending copy from start
        for (i = 0; i < len; ++i) {
          target[i + targetStart] = this[i + start]
        }
      } else {
        Uint8Array.prototype.set.call(
          target,
          this.subarray(start, start + len),
          targetStart
        )
      }
    
      return len
    }
    
    // Usage:
    //    buffer.fill(number[, offset[, end]])
    //    buffer.fill(buffer[, offset[, end]])
    //    buffer.fill(string[, offset[, end]][, encoding])
    Buffer.prototype.fill = function fill (val, start, end, encoding) {
      // Handle string cases:
      if (typeof val === 'string') {
        if (typeof start === 'string') {
          encoding = start
          start = 0
          end = this.length
        } else if (typeof end === 'string') {
          encoding = end
          end = this.length
        }
        if (val.length === 1) {
          var code = val.charCodeAt(0)
          if (code < 256) {
            val = code
          }
        }
        if (encoding !== undefined && typeof encoding !== 'string') {
          throw new TypeError('encoding must be a string')
        }
        if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
          throw new TypeError('Unknown encoding: ' + encoding)
        }
      } else if (typeof val === 'number') {
        val = val & 255
      }
    
      // Invalid ranges are not set to a default, so can range check early.
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError('Out of range index')
      }
    
      if (end <= start) {
        return this
      }
    
      start = start >>> 0
      end = end === undefined ? this.length : end >>> 0
    
      if (!val) val = 0
    
      var i
      if (typeof val === 'number') {
        for (i = start; i < end; ++i) {
          this[i] = val
        }
      } else {
        var bytes = Buffer.isBuffer(val)
          ? val
          : new Buffer(val, encoding)
        var len = bytes.length
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len]
        }
      }
    
      return this
    }
    
    // HELPER FUNCTIONS
    // ================
    
    var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g
    
    function base64clean (str) {
      // Node strips out invalid characters like \n and \t from the string, base64-js does not
      str = str.trim().replace(INVALID_BASE64_RE, '')
      // Node converts strings with length < 2 to ''
      if (str.length < 2) return ''
      // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
      while (str.length % 4 !== 0) {
        str = str + '='
      }
      return str
    }
    
    function toHex (n) {
      if (n < 16) return '0' + n.toString(16)
      return n.toString(16)
    }
    
    function utf8ToBytes (string, units) {
      units = units || Infinity
      var codePoint
      var length = string.length
      var leadSurrogate = null
      var bytes = []
    
      for (var i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i)
    
        // is surrogate component
        if (codePoint > 0xD7FF && codePoint < 0xE000) {
          // last char was a lead
          if (!leadSurrogate) {
            // no lead yet
            if (codePoint > 0xDBFF) {
              // unexpected trail
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
              continue
            } else if (i + 1 === length) {
              // unpaired lead
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
              continue
            }
    
            // valid lead
            leadSurrogate = codePoint
    
            continue
          }
    
          // 2 leads in a row
          if (codePoint < 0xDC00) {
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
            leadSurrogate = codePoint
            continue
          }
    
          // valid surrogate pair
          codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
        } else if (leadSurrogate) {
          // valid bmp char, but last char was a lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        }
    
        leadSurrogate = null
    
        // encode utf8
        if (codePoint < 0x80) {
          if ((units -= 1) < 0) break
          bytes.push(codePoint)
        } else if (codePoint < 0x800) {
          if ((units -= 2) < 0) break
          bytes.push(
            codePoint >> 0x6 | 0xC0,
            codePoint & 0x3F | 0x80
          )
        } else if (codePoint < 0x10000) {
          if ((units -= 3) < 0) break
          bytes.push(
            codePoint >> 0xC | 0xE0,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          )
        } else if (codePoint < 0x110000) {
          if ((units -= 4) < 0) break
          bytes.push(
            codePoint >> 0x12 | 0xF0,
            codePoint >> 0xC & 0x3F | 0x80,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          )
        } else {
          throw new Error('Invalid code point')
        }
      }
    
      return bytes
    }
    
    function asciiToBytes (str) {
      var byteArray = []
      for (var i = 0; i < str.length; ++i) {
        // Node's code seems to be doing this and not & 0x7F..
        byteArray.push(str.charCodeAt(i) & 0xFF)
      }
      return byteArray
    }
    
    function utf16leToBytes (str, units) {
      var c, hi, lo
      var byteArray = []
      for (var i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0) break
    
        c = str.charCodeAt(i)
        hi = c >> 8
        lo = c % 256
        byteArray.push(lo)
        byteArray.push(hi)
      }
    
      return byteArray
    }
    
    function base64ToBytes (str) {
      return base64.toByteArray(base64clean(str))
    }
    
    function blitBuffer (src, dst, offset, length) {
      for (var i = 0; i < length; ++i) {
        if ((i + offset >= dst.length) || (i >= src.length)) break
        dst[i + offset] = src[i]
      }
      return i
    }
    
    // Node 0.10 supports `ArrayBuffer` but lacks `ArrayBuffer.isView`
    function isArrayBufferView (obj) {
      return (typeof ArrayBuffer.isView === 'function') && ArrayBuffer.isView(obj)
    }
    
    function numberIsNaN (obj) {
      return obj !== obj // eslint-disable-line no-self-compare
    }
    
    },{"base64-js":26,"ieee754":28}],28:[function(require,module,exports){
    exports.read = function (buffer, offset, isLE, mLen, nBytes) {
      var e, m
      var eLen = nBytes * 8 - mLen - 1
      var eMax = (1 << eLen) - 1
      var eBias = eMax >> 1
      var nBits = -7
      var i = isLE ? (nBytes - 1) : 0
      var d = isLE ? -1 : 1
      var s = buffer[offset + i]
    
      i += d
    
      e = s & ((1 << (-nBits)) - 1)
      s >>= (-nBits)
      nBits += eLen
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
    
      m = e & ((1 << (-nBits)) - 1)
      e >>= (-nBits)
      nBits += mLen
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
    
      if (e === 0) {
        e = 1 - eBias
      } else if (e === eMax) {
        return m ? NaN : ((s ? -1 : 1) * Infinity)
      } else {
        m = m + Math.pow(2, mLen)
        e = e - eBias
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
    }
    
    exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c
      var eLen = nBytes * 8 - mLen - 1
      var eMax = (1 << eLen) - 1
      var eBias = eMax >> 1
      var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
      var i = isLE ? 0 : (nBytes - 1)
      var d = isLE ? 1 : -1
      var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0
    
      value = Math.abs(value)
    
      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0
        e = eMax
      } else {
        e = Math.floor(Math.log(value) / Math.LN2)
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--
          c *= 2
        }
        if (e + eBias >= 1) {
          value += rt / c
        } else {
          value += rt * Math.pow(2, 1 - eBias)
        }
        if (value * c >= 2) {
          e++
          c /= 2
        }
    
        if (e + eBias >= eMax) {
          m = 0
          e = eMax
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen)
          e = e + eBias
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
          e = 0
        }
      }
    
      for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}
    
      e = (e << mLen) | m
      eLen += mLen
      for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}
    
      buffer[offset + i - d] |= s * 128
    }
    
    },{}],29:[function(require,module,exports){
    (function (process){
    // Copyright Joyent, Inc. and other Node contributors.
    //
    // Permission is hereby granted, free of charge, to any person obtaining a
    // copy of this software and associated documentation files (the
    // "Software"), to deal in the Software without restriction, including
    // without limitation the rights to use, copy, modify, merge, publish,
    // distribute, sublicense, and/or sell copies of the Software, and to permit
    // persons to whom the Software is furnished to do so, subject to the
    // following conditions:
    //
    // The above copyright notice and this permission notice shall be included
    // in all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
    // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
    // USE OR OTHER DEALINGS IN THE SOFTWARE.
    
    // resolves . and .. elements in a path array with directory names there
    // must be no slashes, empty elements, or device names (c:\) in the array
    // (so also no leading and trailing slashes - it does not distinguish
    // relative and absolute paths)
    function normalizeArray(parts, allowAboveRoot) {
      // if the path tries to go above the root, `up` ends up > 0
      var up = 0;
      for (var i = parts.length - 1; i >= 0; i--) {
        var last = parts[i];
        if (last === '.') {
          parts.splice(i, 1);
        } else if (last === '..') {
          parts.splice(i, 1);
          up++;
        } else if (up) {
          parts.splice(i, 1);
          up--;
        }
      }
    
      // if the path is allowed to go above the root, restore leading ..s
      if (allowAboveRoot) {
        for (; up--; up) {
          parts.unshift('..');
        }
      }
    
      return parts;
    }
    
    // Split a filename into [root, dir, basename, ext], unix version
    // 'root' is just a slash, or nothing.
    var splitPathRe =
        /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
    var splitPath = function(filename) {
      return splitPathRe.exec(filename).slice(1);
    };
    
    // path.resolve([from ...], to)
    // posix version
    exports.resolve = function() {
      var resolvedPath = '',
          resolvedAbsolute = false;
    
      for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
        var path = (i >= 0) ? arguments[i] : process.cwd();
    
        // Skip empty and invalid entries
        if (typeof path !== 'string') {
          throw new TypeError('Arguments to path.resolve must be strings');
        } else if (!path) {
          continue;
        }
    
        resolvedPath = path + '/' + resolvedPath;
        resolvedAbsolute = path.charAt(0) === '/';
      }
    
      // At this point the path should be resolved to a full absolute path, but
      // handle relative paths to be safe (might happen when process.cwd() fails)
    
      // Normalize the path
      resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
        return !!p;
      }), !resolvedAbsolute).join('/');
    
      return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
    };
    
    // path.normalize(path)
    // posix version
    exports.normalize = function(path) {
      var isAbsolute = exports.isAbsolute(path),
          trailingSlash = substr(path, -1) === '/';
    
      // Normalize the path
      path = normalizeArray(filter(path.split('/'), function(p) {
        return !!p;
      }), !isAbsolute).join('/');
    
      if (!path && !isAbsolute) {
        path = '.';
      }
      if (path && trailingSlash) {
        path += '/';
      }
    
      return (isAbsolute ? '/' : '') + path;
    };
    
    // posix version
    exports.isAbsolute = function(path) {
      return path.charAt(0) === '/';
    };
    
    // posix version
    exports.join = function() {
      var paths = Array.prototype.slice.call(arguments, 0);
      return exports.normalize(filter(paths, function(p, index) {
        if (typeof p !== 'string') {
          throw new TypeError('Arguments to path.join must be strings');
        }
        return p;
      }).join('/'));
    };
    
    
    // path.relative(from, to)
    // posix version
    exports.relative = function(from, to) {
      from = exports.resolve(from).substr(1);
      to = exports.resolve(to).substr(1);
    
      function trim(arr) {
        var start = 0;
        for (; start < arr.length; start++) {
          if (arr[start] !== '') break;
        }
    
        var end = arr.length - 1;
        for (; end >= 0; end--) {
          if (arr[end] !== '') break;
        }
    
        if (start > end) return [];
        return arr.slice(start, end - start + 1);
      }
    
      var fromParts = trim(from.split('/'));
      var toParts = trim(to.split('/'));
    
      var length = Math.min(fromParts.length, toParts.length);
      var samePartsLength = length;
      for (var i = 0; i < length; i++) {
        if (fromParts[i] !== toParts[i]) {
          samePartsLength = i;
          break;
        }
      }
    
      var outputParts = [];
      for (var i = samePartsLength; i < fromParts.length; i++) {
        outputParts.push('..');
      }
    
      outputParts = outputParts.concat(toParts.slice(samePartsLength));
    
      return outputParts.join('/');
    };
    
    exports.sep = '/';
    exports.delimiter = ':';
    
    exports.dirname = function(path) {
      var result = splitPath(path),
          root = result[0],
          dir = result[1];
    
      if (!root && !dir) {
        // No dirname whatsoever
        return '.';
      }
    
      if (dir) {
        // It has a dirname, strip trailing slash
        dir = dir.substr(0, dir.length - 1);
      }
    
      return root + dir;
    };
    
    
    exports.basename = function(path, ext) {
      var f = splitPath(path)[2];
      // TODO: make this comparison case-insensitive on windows?
      if (ext && f.substr(-1 * ext.length) === ext) {
        f = f.substr(0, f.length - ext.length);
      }
      return f;
    };
    
    
    exports.extname = function(path) {
      return splitPath(path)[3];
    };
    
    function filter (xs, f) {
        if (xs.filter) return xs.filter(f);
        var res = [];
        for (var i = 0; i < xs.length; i++) {
            if (f(xs[i], i, xs)) res.push(xs[i]);
        }
        return res;
    }
    
    // String.prototype.substr - negative index don't work in IE8
    var substr = 'ab'.substr(-1) === 'b'
        ? function (str, start, len) { return str.substr(start, len) }
        : function (str, start, len) {
            if (start < 0) start = str.length + start;
            return str.substr(start, len);
        }
    ;
    
    }).call(this,require('_process'))
    },{"_process":30}],30:[function(require,module,exports){
    // shim for using process in browser
    var process = module.exports = {};
    
    // cached from whatever global is present so that test runners that stub it
    // don't break things.  But we need to wrap it in a try catch in case it is
    // wrapped in strict mode code which doesn't define any globals.  It's inside a
    // function because try/catches deoptimize in certain engines.
    
    var cachedSetTimeout;
    var cachedClearTimeout;
    
    function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
    }
    function defaultClearTimeout () {
        throw new Error('clearTimeout has not been defined');
    }
    (function () {
        try {
            if (typeof setTimeout === 'function') {
                cachedSetTimeout = setTimeout;
            } else {
                cachedSetTimeout = defaultSetTimout;
            }
        } catch (e) {
            cachedSetTimeout = defaultSetTimout;
        }
        try {
            if (typeof clearTimeout === 'function') {
                cachedClearTimeout = clearTimeout;
            } else {
                cachedClearTimeout = defaultClearTimeout;
            }
        } catch (e) {
            cachedClearTimeout = defaultClearTimeout;
        }
    } ())
    function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
            //normal enviroments in sane situations
            return setTimeout(fun, 0);
        }
        // if setTimeout wasn't available but was latter defined
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
            cachedSetTimeout = setTimeout;
            return setTimeout(fun, 0);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedSetTimeout(fun, 0);
        } catch(e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                return cachedSetTimeout.call(null, fun, 0);
            } catch(e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                return cachedSetTimeout.call(this, fun, 0);
            }
        }
    
    
    }
    function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
            //normal enviroments in sane situations
            return clearTimeout(marker);
        }
        // if clearTimeout wasn't available but was latter defined
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
            cachedClearTimeout = clearTimeout;
            return clearTimeout(marker);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedClearTimeout(marker);
        } catch (e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                return cachedClearTimeout.call(null, marker);
            } catch (e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                return cachedClearTimeout.call(this, marker);
            }
        }
    
    
    
    }
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;
    
    function cleanUpNextTick() {
        if (!draining || !currentQueue) {
            return;
        }
        draining = false;
        if (currentQueue.length) {
            queue = currentQueue.concat(queue);
        } else {
            queueIndex = -1;
        }
        if (queue.length) {
            drainQueue();
        }
    }
    
    function drainQueue() {
        if (draining) {
            return;
        }
        var timeout = runTimeout(cleanUpNextTick);
        draining = true;
    
        var len = queue.length;
        while(len) {
            currentQueue = queue;
            queue = [];
            while (++queueIndex < len) {
                if (currentQueue) {
                    currentQueue[queueIndex].run();
                }
            }
            queueIndex = -1;
            len = queue.length;
        }
        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
    }
    
    process.nextTick = function (fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
                args[i - 1] = arguments[i];
            }
        }
        queue.push(new Item(fun, args));
        if (queue.length === 1 && !draining) {
            runTimeout(drainQueue);
        }
    };
    
    // v8 likes predictible objects
    function Item(fun, array) {
        this.fun = fun;
        this.array = array;
    }
    Item.prototype.run = function () {
        this.fun.apply(null, this.array);
    };
    process.title = 'browser';
    process.browser = true;
    process.env = {};
    process.argv = [];
    process.version = ''; // empty string to avoid regexp issues
    process.versions = {};
    
    function noop() {}
    
    process.on = noop;
    process.addListener = noop;
    process.once = noop;
    process.off = noop;
    process.removeListener = noop;
    process.removeAllListeners = noop;
    process.emit = noop;
    process.prependListener = noop;
    process.prependOnceListener = noop;
    
    process.listeners = function (name) { return [] }
    
    process.binding = function (name) {
        throw new Error('process.binding is not supported');
    };
    
    process.cwd = function () { return '/' };
    process.chdir = function (dir) {
        throw new Error('process.chdir is not supported');
    };
    process.umask = function() { return 0; };
    
    },{}]},{},[1]);
    