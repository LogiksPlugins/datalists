$(function() {
    
	$("#datalistMaster").delegate(".list-group-item","click",function() {
		$("#datalistMaster .active").removeClass('active');
		$(this).addClass('active');
		
		loadDatalistGrid($(this).data("key"));
		
		//add::rimpal:26032018
		$("#formEditor input").val("");
		$("#formEditor input:checkbox").prop('checked', false);

			
	});
	$("#datalistSelector").change(function() {
	    $("#datalistMaster .active").removeClass('active');
		$("#datalistMaster li.list-group-item[data-key='"+this.value+"']").addClass('active');
		
		loadDatalistGrid(this.value);
		//add::rimpal:26032018
		$("#formEditor input").val("");
		$("#formEditor input:checkbox").prop('checked', false);
	});
	
	$(".datalists").delegate("button[cmd]","click",function() {
			switch($(this).attr('cmd')) {
				case "newGroup":
				    newGroup();
					break;
				case "addRecord":
				    //console.log("XXXXX");
					//addRecord();
					break;
			}
		});
	$("#datalistGrid").delegate("button[cmd],input[name='blocked'][cmd]","click",function() {
		keyID=$(this).closest("tr").data("key");
		switch($(this).attr('cmd')) {
			case "edit":
					tr=$(this).closest("tr");
					tr.find("td[name]").each(function(k,v) {
							nm=$(this).attr("name");
							v=$(this).text();
							if(nm=="blocked") {
								if($(this).find("input[type=checkbox]").is(":checked")) {
									$("#formEditor input[name='blocked']")[0].checked=true;
								} else {
									$("#formEditor input[name='blocked']")[0].checked=false;
								}
							} else {
								$("#formEditor input[name='"+nm+"']").val(v);
							}
						});
					$("#formEditor input[name=id]").val(keyID);
					
				break;
			case "delete":
					lgksConfirm("Are you sure about deleting this Data?","Delete!",function(ans) {
						if(ans) {
							lx=_service("datalists","deleteRecord")+"&gid="+$("#formEditor").data("gid");
							q="id="+keyID;
							processAJAXPostQuery(lx,q,function(txt) {
									if(txt.error==null) {
										loadDatalistGrid($("#formEditor").data("gid"));
									} else {
										lgksToast(txt.error.msg);
									}
								});
						}
					});
				break;
			case "blocked":
					v=$(this).is(":checked");
					lx=_service("datalists","updateRecord")+"&gid="+$("#formEditor").data("gid");
					q="id="+keyID+"&blocked="+(v?"true":"false");
					processAJAXPostQuery(lx,q,function(txt) {
						if(txt.error==null) {
							loadDatalistGrid($("#formEditor").data("gid"));
						} else {
							lgksToast(txt.error.msg);
						}
					});
				break;
		}
	});
	$("#formEditor input[name=value]").focus(function() {
		if($(this).val().length<=0) {
			v=$("#formEditor input[name=title]").val();
			v=v.toLowerCase().replace(/ /g,'_');
			$(this).val(v);
		}
	});
	
	//add::rimpal:26032018
	$('#pgToolbarSearch').keypress(function (e) {
         var key = e.which;
         if(key == 13)  // the enter key code
          {
            	e.preventDefault();
          }
    });   
    //end::rimpal
	$("#formEditor input.last-child").keyup(function(e) {
		e.preventDefault();
		if(e.keyCode==13) {
			addRecord();
		}
	});
	
	$("#pgToolbarSearch").keyup(function(e) {
		e.preventDefault();
		loadMasterList();
	});
	
	loadMasterList();
});
function reloadLists() {
    $("#pgToolbarSearch input").val("");
    loadMasterList();
}
function loadMasterList() {
	$("#datalistMaster").html("<div class='ajaxloading ajaxloading5'></div>");
	$("#datalistSelector").html("<option value=''>Loading ...</option>");
	lx=_service("datalists","listGroups");
	if($("#pgToolbarSearch input").val()!=null && $("#pgToolbarSearch input").val().length>0) {
	    lx+="&term="+$("#pgToolbarSearch input").val();
	}
	processAJAXQuery(lx,function(txt) {
		jData=$.parseJSON(txt);
		$("#datalistMaster .ajaxloading").detach();
		$("#datalistSelector").html("");
		$.each(jData.Data,function(k,v) {
			html="<a href='#' class='list-group-item list-group-item-action' data-key='"+v.groupid+"'>";
			html+=v.groupid;
			html+="<span class='badge badge-default badge-pill'>"+v.count+"</span>";
			html+="</a>";
			
			html1="<option value='"+v.groupid+"'>"+v.groupid+" ("+v.count+")</option>";
			
			$("#datalistMaster").append(html);
			$("#datalistSelector").append(html1);
		});
		$("#datalistSelector").trigger("change");
	});
}
function loadDatalistGrid(gid) {
	$("#datalistGrid").html("<tr><td colspan=10 align=center><div class='ajaxloading ajaxloading5'></div></td></tr>");
	
	lx=_service("datalists","listData")+"&gid="+gid;
	processAJAXQuery(lx,function(txt) {
		jData=$.parseJSON(txt);
		//$("#datalistGrid .ajaxloading").closest("tr").detach();
		$("#datalistGrid").html("");
		$.each(jData.Data,function(k,v) {
		//	console.log(v);
			v.privilege=v.privilege.split(",");
			q=[];
			$.each(v.privilege,function(a,b) {
				if(b=="*" || b=="root") {
					q.push("<span class='badge bg-orange'>"+b+"</span>");
				} else {
					q.push("<span class='badge bg-green'>"+b+"</span>");
				}
			});
			v.privilege=q.join("");
			html="<tr data-key='"+v.id+"'>";
			html+="<td align=center><input type='radio' name='rowSelector' /></td>";
			html+="<td name='title'>"+v.title+"</td>";
			html+="<td name='value'>"+v.value+"</td>";
			html+="<td name='class'>"+v.class+"</td>";
			html+="<td name='blocked' align='center'>"+((v.blocked=="true")?"<input name='blocked' cmd='blocked' type='checkbox' data-id='"+v.id+"' checked value='true' />":"<input name='blocked' cmd='blocked' type='checkbox' data-id='"+v.id+"' value='true' />")+"</td>";
			html+="<td name='sortorder'>"+v.sortorder+"</td>";
			html+="<td name='privilege'>"+v.privilege+"</td>";
			html+="<td>";
				html+="<button cmd='delete' class='btn btn-sm btn-default pull-right'><i class='fa fa-trash-o'  aria-hidden='true'></i></button>&nbsp;";
				html+="<button cmd='edit' class='btn btn-sm btn-default pull-right'><i class='fa fa-pencil-square-o'  aria-hidden='true'></i></button>&nbsp;";
			html+="</td>";
			html+="</tr>";
			
			$("#datalistGrid").append(html);
		});
		$("#formEditor").data("gid",gid);
		$("#formEditor").removeClass("hidden");
		
		$("#datalistMaster .list-group-item[data-key='"+gid+"']>.badge").html($("#datalistGrid>tr").length);
		$("#datalistSelector option[value='"+gid+"']").html(gid+" ("+$("#datalistGrid>tr").length+")");
	});
}

