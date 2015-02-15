"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var SpruceTemplate = _interopRequire(require("spruce-template"));

var fs = _interopRequire(require("fs-extra"));

var path = _interopRequire(require("path"));

var escape = _interopRequire(require("escape-html"));




function readTemplate(fileName) {
  var filePath = path.resolve(__dirname, "./template/" + fileName);
  return fs.readFileSync(filePath, { encoding: "utf-8" });
}

function writeHTML(config, fileName, html) {
  var filePath = path.resolve(config.destination, fileName);
  fs.writeFileSync(filePath, html, { encoding: "utf-8" });
}

function find(data, cond) {
  return data(cond).map(function (v) {
    return v;
  });
}

function shorten(desc) {
  if (!desc) return "";

  var len = desc.length;
  var inSQuote = false;
  var inWQuote = false;
  var inCode = false;
  for (var i = 0; i < desc.length; i++) {
    var char1 = desc.charAt(i);
    var char4 = desc.substr(i, 6);
    var char5 = desc.substr(i, 7);
    if (char1 === "'") inSQuote = !inSQuote;else if (char1 === "\"") inWQuote = !inWQuote;else if (char4 === "<code>") inCode = true;else if (char5 === "</code>") inCode = false;

    if (inSQuote || inCode || inWQuote) continue;

    if (char1 === "." || char1 === "\n") {
      len = i + 1;
      break;
    }
  }

  return desc.substr(0, len);
}

function getPackageObject(filePath) {
  var json = fs.readFileSync(filePath, { encoding: "utf-8" });
  return JSON.parse(json);
}

function buildNav(data) {
  var html = readTemplate("nav.html");
  var s = new SpruceTemplate(html);

  // classes
  var classDocs = find(data, { kind: "class" });
  s.loop("classDoc", classDocs, function (i, classDoc, s) {
    s.text("className", classDoc.name);
    s.attr("className", "href", "./" + classDoc.longname + ".html");
  });

  // functions
  var functionDocs = find(data, { kind: "function", memberof: { isUndefined: true }, scope: "global" });
  s.loop("functionDoc", functionDocs, function (i, functionDoc, s) {
    s.text("functionName", functionDoc.name);
    s.attr("functionName", "href", "@global.html#" + functionDoc.name);
  });

  // namespaces
  var namespaceDocs = find(data, { kind: "namespace" });
  s.loop("namespaceDoc", namespaceDocs, function (i, namespaceDoc, s) {
    s.text("namespace", namespaceDoc.longname);
    s.attr("namespace", "href", "" + namespaceDoc.longname + ".html");
  });

  return s.html;
}

function buildIndex(options) {
  var html = readTemplate("index.html");
  var s = new SpruceTemplate(html);

  if (options["package"]) {
    var packageObj = getPackageObject(options["package"]);
    s.text("repo", packageObj.repository.url);
    s.attr("repo", "href", packageObj.repository.url);
  } else {
    s.drop("package");
  }

  if (options.readme) {
    s.load("readme", options.readme);
  } else {
    s.drop("readme");
  }

  return s.html;
}

function buildClass(clazz, data) {
  var memberDocs = find(data, { kind: "member", memberof: clazz.longname });
  var methodDocs = find(data, { kind: "function", memberof: clazz.longname });

  var s = new SpruceTemplate(readTemplate("class.html"));

  s.text("nameSpace", clazz.memberof);
  s.text("className", clazz.name);
  s.load("classDesc", clazz.classdesc);

  s.load("summaryConstructor", buildSummaryFunctions([clazz], "Constructor"));
  s.load("summaryMembers", buildSummaryMembers(memberDocs, "Members"));
  s.load("summaryMethods", buildSummaryFunctions(methodDocs, "Methods"));
  s.load("constructor", buildFunctions([clazz]));
  s.load("members", buildMembers(memberDocs));
  s.load("methods", buildFunctions(methodDocs));

  return s.html;
}

function buildGlobal(data) {
  var functionDocs = find(data, { kind: "function", memberof: { isUndefined: true }, scope: "global" });
  return buildFunctions(functionDocs);
}

function buildNamespace(namespaceDoc, data) {
  var s = new SpruceTemplate(readTemplate("namespace.html"));

  s.text("parentNamespace", namespaceDoc.namespace);
  s.text("namespace", namespaceDoc.longname);
  s.text("namespaceDesc", namespaceDoc.description);

  // summary classes
  var classDocs = find(data, { kind: "class", memberof: namespaceDoc.longname });
  s.load("summaryClassDocs", buildSummaryClasses(classDocs));

  // summary members
  var memberDocs = find(data, { kind: "member", memberof: namespaceDoc.longname });
  s.load("summaryMemberDocs", buildSummaryMembers(memberDocs, "Members"));

  // summary functions
  var functionDocs = find(data, { kind: "function", memberof: namespaceDoc.longname });
  s.load("summaryFunctionDocs", buildSummaryFunctions(functionDocs, "Functions"));

  // summary namespaces
  var namespaceDocs = find(data, { kind: "namespace", memberof: namespaceDoc.longname });
  s.load("summaryNamespaceDocs", buildSummaryNamespaces(namespaceDocs, "Namespaces"));

  s.load("memberDocs", buildMembers(memberDocs));
  s.load("functionDocs", buildFunctions(functionDocs));

  return s.html;
}

