import SpruceTemplate from 'spruce-template';
import fs from 'fs-extra';
import path from 'path';
import escape from 'escape-html';


function readTemplate(fileName) {
  var filePath = path.resolve(__dirname, `./template/${fileName}`);
  return fs.readFileSync(filePath, {encoding: 'utf-8'});
}

function writeHTML(config, fileName, html) {
  var filePath = path.resolve(config.destination, fileName);
  fs.writeFileSync(filePath, html, {encoding: 'utf-8'});
}

function find(data, cond) {
  return data(cond).map(v => v);
}

function shorten(desc) {
  if (!desc) return '';

  var len = desc.length;
  var inSQuote = false;
  var inWQuote = false;
  var inCode = false;
  for (var i = 0; i < desc.length; i++) {
    var char1 = desc.charAt(i);
    var char4 = desc.substr(i, 6);
    var char5 = desc.substr(i, 7);
    if (char1 === "'") inSQuote = !inSQuote;
    else if (char1 === '"') inWQuote = !inWQuote;
    else if (char4 === '<code>') inCode = true;
    else if (char5 === '</code>') inCode = false;

    if (inSQuote || inCode || inWQuote) continue;

    if (char1 === '.' || char1 === '\n') {
      len = i + 1;
      break;
    }
  }

  return desc.substr(0, len);
}

function getPackageObject(filePath) {
  var json = fs.readFileSync(filePath, {encoding: 'utf-8'});
  return JSON.parse(json);
}

function buildNav(data) {
  var html = readTemplate('nav.html');
  var s = new SpruceTemplate(html);

  // classes
  var classDocs = find(data, {kind: 'class'});
  s.loop('classDoc', classDocs, (i, classDoc, s)=>{
    s.text('className', classDoc.name);
    s.attr('className', 'href', `./${classDoc.longname}.html`)
  });

  // namespaces
  var namespaceDocs = find(data, {kind: 'namespace'});
  var globalNamespaceDoc = getGlobalNamespaceDoc(data);
  if (globalNamespaceDoc) {
    namespaceDocs.unshift(globalNamespaceDoc);
  }
  s.loop('namespaceDoc', namespaceDocs, (i, namespaceDoc, s)=>{
    s.text('namespace', namespaceDoc.longname);
    s.attr('namespace', 'href', `${namespaceDoc.longname}.html`);
  });

  return s.html;
}

function buildIndex(data, options) {
  var packageObj = getPackageObject(options.package);
  var title = options.template.title || packageObj.name;
  var desc = options.template.description || packageObj.description;
  var version = options.template.version || packageObj.version;
  var url = options.url || packageObj.repository.url;
  var classDocs = find(data, {kind: 'class'});
  var namespaceDocs = find(data, {kind: 'namespace'});
  var globalNamespaceDoc = getGlobalNamespaceDoc(data);
  if (globalNamespaceDoc) {
    namespaceDocs.unshift(globalNamespaceDoc);
  }

  var s = new SpruceTemplate(readTemplate('index.html'));

  s.text('title', title);
  s.text('version', version);
  s.text('url', url);
  s.attr('url', 'href', url);
  s.text('description', desc);
  s.load('summaryClassDocs', buildSummaryClasses(classDocs));
  s.load('summaryNamespaceDocs', buildSummaryNamespaces(namespaceDocs));

  return s.html;
}

function buildReadme(options) {
  var html = readTemplate('readme.html');
  var s = new SpruceTemplate(html);
  s.load('readme', options.readme);
  return s.html;
}

