$(document).ready(function() {
	// 當按下 Login 時。
	$('#login').click(function() {
		var manurl = $("#login_form #inputAccessPoint").val();

		if (!manurl.endsWith('/manager'))
			manurl += '/manager';

		window.login_dsa_server(manurl);
	});
});

var login_dsa_server = function(manurl) {
	var account = $('#inputAccount').val();
	var password = $('#inputPassword').val();

	var conn = dsutil.creatConnection(manurl, account, password);
	conn.ready(function() {
		dsamanager.initial(conn);
	});
	conn.OnLoginError(function(error) {
		alert(error.message);
	});
	conn.OnError(function(req, error) {
		alert(error.dsaError.message + "\n\nService Name：" + req.service);
	});
};

var search_by_name = function(obj, name) {
	var result = {};
	$(obj).each(function(index, item) {
		if (item.Name == name)
			result = item;
	});
	return result;
};

var ensure_array = function(obj) {
	if (!$.isArray(obj)) {
		return [ obj ];
	} else
		return obj;

};

String.prototype.endsWith = function(suffix) {
	return this.slice(-suffix.length) === suffix;
};