function buildSummaryMembers(memberDocs) {
  var title = arguments[1] === undefined ? "Members" : arguments[1];
  var s = new SpruceTemplate(readTemplate("summary.html"));

  s.text("title", "Members");
  s.loop("target", memberDocs, function (i, memberDoc, s) {
    s.load("name", buildDocLink(memberDoc.name, memberDoc.name, { inner: true }));
    s.load("signature", buildVariableSignature(memberDoc));
    s.load("description", shorten(memberDoc.description));
  });

  return s.html;
}

function buildSummaryFunctions(functionDocs) {
  var title = arguments[1] === undefined ? "Functions" : arguments[1];
  var s = new SpruceTemplate(readTemplate("summary.html"));

  s.text("title", title);
  s.loop("target", functionDocs, function (i, functionDoc, s) {
    s.load("name", buildDocLink(functionDoc.name, functionDoc.name, { inner: true }));
    s.load("signature", buildFunctionSignature(functionDoc));
    s.load("description", shorten(functionDoc.description));
  });

  return s.html;
}

function buildSummaryClasses(classDocs) {
  var innerLink = arguments[1] === undefined ? false : arguments[1];
  var s = new SpruceTemplate(readTemplate("summary.html"));

  s.text("title", "Classes");
  s.loop("target", classDocs, function (i, classDoc, s) {
    s.load("name", buildDocLink(classDoc.longname, classDoc.name, { inner: innerLink }));
    s.load("signature", buildFunctionSignature(classDoc));
    s.load("description", shorten(classDoc.description));
  });

  return s.html;
}

function buildSummaryNamespaces(namespaceDocs) {
  var s = new SpruceTemplate(readTemplate("summary.html"));

  s.text("title", "Namespaces");
  s.loop("target", namespaceDocs, function (i, namespaceDoc, s) {
    s.load("name", buildDocLink(namespaceDoc.longname, namespaceDoc.name, { inner: false }));
    s.drop("signature");
    s.load("description", shorten(namespaceDoc.description));
  });

  return s.html;
}

