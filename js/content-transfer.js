function ContentTransfer(RqlConnectorObj, ContentClassGuid) {
	var ThisClass = this;
	this.RqlConnectorObj = RqlConnectorObj;
	
	this.TemplateActionDialog = '#template-action-dialog';
	this.TemplateStatus = '#template-status';
	this.TemplateStatusElement = '#template-status-element';
	this.TemplateStatusRemove = '#template-status-remove';
	
	this.UpdateArea(this.TemplateActionDialog);
	
	var ActionDialogContainer = $(this.TemplateActionDialog).attr('data-container');
	$ActionDialogModal = $(ActionDialogContainer).find('.modal');
	$ActionDialogModal.modal('show');
	$(ActionDialogContainer).find('.modal');
	
	$(ActionDialogContainer).on('click', '.transfer', function(){
		ThisClass.GetAllPageInstancesArray(ContentClassGuid, function(PageInstancesArray){
			var SourceElementName = $(ActionDialogContainer).find('.source input').val();
			var TargetElementName = $(ActionDialogContainer).find('.target input').val();
			var IsMultiThreaded = $(ActionDialogContainer).find('.multi-threaded input').prop('checked');
			
			ThisClass.UpdateArea(ThisClass.TemplateStatusRemove);
			
			if(IsMultiThreaded) {
				// threaded method
				$.each(PageInstancesArray, function() {
					ThisClass.ReferencePage(this, SourceElementName, TargetElementName);
				});
			} else {
				// single threaded
				ThisClass.ReferenceArray(PageInstancesArray, SourceElementName, TargetElementName);
			}
		});
	});
}

ContentTransfer.prototype.GetAllPageInstancesArray = function(ContentClassGuid, CallbackFunc) {
	var ThisClass = this;

	var RqlXml = '<PAGE action="xsearch" pagesize="-1" maxhits="-1"><SEARCHITEMS><SEARCHITEM key="contentclassguid" value="' + ContentClassGuid + '" operator="eq"></SEARCHITEM></SEARCHITEMS></PAGE>';
	this.RqlConnectorObj.SendRql(RqlXml, false, function(data){
		var PageInstancesArray = [];

		$(data).find('PAGE').each( function(index) {
			var PageObj = {
				guid: $(this).attr('guid'),
				name: $(this).attr('headline')
			};
			PageInstancesArray.push(PageObj);
		});

		CallbackFunc(PageInstancesArray);
	});
}

ContentTransfer.prototype.ReferenceArray = function(PageInstancesArray, SourceElementName, TargetElementName) {
	var ThisClass = this;
	
	var PageObj = PageInstancesArray.shift();
	if(PageObj){
		PageObj.count = PageInstancesArray.length;
		
		var RqlXml = '<PAGE guid="' + PageObj.guid + '"><ELEMENTS action="load"/></PAGE>';
		
		ThisClass.UpdateArea(ThisClass.TemplateStatus, undefined, PageObj);

		ThisClass.RqlConnectorObj.SendRql(RqlXml, false, function(data){
			var SourceElementValue = $(data).find('ELEMENT[eltname="' + SourceElementName + '"]').attr('value');
			var TargetElementGuid = $(data).find('ELEMENT[eltname="' + TargetElementName + '"]').attr('guid');
			var TargetElementValue = $(data).find('ELEMENT[eltname="' + TargetElementName + '"]').attr('value');
			
			PageObj.sourceelementname = SourceElementName;
			PageObj.sourceelementvalue = SourceElementValue;
			PageObj.targetelementname = TargetElementName;
			PageObj.targetelementvalue = TargetElementValue;
			
			ThisClass.UpdateArea(ThisClass.TemplateStatusElement, '.' + PageObj.guid, PageObj);
			
			var NewTargetElementValue = SourceElementValue;
			
			RqlXml = '<ELT action="save" reddotcacheguid="" guid="' + TargetElementGuid + '" value="' + NewTargetElementValue + '"></ELT>'
			
			ThisClass.RqlConnectorObj.SendRql(RqlXml, false, function(data){
				ThisClass.SubmitPage(PageObj.guid, function(){
					ThisClass.ReleasePage(PageObj.guid);
				});
				
				ThisClass.UpdateArea(ThisClass.TemplateStatusRemove, '.' + PageObj.guid);
				
				ThisClass.ReferenceArray(PageInstancesArray, SourceElementName, TargetElementName);
			});
		});
	}
}

