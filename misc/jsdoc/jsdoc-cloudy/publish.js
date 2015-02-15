"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var SpruceTemplate = _interopRequire(require("spruce-template"));

var fs = _interopRequire(require("fs-extra"));

var path = _interopRequire(require("path"));

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
  var myClasses = find(data, { kind: "class" });

  var html = readTemplate("nav.html");
  var s = new SpruceTemplate(html);
  s.loop("classNames", myClasses, function (i, myClass, s) {
    s.text("className", myClass.name);
    s.attr("className", "href", "./" + myClass.longname + ".html");
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

function buildSummaryConstructor(clazz) {
  var s = new SpruceTemplate(readTemplate("summary.html"));
  s.text("title", "Constructor");
  s.load("name", buildDocLink(clazz.name, clazz.name, { inner: true }));
  s.load("signature", buildFunctionSignature(clazz));
  s.load("description", shorten(clazz.description));

  return s.html;
}

function buildSummaryMembers(clazz) {
  var s = new SpruceTemplate(readTemplate("summary.html"));
  var members = find(ENV.data, { kind: "member", memberof: clazz.longname });

  s.text("title", "Members");
  s.loop("target", members, function (i, member, s) {
    s.load("name", buildDocLink(member.name, member.name, { inner: true }));
    s.load("signature", buildVariableSignature(member));
    s.load("description", shorten(member.description));
  });

  return s.html;
}

function buildSummaryMethods(clazz) {
  var s = new SpruceTemplate(readTemplate("summary.html"));
  var methods = find(ENV.data, { kind: "function", memberof: clazz.longname });

  s.text("title", "Methods");
  s.loop("target", methods, function (i, method, s) {
    s.load("name", buildDocLink(method.name, method.name, { inner: true }));
    s.load("signature", buildFunctionSignature(method));
    s.load("description", shorten(method.description));
  });

  return s.html;
}

function buildMethods(funcRecords) {
  var s = new SpruceTemplate(readTemplate("methods.html"));

  s.loop("method", funcRecords, function (i, funcRecord, s) {
    s.attr("anchor", "id", funcRecord.name);
    s.text("name", funcRecord.name);
    s.load("signature", buildFunctionSignature(funcRecord));
    s.load("description", funcRecord.description);

    s.loop("param", funcRecord.params, function (i, param, s) {
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

    if (!funcRecord.params) {
      s.drop("argumentParams");
    }

    if (funcRecord.returns) {
      s.load("returnDescription", funcRecord.returns[0].description);
      var typeNames = [];
      for (var _iterator = funcRecord.returns[0].type.names[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
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

function buildMembers(memberRecords) {
  var s = new SpruceTemplate(readTemplate("members.html"));

  s.loop("member", memberRecords, function (i, memberRecord, s) {
    s.attr("anchor", "id", memberRecord.name);
    s.text("name", memberRecord.name);
    s.load("signature", buildVariableSignature(memberRecord));
    s.load("description", memberRecord.description);
  });

  return s.html;
}

function buildClass(clazz, data) {
  var s = new SpruceTemplate(readTemplate("class.html"));

  s.text("nameSpace", clazz.memberof);
  s.text("className", clazz.name);
  s.load("classDesc", clazz.classdesc);

  var summaryConstructorHTML = buildSummaryConstructor(clazz);
  s.load("summaryConstructor", summaryConstructorHTML);

  var summaryMembersHTML = buildSummaryMembers(clazz);
  s.load("summaryMembers", summaryMembersHTML);

  var summaryMethodsHTML = buildSummaryMethods(clazz);
  s.load("summaryMethods", summaryMethodsHTML);

  var constructorHTML = buildMethods([clazz]);
  s.load("constructor", constructorHTML);

  var members = find(ENV.data, { kind: "member", memberof: clazz.longname });
  var membersHTML = buildMembers(members);
  s.load("members", membersHTML);

  var methods = find(ENV.data, { kind: "function", memberof: clazz.longname });
  var methodsHTML = buildMethods(methods);
  s.load("methods", methodsHTML);

  return s.html;
}

function buildDocLink(longname) {
  var text = arguments[1] === undefined ? longname : arguments[1];
  var _ref = arguments[2] === undefined ? {} : arguments[2];
  var inner = _ref.inner;
  return (function () {
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

function buildFunctionSignature(funcRecord) {
  var params = funcRecord.params || [];
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
  if (funcRecord.returns) {
    for (var _iterator3 = funcRecord.returns[0].type.names[Symbol.iterator](), _step3; !(_step3 = _iterator3.next()).done;) {
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

  // classes
  var classes = find(data, { kind: "class", name: "ReadableStream" });
  var classHTML = buildClass(classes[0], data);
  s.load("content", classHTML);
  writeHTML(config, "" + classes[0].longname + ".html", s.html);


  //var classes = find(data, {kind: 'class'});
  //for (var clazz of classes) {
  //  var classHTML = buildClass(clazz, data);
  //  s.load('content', classHTML);
  //  writeHTML(config, `${clazz.longname}.html`, s.html);
  //}


  // copy css
  //var dest = path.resolve(config.destination, './css');
  //fs.rmdirSync(dest);
  //copyDir(path.resolve(__dirname, './template/css'), dest);
  fs.copySync(path.resolve(__dirname, "./template/css"), path.resolve(config.destination, "./css"));
  fs.copySync(path.resolve(__dirname, "./template/script"), path.resolve(config.destination, "./script"));
};