function buildClass(clazz, data) {
  var staticMemberDocs = find(data, {kind: 'member', memberof: clazz.longname, scope: 'static'});
  var staticMethodDocs = find(data, {kind: 'function', memberof: clazz.longname, scope: 'static'});
  var memberDocs = find(data, {kind: 'member', memberof: clazz.longname, scope: 'instance'});
  var methodDocs = find(data, {kind: 'function', memberof: clazz.longname, scope: 'instance'});

  var s = new SpruceTemplate(readTemplate('class.html'));

  s.text('nameSpace', clazz.memberof);
  s.text('className', clazz.name);
  s.load('classDesc', clazz.classdesc);
  s.text('fileexampleCode', clazz.fileexample);
  s.drop('fileexampleDoc', !clazz.fileexample);

  s.load('summaryStaticMembers', buildSummaryMembers(staticMemberDocs, 'Static Members'));
  s.load('summaryStaticMethods', buildSummaryFunctions(staticMethodDocs, 'Static Methods'));
  s.load('summaryConstructor', buildSummaryFunctions([clazz], 'Constructor'));
  s.load('summaryMembers', buildSummaryMembers(memberDocs, 'Members'));
  s.load('summaryMethods', buildSummaryFunctions(methodDocs, 'Methods'));

  s.drop('staticMembersTitle', !staticMemberDocs.length);
  s.load('staticMembers', buildMembers(staticMemberDocs));

  s.drop('staticMethodsTitle', !staticMethodDocs.length);
  s.load('staticMethods', buildFunctions(staticMethodDocs));

  s.load('constructor', buildFunctions([clazz]));

  s.drop('membersTitle', !memberDocs.length);
  s.load('members', buildMembers(memberDocs));

  s.drop('methodsTitle', !methodDocs.length);
  s.load('methods', buildFunctions(methodDocs));

  return s.html;
}

function buildNamespace(namespaceDoc, data) {
  if (namespaceDoc.longname === '@global') {
    var memberof = {isUndefined: true};
  } else {
    var memberof = namespaceDoc.longname;
  }
  var namespaceDocs = find(data, {kind: 'namespace', memberof});
  var functionDocs = find(data, {kind: 'function', memberof});
  var memberDocs = find(data, {kind: 'member', memberof});
  var classDocs = find(data, {kind: 'class', memberof});

  var s = new SpruceTemplate(readTemplate('namespace.html'));

  s.text('parentNamespace', namespaceDoc.namespace);
  s.text('namespace', namespaceDoc.longname);
  s.load('namespaceDesc', namespaceDoc.description);
  s.text('fileexampleCode', namespaceDoc.fileexample);
  s.drop('fileexampleDoc', !namespaceDoc.fileexample);

  s.load('summaryClassDocs', buildSummaryClasses(classDocs));
  s.load('summaryMemberDocs', buildSummaryMembers(memberDocs, 'Members'));
  s.load('summaryFunctionDocs', buildSummaryFunctions(functionDocs, 'Functions'));
  s.load('summaryNamespaceDocs', buildSummaryNamespaces(namespaceDocs, 'Namespaces'));
  s.load('memberDocs', buildMembers(memberDocs));
  s.load('functionDocs', buildFunctions(functionDocs));

  return s.html;
}

function buildSummaryMembers(memberDocs = [], title = 'Members') {
  if (memberDocs.length === 0) return '';

  var s = new SpruceTemplate(readTemplate('summary.html'));

  s.text('title', title);
  s.loop('target', memberDocs, (i, memberDoc, s)=>{
    s.load('name', buildDocLink(memberDoc.name, memberDoc.name, {inner: true}));
    s.load('signature', buildVariableSignature(memberDoc));
    s.load('description', shorten(memberDoc.description));
  });

  return s.html;
}

function buildSummaryFunctions(functionDocs = [], title = 'Functions') {
  if (functionDocs.length === 0) return '';

  var s = new SpruceTemplate(readTemplate('summary.html'));

  s.text('title', title);
  s.loop('target', functionDocs, (i, functionDoc, s)=>{
    s.load('name', buildDocLink(functionDoc.name, functionDoc.name, {inner: true}));
    s.load('signature', buildFunctionSignature(functionDoc));
    s.load('description', shorten(functionDoc.description));
  });

  return s.html;
}

function buildSummaryClasses(classDocs = [], innerLink = false) {
  if (classDocs.length === 0) return '';

  var s = new SpruceTemplate(readTemplate('summary.html'));

  s.text('title', 'Classes');
  s.loop('target', classDocs, (i, classDoc, s)=>{
    s.load('name', buildDocLink(classDoc.longname, classDoc.name, {inner: innerLink}));
    s.load('signature', buildFunctionSignature(classDoc));
    s.load('description', shorten(classDoc.description));
  });

  return s.html;
}