ContentTransfer.prototype.ReferencePage = function(PageObj, SourceElementName, TargetElementName, CallbackFunc) {
	var ThisClass = this;
	
	if(PageObj){
		var RqlXml = '<PAGE guid="' + PageObj.guid + '"><ELEMENTS action="load"/></PAGE>';
		
		ThisClass.UpdateArea(ThisClass.TemplateStatus, undefined, PageObj);

		ThisClass.RqlConnectorObj.SendRql(RqlXml, false, function(data){
			var SourceElementValue = $(data).find('ELEMENT[eltname="' + SourceElementName + '"]').attr('value');
			var TargetElementGuid = $(data).find('ELEMENT[eltname="' + TargetElementName + '"]').attr('guid');
			var TargetElementValue = $(data).find('ELEMENT[eltname="' + TargetElementName + '"]').attr('value');
			
			PageObj.sourceelementname = SourceElementName;
			PageObj.sourceelementvalue = SourceElementValue;
			PageObj.targetelementname = TargetElementName;
			PageObj.targetelementvalue = TargetElementValue;
			
			ThisClass.UpdateArea(ThisClass.TemplateStatusElement, '.' + PageObj.guid, PageObj);
			
			var NewTargetElementValue = SourceElementValue;
			
			RqlXml = '<ELT action="save" reddotcacheguid="" guid="' + TargetElementGuid + '" value="' + NewTargetElementValue + '"></ELT>'
			
			ThisClass.RqlConnectorObj.SendRql(RqlXml, false, function(data){
				ThisClass.UpdateArea(ThisClass.TemplateStatusRemove, '.' + PageObj.guid);
				
				if(CallbackFunc){
					CallbackFunc();
				}
			});
		});
	}
}

ContentTransfer.prototype.SubmitPage = function(PageGuid, CallbackFunc) {
	var RqlXml = '<PAGE action="save" guid="' + PageGuid + '" globalsave="1" actionflag="32768"/>';

	this.RqlConnectorObj.SendRql(RqlXml, false, function(data){

		if(CallbackFunc){
			CallbackFunc();
		}
	});
}

ContentTransfer.prototype.ReleasePage = function(PageGuid, CallbackFunc) {
	var RqlXml = '<PAGE action="save" guid="' + PageGuid + '" globalrelease="1" actionflag="4096"/>';
	
	this.RqlConnectorObj.SendRql(RqlXml, false, function(data){

		if(CallbackFunc){
			CallbackFunc();
		}
	});
}

ContentTransfer.prototype.UpdateArea = function(TemplateId, DataContainerAdditional, Data){
	var ContainerId = $(TemplateId).attr('data-container');
	if(DataContainerAdditional){
		ContainerId = DataContainerAdditional + ' ' + ContainerId;
	}
	var TemplateAction = $(TemplateId).attr('data-action');
	var Template = Handlebars.compile($(TemplateId).html());
	var TemplateData = Template(Data);

	if((TemplateAction == 'append') || (TemplateAction == 'replace'))
	{
		if (TemplateAction == 'replace') {
			$(ContainerId).empty();
		}

		$(ContainerId).append(TemplateData);
	}

	if(TemplateAction == 'prepend')
	{
		$(ContainerId).prepend(TemplateData);
	}

	if(TemplateAction == 'after')
	{
		$(ContainerId).after(TemplateData);
	}
}