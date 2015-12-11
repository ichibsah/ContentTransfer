<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="expires" content="-1"/>
	<meta http-equiv="pragma" content="no-cache">
	<meta http-equiv="cache-control" content="no-cache">
	<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
	<meta name="copyright" content="2014, Web Solutions"/>
	<meta http-equiv="X-UA-Compatible" content="IE=edge" >
	<title>Standardfield To Image</title>
	<link rel="stylesheet" href="css/bootstrap.min.css" />
	<style type="text/css">
		body {
			padding: 10px;
		}
	</style>
	<script type="text/javascript" src="js/jquery-1.10.2.min.js"></script>
	<script type="text/javascript" src="js/bootstrap.min.js"></script>
	<script type="text/javascript" src="js/handlebars-v2.0.0.js"></script>
	<script type="text/javascript" src="js/content-transfer.js"></script>
	<script type="text/javascript" src="rqlconnector/Rqlconnector.js"></script>

	<script id="template-action-dialog" type="text/x-handlebars-template" data-container="#action-dialog" data-action="replace">
		<div class="modal hide fade" data-backdrop="static" tabindex="-1" role="dialog" aria-hidden="true">
			<div class="modal-header">
				<h4>Content Transfer</h4>
			</div>
			<div class="modal-body">
				<form class="form-horizontal">
					<div class="control-group">
						<label class="control-label">Source</label>
						<div class="controls source">
							<input type="text" placeholder="Element Name">
						</div>
					</div>
					<div class="control-group">
						<label class="control-label">Target</label>
						<div class="controls target">
							<input type="text" placeholder="Element Name">
						</div>
					</div>
					<div class="control-group">
						<div class="controls multi-threaded">
							<label>
								<input type="checkbox"> multi-threaded
							</label>
						</div>
					</div>
				</form>
			</div>
			<div class="modal-footer">
				<span class="btn btn-success transfer" data-dismiss="modal">Transfer</span>
			</div>
		</div>
	</script>
	
	<script id="template-status" type="text/x-handlebars-template" data-container="#status" data-action="append">
		<div class="{{guid}}">
			<div class="alert">
				Processing <strong>{{name}}</strong>
				{{#if count}}
				<div class="pull-right">{{count}} remaining</div>
				{{/if}}
			</div>
		</div>
	</script>
	
	<script id="template-status-remove" type="text/x-handlebars-template" data-container="#status" data-action="replace">
	</script>
	
	<script type="text/javascript">
		var LoginGuid = '<%= session("loginguid") %>';
		var SessionKey = '<%= session("sessionkey") %>';
		var ContentClassGuid = '<%= session("treeguid") %>';

		$(document).ready(function() {
			var RqlConnectorObj = new RqlConnector(LoginGuid, SessionKey);
			var ContentTransferObj = new ContentTransfer(RqlConnectorObj, ContentClassGuid);
		});
	</script>
</head>
<body>
	<div id="action-dialog"></div>
	<div class="container" id="status">
		<div class="alert">Loading</div>
	</div>
</body>
</html>