function buildSummaryNamespaces(namespaceDocs = []) {
  if (namespaceDocs.length === 0) return '';

  var s = new SpruceTemplate(readTemplate('summary.html'));

  s.text('title', 'Namespaces');
  s.loop('target', namespaceDocs, (i, namespaceDoc, s)=>{
    s.load('name', buildDocLink(namespaceDoc.longname, namespaceDoc.name, {inner: false}));
    s.drop('signature');
    s.load('description', shorten(namespaceDoc.description));
  });

  return s.html;
}

// kind = function
function buildFunctions(functionDocs) {
  var s = new SpruceTemplate(readTemplate('methods.html'));

  s.loop('method', functionDocs, (i, functionDoc, s)=>{
    s.attr('anchor', 'id', functionDoc.name);
    s.text('name', functionDoc.name);
    s.load('signature', buildFunctionSignature(functionDoc));
    s.load('description', functionDoc.description);

    // params
    s.loop('param', functionDoc.params, (i, param, s)=>{
      s.autoDrop = false;
      s.attr('param', 'data-depth', param.name.split('.').length - 1);
      s.text('name', param.name);
      s.attr('name', 'data-depth', param.name.split('.').length - 1);
      s.load('description', param.description);

      var typeNames = [];
      for (var typeName of param.type.names) {
        typeNames.push(buildDocLink(typeName));
      }
      s.load('type', typeNames.join(' | '));

      var appendix = [];
      if (param.optional) {
        appendix.push('optional');
      }
      s.text('appendix', appendix.join(', '));
    });

    if (!functionDoc.params) {
      s.drop('argumentParams');
    }

    // return
    if (functionDoc.returns) {
      s.load('returnDescription', functionDoc.returns[0].description);
      var typeNames = [];
      for (var typeName of functionDoc.returns[0].type.names) {
        typeNames.push(buildDocLink(typeName));
      }
      s.load('returnType', typeNames.join(' | '));
    } else {
      s.drop('returnParams');
    }

    // example
    var exampleDocs = functionDoc.examples;
    s.loop('exampleDoc', exampleDocs, (i, exampleDoc, s)=>{
      s.text('exampleCode', exampleDoc);
    });
    if (!exampleDocs) {
      s.drop('example');
    }
  });

  return s.html;
}

// kind = member
function buildMembers(memberDocs) {
  var s = new SpruceTemplate(readTemplate('members.html'));

  s.loop('member', memberDocs, (i, memberDoc, s)=>{
    s.attr('anchor', 'id', memberDoc.name);
    s.text('name', memberDoc.name);
    s.load('signature', buildVariableSignature(memberDoc));
    s.load('description', memberDoc.description);

    // example
    var exampleDocs = memberDoc.examples;
    s.loop('exampleDoc', exampleDocs, (i, exampleDoc, s)=>{
      s.text('exampleCode', exampleDoc);
    });
    if (!exampleDocs) {
      s.drop('example');
    }
  });

  return s.html;
}

function buildDocLink(longname, text = longname, {inner} = {}) {
  text = escape(text);

  if (inner) {
    return `<span><a href=#${longname}>${text}</a></span>`;
  }

  if (longname === '@global') {
    return `<span><a href="@global.html">@global</a></span>`;
  }

  var result = find(ENV.data, {longname});
  if (result && result.length === 1) {
    return `<span><a href="${longname}.html">${text}</a></span>`;
  } else {
    var result = find(ENV.data, {name: longname});
    if (result && result.length) {
      return `<span><a href="${result[0].longname}.html">${text}</a></span>`;
    } else {
      return `<span>${text}</span>`;
    }
  }
}