// kind = function
function buildFunctions(functionDocs) {
  var s = new SpruceTemplate(readTemplate("methods.html"));

  s.loop("method", functionDocs, function (i, functionDoc, s) {
    s.attr("anchor", "id", functionDoc.name);
    s.text("name", functionDoc.name);
    s.load("signature", buildFunctionSignature(functionDoc));
    s.load("description", functionDoc.description);

    s.loop("param", functionDoc.params, function (i, param, s) {
      s.autoDrop = false;
      s.attr("param", "data-depth", param.name.split(".").length - 1);
      s.text("name", param.name);
      s.attr("name", "data-depth", param.name.split(".").length - 1);
      s.load("description", param.description);

      var typeNames = [];
      for (var _iterator = param.type.names[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
        var typeName = _step.value;
        typeNames.push(buildDocLink(typeName));
      }
      s.load("type", typeNames.join(" | "));

      var appendix = [];
      if (param.optional) {
        appendix.push("optional");
      }
      s.text("appendix", appendix.join(", "));
    });

    if (!functionDoc.params) {
      s.drop("argumentParams");
    }

    if (functionDoc.returns) {
      s.load("returnDescription", functionDoc.returns[0].description);
      var typeNames = [];
      for (var _iterator = functionDoc.returns[0].type.names[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
        var typeName = _step.value;
        typeNames.push(buildDocLink(typeName));
      }
      s.load("returnType", typeNames.join(" | "));
    } else {
      s.drop("returnParams");
    }
  });

  return s.html;
}

// kind = member
function buildMembers(memberDocs) {
  var s = new SpruceTemplate(readTemplate("members.html"));

  s.loop("member", memberDocs, function (i, memberDoc, s) {
    s.attr("anchor", "id", memberDoc.name);
    s.text("name", memberDoc.name);
    s.load("signature", buildVariableSignature(memberDoc));
    s.load("description", memberDoc.description);
  });

  return s.html;
}

function buildDocLink(longname) {
  var text = arguments[1] === undefined ? longname : arguments[1];
  var _ref = arguments[2] === undefined ? {} : arguments[2];
  var inner = _ref.inner;
  return (function () {
    text = escape(text);

    if (inner) {
      return "<span><a href=#" + longname + ">" + text + "</a></span>";
    }

    var result = find(ENV.data, { longname: longname });
    if (result && result.length === 1) {
      return "<span><a href=" + longname + ".html>" + text + "</a></span>";
    } else {
      var result = find(ENV.data, { name: longname });
      if (result && result.length) {
        return "<span><a href=" + result[0].longname + ".html>" + text + "</a></span>";
      } else {
        return "<span>" + text + "</span>";
      }
    }
  })();
}

function buildFunctionSignature(functionDoc) {
  var params = functionDoc.params || [];
  var signatures = [];
  for (var _iterator = params[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
    var param = _step.value;
    var paramName = param.name;
    if (paramName.indexOf(".") !== -1) continue;

    var types = [];
    for (var _iterator2 = param.type.names[Symbol.iterator](), _step2; !(_step2 = _iterator2.next()).done;) {
      var typeName = _step2.value;
      types.push(buildDocLink(typeName, typeName));
    }

    signatures.push("" + paramName + ": " + types.join(" | "));
  }

  var returnSignatures = [];
  if (functionDoc.returns) {
    for (var _iterator3 = functionDoc.returns[0].type.names[Symbol.iterator](), _step3; !(_step3 = _iterator3.next()).done;) {
      var typeName = _step3.value;
      returnSignatures.push(buildDocLink(typeName, typeName));
    }
  }

  if (returnSignatures.length) {
    return "(" + signatures.join(", ") + "): " + returnSignatures.join(" | ");
  } else {
    return "(" + signatures.join(", ") + ")";
  }
}

function buildVariableSignature(propRecord) {
  var types = [];
  for (var _iterator = propRecord.type.names[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
    var typeName = _step.value;
    types.push(buildDocLink(typeName, typeName));
  }

  return ": " + types.join(", ");
}

function link(str) {
  if (!str) return str;

  return str.replace(/\{@link ([\w\#_\-.]+)}/g, function (str, cap) {
    var temp = cap.split("#"); // cap = HogeFoo#bar
    var text = temp[0].split(".").reverse()[0];
    temp[0] += ".html";
    return "<a href=\"" + temp.join("#") + "\">" + cap + "</a>";
  });
}

function resolveLink(data) {
  data().each(function (v) {
    v.description = link(v.description);

    if (v.params) {
      for (var _iterator = v.params[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
        var param = _step.value;
        param.description = link(param.description);
      }
    }

    if (v.returns) {
      for (var _iterator2 = v.returns[Symbol.iterator](), _step2; !(_step2 = _iterator2.next()).done;) {
        var returnParam = _step2.value;
        returnParam.description = link(returnParam.description);
      }
    }
  });
}

var ENV = {};

/**
 * @param {TaffyDB} data see http://www.taffydb.com/
 * @param config
 * @param tutorials
 */
exports.publish = function (data, config, tutorials) {
  ENV.data = data;
  ENV.config = config;

  resolveLink(data);

  var s = new SpruceTemplate(readTemplate("layout.html"), { autoClose: false });
  s.text("date", new Date().toString());
  s.load("nav", buildNav(data));

  // index.html
  var indexHTML = buildIndex(config);
  s.load("content", indexHTML);
  writeHTML(config, "index.html", s.html);

  // @global.html
  var globalHTML = buildGlobal(data);
  s.load("content", globalHTML);
  writeHTML(config, "@global.html", s.html);

  // classes
  //var classes = find(data, {kind: 'class', name: 'ReadableStream'});
  //var classHTML = buildClass(classes[0], data);
  //s.load('content', classHTML);
  //writeHTML(config, `${classes[0].longname}.html`, s.html);

  // functions
  var functionDocs = find(data, { kind: "function", memberof: { isUndefined: true }, scope: "global" });

  // namespaces
  var namespaceDocs = find(data, { kind: "namespace" });
  for (var _iterator = namespaceDocs[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
    var namespaceDoc = _step.value;
    var namespaceHTML = buildNamespace(namespaceDoc, data);
    s.load("content", namespaceHTML);
    writeHTML(config, "" + namespaceDoc.longname + ".html", s.html);
  }

  var classes = find(data, { kind: "class" });
  for (var _iterator2 = classes[Symbol.iterator](), _step2; !(_step2 = _iterator2.next()).done;) {
    var clazz = _step2.value;
    var classHTML = buildClass(clazz, data);
    s.load("content", classHTML);
    writeHTML(config, "" + clazz.longname + ".html", s.html);
  }


  // copy css and script
  fs.copySync(path.resolve(__dirname, "./template/css"), path.resolve(config.destination, "./css"));
  fs.copySync(path.resolve(__dirname, "./template/script"), path.resolve(config.destination, "./script"));
};
