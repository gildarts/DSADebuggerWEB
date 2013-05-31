var dsadal = function() {
	var _conn = null;

	return {
		init : function(conn) {
			_conn = conn;
		},
		// GetServerInfo
		get_server_info : function(callback) {
			_conn.send({
				service : 'Server.GetServerInfo',
				body : '',
				result : callback
			});
		},
		// ListApplication
		list_application : function(callback) {
			_conn.send({
				service : 'Server.ListApplication',
				body : '',
				result : callback
			});

		},
		get_application_param : function(callback) {
			_conn.send({
				service : "Server.GetApplicationParam",
				body : '',
				result : callback
			});
		},
		get_diagnostics_data : function(callback) {
			_conn.send({
				service : "Diagnostics.GetDiagnosticData",
				body : '',
				result : callback
			});
		},
		get_diagnostics_thread : function(callback) {
			_conn.send({
				service : "Diagnostics.GetThreadsStatus",
				body : '',
				result : callback
			});
		}
	};
}();