var dsamanager = function() {
	var show_memory_status = function(container, callback) {
		$(container).load('diagnostics-memory.html', function() {
			dsadal.get_diagnostics_data(function(rsp, error) {
				diag.memory.applyui(rsp, $('#diagnostics-memory'));
				callback();
			});
		});
	};

	var show_thread_status = function(container, callback) {
		$(container).load('diagnostics-thread.html', function() {
			dsadal.get_diagnostics_thread(function(rsp, error) {
				diag.thread.applyui(rsp, $('#diagnostics-thread'));
				callback();
			});
		});
	};

	var current_page = ""; // 一開始會停在 diag 頁。

	return {
		// 初始化各類 Item 的事件。
		initial : function(conn) {
			$('#main').show();
			$('#main_content').show();
			$('#login_form').hide();

			var items = $('#funs > [function]').bind('click', function() {
				$(this).siblings('.active').removeClass('active');
				$(this).addClass('active');

				switch ($(this).attr('function')) {
				case 'conf':
					dsadal.get_server_info(function(rsp, error) {
						dsamanager.show_summary(rsp, $('#main #content'));
					});
					break;
				case 'apps':
					dsadal.get_application_param(function(rsp, error) {
						dsamanager.show_applications(rsp, $('#main #content'));
					});
					break;
				case 'diags':
					dsamanager.show_diagnostics(null, $('#main #content'));
					break;
				default:
					alert('no function execute...');
				}

			});

			dsadal.init(conn);

			// 一開始就按下第一個項目。
			items.first().trigger('click');
		},
		// 的示 DSA Server Summary 資訊。
		show_summary : function(rsp, jplaceholder) {
			if (current_page == "summary")
				return;

			var contentContainer = $('#summary_template').clone();
			var serverxml = search_by_name(ensure_array(rsp.Server.Property), 'ServerXml');
			var updateConf = search_by_name(ensure_array(serverxml.ApplicationServer.Property), 'UpdateCenter');

			contentContainer.find('#confName').val(rsp.Server.Name);
			contentContainer.find('#dbversion').val(rsp.Server.Database.Version);
			contentContainer.find('#appUrl').val(updateConf.UpdateCenter.AppDeploy['@text']);
			contentContainer.find('#comUrl').val(updateConf.UpdateCenter.Components['@text']);

			jplaceholder.html(contentContainer);
			contentContainer.show();
			current_page = "summary";
		},
		// 顯示目前的所有 Application 清單。
		show_applications : function(rsp, jplaceholder) {
			if (current_page == "app")
				return;

			// 原來有這麼難搞的東西...o.o
			var content = $($.parseHTML($('#applications_template').html().trim()));

			var app_rows = content.find('#app_rows');
			var row_template = app_rows.children().first().detach();

			$(rsp.Response.Application).each(function(index, item) {
				var dburl = search_by_name(item.Param, 'db_url')['@text'];

				if (!dburl)
					dburl = "非主流設定方式！";

				var row = row_template.clone();
				row.find('#name').html(item.Name);
				row.find('#dburl').html(dburl);

				app_rows.append(row);
			});

			jplaceholder.html(content);
			current_page = "app";
		},
		show_diagnostics : function(rsp, jplaceholder) {
			if (current_page == "diag")
				return;

			var content = $('#diagnositcs_template').clone(true);
			var ctrStatus = content.find('#ctr_status');

			content.show();
			jplaceholder.html(content);

			// 快照目前記憶體狀態
			content.find('#btn_snapmemory').click(function() {
				var sender = $(this);
				sender.button('loading');
				show_memory_status(ctrStatus, function() {
					sender.button('reset');
				});
			}).trigger('click');

			// 快照目前執行緒狀態
			content.find('#btn_snapthread').click(function() {
				var sender = $(this);
				sender.button('loading');
				show_thread_status(ctrStatus, function() {
					sender.button('reset');
				});
			});

			current_page = "diag";
		}
	};
}();