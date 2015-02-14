import SpruceTemplate from 'spruce-template';
import fs from 'fs-extra';
import path from 'path';

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
  var myClasses = [];
  data({kind: 'class'}).each(v=> myClasses.push(v));

  var html = readTemplate('nav.html');
  var s = new SpruceTemplate(html);
  s.loop('classNames', myClasses, (i, myClass, s)=>{
    s.text('className', myClass.name);
    s.attr('className', 'href', `./${myClass.longname}.html`)
  });

  return s.html;
}

function buildIndex(options) {
  var html = readTemplate('index.html');
  var s = new SpruceTemplate(html);

  if (options.package) {
    var packageObj = getPackageObject(options.package);
    s.text('repo', packageObj.repository.url);
    s.attr('repo', 'href', packageObj.repository.url);
  } else {
    s.drop('package');
  }

  if (options.readme) {
    s.load('readme', options.readme);
  } else {
    s.drop('readme');
  }

  return s.html;
}

function buildSummaryConstructor(clazz) {
  var s = new SpruceTemplate(readTemplate('summary.html'));
  s.text('title', 'Constructor');
  s.load('name', buildDocLink(clazz.longname, clazz.name, {inner: true}));
  s.load('signature', buildFunctionSignature(clazz));
  s.load('description', shorten(clazz.description));

  return s.close().html;
}

function buildSummaryMembers(clazz) {
  var s = new SpruceTemplate(readTemplate('summary.html'));
  var members = find(ENV.data, {kind: 'member', memberof: clazz.longname});

  s.text('title', 'Members');
  s.loop('target', members, (i, member, s)=>{
    s.load('name', buildDocLink(member.longname, member.name, {inner: true}));
    s.load('signature', buildVariableSignature(member));
    s.load('description', shorten(member.description));
  });

  return s.close().html;
}

function buildSummaryMethods(clazz) {
  var s = new SpruceTemplate(readTemplate('summary.html'));
  var methods = find(ENV.data, {kind: 'function', memberof: clazz.longname});

  s.text('title', 'Methods');
  s.loop('target', methods, (i, method, s)=>{
    s.load('name', buildDocLink(method.longname, method.name, {inner: true}));
    s.load('signature', buildFunctionSignature(method));
    s.load('description', shorten(method.description));
  });

  return s.close().html;
}

function buildClass(clazz, data) {
  var s = new SpruceTemplate(readTemplate('class.html'));

  s.text('nameSpace', clazz.memberof);
  s.text('className', clazz.name);
  s.load('classDesc', clazz.classdesc);

  var summaryConstructorHTML = buildSummaryConstructor(clazz);
  s.load('summaryConstructor', summaryConstructorHTML);

  var summaryMembersHTML = buildSummaryMembers(clazz);
  s.load('summaryMembers', summaryMembersHTML);

  var summaryMethodsHTML = buildSummaryMethods(clazz);
  s.load('summaryMethods', summaryMethodsHTML);

  //data({memberof: clazz.longname}).each(v=> console.log(v.name)) ;
  //data({longname: clazz.longname}).each(v=> console.log(v)) ;
  //console.log(find(data, {memberof: clazz.longname}));
  //console.log(clazz);

  //console.log(JSON.stringify(clazz.params, null, 2));

  return s.close().html;
}

function buildDocLink(longname, text, {inner} = {}) {
  if (inner) {
    return `<span><a href=#${longname}>${text}</a></span>`;
  }

  var result = find(ENV.data, {longname});
  if (result && result.length === 1) {
    return `<span><a href=${longname}.html>${text}</a></span>`;
  } else {
    var result = find(ENV.data, {name: longname});
    if (result && result.length) {
      return `<span><a href=${result[0].longname}.html>${text}</a></span>`;
    } else {
      return `<span>${text}</span>`;
    }
  }
}

function buildFunctionSignature(funcRecord) {
  var params = funcRecord.params || [];
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
  if (funcRecord.returns) {
    for (var typeName of funcRecord.returns[0].type.names) {
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

var ENV = {} ;

exports.publish = function(data, config, tutorials) {
  ENV.data = data;
  ENV.config = config;

  var navHTML = buildNav(data);
  var indexHTML = buildIndex(config);

  var layoutHTML = readTemplate('layout.html');
  var s = new SpruceTemplate(layoutHTML);
  s.text('date', new Date().toString());
  s.load('nav', navHTML);
  s.load('content', indexHTML);
  writeHTML(config, 'index.html', s.html);

  var classes = find(data, {kind: 'class', name: 'ReadableStream'});
  var classHTML = buildClass(classes[0], data);
  //var s = new SpruceTemplate(layoutHTML);
  //s.load('nav', navHTML);
  s.load('content', classHTML);
  //s.close();
  writeHTML(config, `${classes[0].longname}.html`, s.html);


  // copy css
  //var dest = path.resolve(config.destination, './css');
  //fs.rmdirSync(dest);
  //copyDir(path.resolve(__dirname, './template/css'), dest);
  fs.copySync(path.resolve(__dirname, './template/css'), path.resolve(config.destination, './css'))
  fs.copySync(path.resolve(__dirname, './template/script'), path.resolve(config.destination, './script'))
};