function buildFunctionSignature(functionDoc) {
  var params = functionDoc.params || [];
  var signatures = [];
  for (var param of params) {
    var paramName = param.name;
    if (paramName.indexOf('.') !== -1) continue;

    var types = [];
    for (var typeName of param.type.names) {
      types.push(buildDocLink(typeName, typeName));
    }

    signatures.push(`${paramName}: ${types.join(' | ')}`);
  }

  var returnSignatures = [];
  if (functionDoc.returns) {
    for (var typeName of functionDoc.returns[0].type.names) {
      returnSignatures.push(buildDocLink(typeName, typeName));
    }
  }

  if (returnSignatures.length) {
    return '(' + signatures.join(', ') + '): ' + returnSignatures.join(' | ');
  } else {
    return '(' + signatures.join(', ') + ')';
  }
}

function buildVariableSignature(propRecord) {
  var types = [];
  for (var typeName of propRecord.type.names) {
    types.push(buildDocLink(typeName, typeName));
  }

  return ': ' + types.join(', ');
}

function link(str) {
  if (!str) return str;

  return str.replace(/\{@link ([\w\#_\-.]+)}/g, (str, cap)=>{
    var temp = cap.split('#'); // cap = HogeFoo#bar
    var text = temp[0].split('.').reverse()[0];
    temp[0] += '.html';
    return `<a href="${temp.join('#')}">${cap}</a>`;
  });
}

function resolveLink(data) {
  data().each((v)=>{
    v.description = link(v.description);

    if (v.params) {
      for (var param of v.params) {
        param.description = link(param.description);
      }
    }

    if (v.returns) {
      for (var returnParam of v.returns) {
        returnParam.description = link(returnParam.description);
      }
    }
  });
}

function resolveFileExample(data) {
  var docs = find(data, [{kind: 'class'}, {kind: 'namespace'}]);
  for (var doc of docs) {
    var matched = doc.comment.match(/^\s*\*\s@fileexample((?:.|\n)*?)\n\s*\*(?:(?:\s@[a-z])|[/])/m);
    if (matched && matched[1]) {
      var lines = [];
      for (var temp of matched[1].split('\n')) {
        if (!temp) continue;
        temp = temp.replace(/^\s*\*? ?/, '');
        lines.push(temp);
      }
      doc.fileexample = lines.join('\n');
    }
  }
}

function getGlobalNamespaceDoc(data) {
  if (find(data, {memberof: {isUndefined: true}}).length) {
    return {longname: '@global', name: '@global', kind: 'namespace', description: 'global object.'};
  }

  return null;
}

var ENV = {} ;

/**
 * @param {TaffyDB} data see http://www.taffydb.com/
 * @param config
 * @param tutorials
 */
exports.publish = function(data, config, tutorials) {
  ENV.data = data;
  ENV.config = config;

  resolveLink(data);
  resolveFileExample(data);

  var s = new SpruceTemplate(readTemplate('layout.html'), {autoClose: false});
  s.text('date', new Date().toString());
  s.load('nav', buildNav(data));

  // index.html
  s.load('content', buildIndex(data, config));
  writeHTML(config, 'index.html', s.html);

  // readme.html
  s.load('content', buildReadme(config));
  writeHTML(config, 'readme.html', s.html);

  // classes
  //var classes = find(data, {kind: 'class', name: 'ReadableStream'});
  //var classHTML = buildClass(classes[0], data);
  //s.load('content', classHTML);
  //writeHTML(config, `${classes[0].longname}.html`, s.html);

  // namespaces
  var namespaceDocs = find(data, {kind: 'namespace'});
  var globalNamespaceDoc = getGlobalNamespaceDoc(data);
  if (globalNamespaceDoc) namespaceDocs.unshift(globalNamespaceDoc);
  for (var namespaceDoc of namespaceDocs) {
    var namespaceHTML = buildNamespace(namespaceDoc, data);
    s.load('content', namespaceHTML);
    writeHTML(config, `${namespaceDoc.longname}.html`, s.html);
  }

  var classes = find(data, {kind: 'class'});
  for (var clazz of classes) {
    var classHTML = buildClass(clazz, data);
    s.load('content', classHTML);
    writeHTML(config, `${clazz.longname}.html`, s.html);
  }


  // copy css and script
  fs.copySync(path.resolve(__dirname, './template/css'), path.resolve(config.destination, './css'))
  fs.copySync(path.resolve(__dirname, './template/script'), path.resolve(config.destination, './script'))
};
