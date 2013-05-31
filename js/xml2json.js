/*
xml2json v 1.1
copyright 2005-2007 Thomas Frank
This program is free software under the terms of the
GNU General Public License version 2 as published by the Free
Software Foundation. It is distributed without any warranty.
*/
xml2json = {
    parser: function (xmlcode, ignoretags, debug) {
        function deformateXml(str) {
            if (str)
                return str.replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&apos;/g, "'");
            return "";
        }
        function no_fast_endings(str) {
            var values = str.split("/>");
            for (var i = 1; i < values.length; i++) {
                var t = values[i - 1].substring(values[i - 1].lastIndexOf("<") + 1).split(" ")[0];
                values[i] = "></" + t + ">" + values[i];
            };
            str = values.join("");
            return str;
        }

        var xmlobject = {};
        var x = '<JSONTAGWRAPPER>' + xmlcode + '</JSONTAGWRAPPER>';
        var cdatas = [];
        var cdataIndex = 0;
        while (x.indexOf("<![CDATA[") > 0) {
            var bindex = x.indexOf("<![CDATA[");
            var eindex = x.indexOf("]]>", bindex);
            cdatas.push(x.substring(bindex + 9, eindex));
            x = x.substring(0, bindex) + "§![CDATA[" + cdataIndex + "]]>" + x.substring(eindex + 3);
            cdataIndex++;
        }
        //		x=x.replace(/<\?[^>]*>/g,"").replace(/<\!--[^>]*-->/g,"");//好像是去註解?
        x = x.replace(/<\?[^>]*>/g, ""); //.replace(/<\!--[]*-->/g,"");
        while (x.indexOf("<!--") > 0) {
            var bindex = x.indexOf("<!--");
            var eindex = x.indexOf("-->", bindex);
            x = x.substring(0, bindex) + x.substring(eindex + 3);
        }
        x = x.replace(/\s*\/>/g, '/>');
        x = no_fast_endings(x);
        x = x.replace(/<\//g, "§");
        x = x.split("<");
        var y = [];
        var level = 0;
        var opentags = [];
        for (var i = 1; i < x.length; i++) {
            x[i] = x[i].replace("§![CDATA[", "<![CDATA[");
            var tagname = x[i].split(">")[0].replace(/\s+/g, " ");
            if (tagname.indexOf(" ") > 0)
                tagname = tagname.substring(0, tagname.indexOf(" "));
            opentags.push(tagname);
            level++;
            y.push(level + "<" + x[i].split("§")[0]);
            var ending = x[i];
            var endingProcess = false;
            while (ending.replace(/^\s+/g, '').indexOf("§" + opentags[opentags.length - 1]) >= 0) {
                if (opentags[opentags.length - 1] != tagname &&
                ending.indexOf("§" + opentags[opentags.length - 1]) > 0 &&
                ending.substring(0, ending.indexOf("§" + opentags[opentags.length - 1])).replace(/^[\s]*[>]\s+|\s+$/g, '') != "") {
                    y.push("" + (level + 1) + "<@text>" + ending.substring(0, ending.indexOf("§" + opentags[opentags.length - 1])).replace(/^[\s]*>/g, ''));
                }
                ending = ending.substring(ending.indexOf("§" + opentags[opentags.length - 1]) + opentags[opentags.length - 1].length + 2).replace(/^\s+>/g, '');
                xmlcode['aa'] = ending;
                level--;
                opentags.pop();
                endingProcess = true;
            }
            if (endingProcess && ending.replace(/^\s+|\s+$/g, '') != "") {
                y.push(level + 1 + "<@text>" + ending.replace(/^[\s]*>/g, ''));
            }
        };
        var oldniva = -1;
        var objname = "xmlobject";
        for (var i = 0; i < y.length; i++) {
            var preeval = "";
            var niva = Number(y[i].split("<")[0]);
            var tagnamn = (y[i].split("<")[1].split(">")[0]).replace(/\s/g, ' ');
            var atts = tagnamn.match(/ ([^=]*)=[\s]*((\"[^\"|>]*\")|(\'[^\'|>]*\'))/g);
            if (tagnamn.indexOf(" ") > 0)
                tagnamn = tagnamn.substring(0, tagnamn.indexOf(" "));
            var rest = y[i].substring(y[i].indexOf(">") + 1);
            if (niva <= oldniva) {
                var tabort = oldniva - niva + 1;
                for (var j = 0; j < tabort; j++) {
                    objname = objname.substring(0, objname.lastIndexOf("['"));
                }
            };
            objname += "['" + tagnamn + "']";
            var pobject = objname.substring(0, objname.lastIndexOf("['"));
            //            if (eval("typeof " + pobject) != "object") {
            //                preeval += pobject + "={'@text':" + pobject + "};\n";
            //            }
            var already = false;
            for (k in eval(pobject)) {
                if (k == tagnamn) {
                    already = true
                };
            };
            rest = rest.replace(/^\s+|\s+$/g, ''); //  .replace(/^\s+|\s+$/g, '') <=這個叫做trim()
            if (rest != "") {
                //                if (rest / 1 != rest && rest != 'true' && rest != 'false') {//不是number也不是boolean，做CDATA解封裝跟字串處理
                if (rest.match(/\<\!\[CDATA\[[0-9]+\]\]\>/g)) {
                    rest = rest.replace(/\<\!\[CDATA\[/g, "cdatas[").replace(/\]\]\>/g, "]");
                }
                else {
                    rest = deformateXml(rest);
                    if (JSON && JSON.stringify) {
                        rest = JSON.stringify(rest);
                    }
                    else {
                        rest = rest.replace(/\\/g, "\\\\");
                        rest = "'" + rest.replace(/\'/g, "\\'").replace(/\s/g, ' ') + "'";
                    }
                }
                //                }
            }
            else {
                if (atts || ((i + 1) < y.length && niva < Number(y[i + 1].split("<")[0]))) {
                    rest = "{}";
                }
                else {
                    rest = "''";
                }
            };
            var before = "=";
            after = "";
            if (already) {
                //                if (eval("typeof " + objname) == "object" && rest != "{}") {
                //                    before = "['@text']=";
                //                }
                //                else {
                if (!eval(objname + ".sort")) {
                    preeval += objname + "=[" + objname + "];\n";
                }
                before = ".push(";
                after = ")";
                //                }
            }
            var toeval = preeval + objname + before + rest + after;
            eval(toeval);
            if (eval(objname + ".sort")) {
                objname += "[" + eval(objname + ".length-1") + "]";
            };
            if (atts) {
                var obj = {};
                if (rest == "{}") {
                    obj = eval(objname);
                }
                else {
                    obj["@text"] = eval(objname);
                    eval(objname + "=obj;");
                }
                obj["@"] = [];
                for (var m = 0; m < atts.length; m++) {
                    var attname = atts[m].substring(0, atts[m].indexOf("=")).replace(/^\s+|\s+$/g, '');
                    var attvalue = atts[m].substring(atts[m].indexOf("=") + 1).replace(/^\s+/g, '');
                    ;
                    if (attvalue != attvalue.replace(/^\'+|\'+$/g, ''))
                        attvalue = attvalue.replace(/^\'+|\'+$/g, '');
                    else
                        attvalue = attvalue.replace(/^\"+|\"+$/g, '');
                    //					attvalue=attvalue.replace(/\s+/g, ' ');
                    obj["@"].push(attname);
                    if (!obj[attname]) {
                        obj[attname] = deformateXml(attvalue);
                    }
                }
            }
            oldniva = niva;
        };
        var result = xmlobject.JSONTAGWRAPPER;
        if (debug) {
            result = this.show_json_structure(result, debug);
        };
        return result;
    },
    show_json_structure: function (obj, debug, l) {
        var x = '';
        try {
            if (!obj) {
                if (obj === null || obj === undefined) {
                    x += '' + obj + ',\n';
                }
                else {
                    x += "'" + obj + "',\n";
                }
            }
            else {
                var objType = typeof obj;
                if (Array.isArray ? Array.isArray(obj) : (obj == null ? String(obj) : (Object.prototype.toString.call(obj) == "[object Array]"))) { //obj isArray
                    x += "[\n";
                    for (var i in obj) {
                        x += "'" + i.replace(/\'/g, "\\'") + "':";
                        x += this.show_json_structure(obj[i], false, 1);
                    };
                    x += "],\n";
                }
                else {
                    if (objType == 'number' || objType == 'string' || objType == 'boolean') {//obj isValueType
                        x += "'" + ("" + obj).replace(/\'/g, "\\'").replace(/\n/g, "\\n").replace(/\t/g, "\\t").replace(/\r/g, "\\r") + "',\n";
                    }
                    else {
                        if (objType == "function") {
                            var v = obj + "";
                            x += v.substr(0, v.indexOf('{')) + "{\n...,\n},\n";
                        }
                        else {
                            x += "{\n";
                            for (var i in obj) {
                                x += "'" + i.replace(/\'/g, "\\'") + "':";
                                x += this.show_json_structure(obj[i], false, 1);
                            };
                            x += "},\n";
                        }
                    }
                }
            }
        }
        catch (err) {
            x += err + ",\n";
        }
        //        if (!obj) {
        //            return '' + obj;
        //        }
        //        if (obj.sort) {
        //            x += "[\n";
        //        }
        //        else {
        //            x += "{\n";
        //        };
        //        for (var i in obj) {
        //            if (!obj.sort) {
        //                x += "'" + i.replace(/\'/g, "\\'") + "':";
        //            };
        //            if (typeof obj[i] == "object") {
        //                x += this.show_json_structure(obj[i], false, 1);
        //            }
        //            else {
        //                if (typeof obj[i] == "function") {
        //                    var v = 'function'//obj[i] + "";
        //                    //v=v.replace(/\t/g,"");
        //                    x += v;
        //                }
        //                else
        //                    if (typeof obj[i] != "string") {
        //                        x += obj[i] + ",\n";
        //                    }
        //                    else {
        //                        x += "'" + obj[i].replace(/\'/g, "\\'").replace(/\n/g, "\\n").replace(/\t/g, "\\t").replace(/\r/g, "\\r") + "',\n";
        //                    }
        //            }
        //        };
        //        if (obj.sort) {
        //            x += "],\n";
        //        }
        //        else {
        //            x += "},\n";
        //        };
        if (!l) {
            x = x.substring(0, x.lastIndexOf(","));
            x = x.replace(new RegExp(",\n}", "g"), "\n}");
            x = x.replace(new RegExp(",\n]", "g"), "\n]");
            var y = x.split("\n");
            x = "";
            var lvl = 0;
            for (var i = 0; i < y.length; i++) {
                if (y[i].indexOf("}") >= 0 || y[i].indexOf("]") >= 0) {
                    lvl--;
                };
                tabs = "";
                for (var j = 0; j < lvl; j++) {
                    tabs += "\t";
                };
                x += tabs + y[i] + "\n";
                if (y[i].indexOf("{") >= 0 || y[i].indexOf("[") >= 0) {
                    lvl++;
                }
            };
            if (debug == "html") {
                x = x.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                x = x.replace(/\n/g, "<BR>").replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
            };
            if (debug == "compact") {
                x = x.replace(/\n/g, "").replace(/\t/g, "");
            }
        };
        return x;
    }
};


if (!Array.prototype.push) {
    Array.prototype.push = function (x) {
        this[this.length] = x;
        return true;
    };
};

if (!Array.prototype.pop) {
    Array.prototype.pop = function () {
        var response = this[this.length - 1];
        this.length--;
        return response;
    };
};