function addRecord() {
	if($("input[name=title]","#formEditor").val()==null || $("input[name=title]","#formEditor").val().length<=0) {
		lgksToast("Title can not be empty");
		return;
	}
	if($("input[name=value]","#formEditor").val()==null || $("input[name=value]","#formEditor").val().length<=0) {
		lgksToast("Value can not be empty");
		return;
	}
	q=[];
	$("input[name][type=text],input[name][type=hidden],input[name][type=checkbox]:checked,select[name]","#formEditor").each(function() {
		q.push($(this).attr("name")+"="+$(this).val());
	});
	lx=_service("datalists","addRecord")+"&gid="+$("#formEditor").data("gid");
	processAJAXPostQuery(lx,q.join("&"),function(txt) {
		if(txt.error==null) {
			$("input[name],select[name]","#formEditor").val("");
			$($("#formEditor input")[1]).focus();
			loadDatalistGrid($("#formEditor").data("gid"));
		} else {
			lgksToast(txt.error.msg);
		}
	});
}
function newGroup() {
    lgksPrompt("New GroupID! (No Space or special characters allowed.)","New Group",function(ans) {
					if(ans!=null && ans.length>0) {
						html="<li class='list-group-item' data-key='"+ans+"'>";
						html+="<span class='badge'>0</span>";
						html+=ans;
						html+="</li>";
						
						$("#datalistMaster").prepend(html);
						
						html1="<option value='"+ans+"'>"+ans+" (0)</option>";
						$("#datalistSelector").append(html1);
						$("#datalistSelector").val(ans);
						
						
						//$("#datalistMaster .active").removeClass('active');
						//$("#datalistMaster li.list-group-item[data-key='"+ans+"']").addClass('active');

						//loadDatalistGrid(ans);
						
						$("#datalistSelector").trigger("change");
					}
			});
}
