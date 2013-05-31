var diag = {
	memory : {
		applyui : function(rsp, diagui) {
			// 顯示目前時間。
			$(diagui).find('#currentTimestamp').html(rsp.DiagnosticsData.Timestamp);

			var classloading = rsp.DiagnosticsData.ClassLoadingMXBean;
			$('#LoadedClassCount').val(classloading.LoadedClassCount);
			$('#TotalLoadedClassCount').val(classloading.TotalLoadedClassCount);
			$('#UnloadedClassCount').val(classloading.UnloadedClassCount);

			var operatingsystem = rsp.DiagnosticsData.OperatingSystemMXBean;
			$('#AvailableProcessors').val(operatingsystem.AvailableProcessors);
			$('#SystemLoadAverage').val(operatingsystem.SystemLoadAverage);
			$('#CommittedVirtualMemorySize').val((operatingsystem.CommittedVirtualMemorySize / 1024 / 1024).toFixed(1));
			$('#FreePhysicalMemorySize').val((operatingsystem.FreePhysicalMemorySize / 1024 / 1024).toFixed(1));
			$('#FreeSwapSpaceSize').val((operatingsystem.FreeSwapSpaceSize / 1024 / 1024).toFixed(1));
			$('#TotalPhysicalMemorySize').val((operatingsystem.TotalPhysicalMemorySize / 1024 / 1024).toFixed(1));
			$('#TotalSwapSpaceSize').val((operatingsystem.TotalSwapSpaceSize / 1024 / 1024).toFixed(1));
			$('#ProcessCpuTime').val(operatingsystem.ProcessCpuTime);

			var memorybean = rsp.DiagnosticsData.MemoryMXBean;
			$('#heapInit').val((memorybean.HeapMemoryUsage.Init / 1024 / 1024).toFixed(1));
			$('#heapUsed').val((memorybean.HeapMemoryUsage.Used / 1024 / 1024).toFixed(1));
			$('#heapMax').val((memorybean.HeapMemoryUsage.Max / 1024 / 1024).toFixed(1));
			$('#nheapInit').val((memorybean.NonHeapMemoryUsage.Init / 1024 / 1024).toFixed(1));
			$('#nheapUsed').val((memorybean.NonHeapMemoryUsage.Used / 1024 / 1024).toFixed(1));
			$('#nheapMax').val((memorybean.NonHeapMemoryUsage.Max / 1024 / 1024).toFixed(1));

			var argumentdata = rsp.DiagnosticsData.RuntimeMXBean.InputArguments;
			argumentdata.sort();

			var argumentstable = $('#Arguments');
			var datapresent = "";
			$(argumentdata).each(function(index, item) {
				datapresent += "<tr><td>" + item + "</td></tr>";
			});
			argumentstable.html(datapresent);

			var sysptydata = rsp.DiagnosticsData.RuntimeMXBean.SystemProperty;
			sysptydata.sort();

			var sysptytable = $('#SystemProperties');
			var syspresent = "";
			$(sysptydata).each(function(index, item) {
				syspresent += "<tr><td>" + item['Name'] + "</td><td>" + item['@text'] + "</td></tr>";
			});
			sysptytable.html(syspresent);

			var parts = rsp.DiagnosticsData.RuntimeMXBean.BootClassPath.split(';');
			var lines = "";
			$(parts).each(function(index, item) {
				lines += item + "<br>";
			});
			$('#BootClassPath').html(lines);

			parts = rsp.DiagnosticsData.RuntimeMXBean.ClassPath.split(';');
			lines = "";
			$(parts).each(function(index, item) {
				lines += item + "<br>";
			});
			$('#ClassPath').html(lines);

			parts = rsp.DiagnosticsData.RuntimeMXBean.LibraryPath.split(';');
			lines = "";
			$(parts).each(function(index, item) {
				lines += item + "<br>";
			});
			$('#LibraryPath').html(lines);
		}
	},
	thread : {
		applyui : function(rsp, diagui) {
			$(diagui).find('#currentTimestamp').html(rsp.DiagnosticsData.Timestamp);

			var thread_rows = $(diagui).find('#threads');
			var runnings = $.makeArray(rsp.DiagnosticsData.Running);

			runnings.sort(function(x, y) {
				return x.Application > y.Application;
			});

			var thread_data = "";
			$(runnings).each(function(index, item) {
				thread_data += "<tr>";
				thread_data += "<td>" + item.ThreadName.replace('http-bio-8080-', '') + "</td>";
				thread_data += "<td>" + item.ThreadState + "</td>";
				thread_data += "<td>" + item.Service + "</td>";
				thread_data += "<td>" + item.Application + "</td>";
				thread_data += "<td>" + item.Contract + "</td>";
				thread_data += "<td>" + item.IPAddress + "</td>";
				thread_data += "<td>" + item.UserName + "</td>";
				thread_data += "<td>" + item.SpendTime + "</td>";
				thread_data += "</tr>";
			});
			$(thread_rows).html(thread_data);

		}
	}
};