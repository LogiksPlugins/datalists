<?php
if(!defined('ROOT')) exit('No direct script access allowed');

if(!_db()) {
  echo "<h1 align=center>No DB Configured for this instance</h1>";
  exit();
}

loadModule("pages");

//echo _css("datalists");
echo _js("datalists");

function pageContentArea() {
  return "<div class='datalists'>
  	<div class='col-md-12'>
	     <button class='btn btn-default visible-xs dataListoNoF' onclick=\"$('#pgsidebar').toggle();\"><i class='fa fa-list'></i></button>
	</div>
	<div class='col-md-12'  style='padding: 1px;'>
    	<div class='box'>
    	    <div class='box-body'>
           		<div class='table-responsive no-padding'>
                    <table class='table table-hover table table-striped table-bordered'>
                        <thead>
        				    <tr>
                                <th style='width: 10px'>#</th>
                                <th>Title</th>
                                <th>Value</th>
                                <th style=' width: 100px;'>Class/Params</th>
                                <th style=' width: 50px;'>Blocked</th>
                                <th style=' width: 20px;'>Sort</th>
            					<th>Privilege</th>
                                <th style=' width: 100px;'>Action</th>
                            </tr>
                            <tr id='formEditor' class='formTR hidden'>
                                <td><input type='hidden' name='id' /></td>
                                <td><input type='text' name='title' class='form-control input-sm' style='width:100%;' placeholder='Title'/></td>
                                <td><input type='text' name='value' class='form-control input-sm' style='width:100%;' placeholder='Value'/></td>
                                <td><input type='text' name='class' class='form-control input-sm' style='width:100%;' placeholder='Class'/></td>
                                <td align=center><input type='checkbox' name='blocked' value='true' /></td>
                                <td><input type='text' name='sortorder' class='form-control input-sm' style='width:100%;' placeholder='Sort Order'/></td>
            					<td><input type='text' name='privilege' class='form-control input-sm last-child' style='width:100%;' placeholder='Privilege'/></td>
                                <td><button onclick='addRecord()' class='btn btn-sm btn-default pull-right'><i class='fa fa-bolt'  aria-hidden='true'></i></button></td>
                            </tr>
        				</thead>
        				<tbody id='datalistGrid'>
        					<tr><td colspan=10 align=center>Please load a datalist to view it.</td></tr>
        				</tbody>
                    </table>
			    </div>
			</div>
		</div>
	</div>
</div>";

}

function pageSidebar() {
  $html=["<div id='datalistMaster' class='list-group list-group-root'>"];
  
  $data=_db()->_selectQ(_dbTable("lists"),"groupid,count(*) as max")->_groupBy("groupid")->_GET();
  if($data) {
    foreach($data as $row) {
        $html[]="<a href='#' class='list-group-item list-group-item-action' data-key='{$row['groupid']}'>{$row['groupid']} <span class='badge badge-default badge-pill'>{$row['max']}</span></a>";
    }
  }
  
  $html[]="</div><button class='btn btn-default visible-xs dataListoNoF'><i class='fa fa-list'></i></button>";
  return implode("",$html);//"</div>";
}

printPageComponent(false,[
    "toolbar"=>[
        "reloadLists"=>["title"=>"","align"=>"left","icon"=>"<i class='fa fa-refresh'></i>"],
        "newGroup"=>["title"=>"","align"=>"left","icon"=>"<i class='fa fa-plus'></i>"],
      
      //"loadEditorComponent"=>["title"=>"Editor","align"=>"right"],

       ["title"=>"Search Group","type"=>"search","align"=>"right"]
      //"listContent"=>["icon"=>"<i class='fa fa-refresh'></i>"],
      //"createContent"=>["icon"=>"<i class='fa fa-plus'></i>","tips"=>"Create New"],
      //"preview"=>["icon"=>"<i class='fa fa-eye'></i>","class"=>"onsidebarSelect onOnlyOneSelect","tips"=>"Preview Content"],
      //['type'=>"bar"],
      //"rename"=>["icon"=>"<i class='fa fa-terminal'></i>","class"=>"onsidebarSelect onOnlyOneSelect","tips"=>"Rename Content"],
      //"deleteContent"=>["icon"=>"<i class='fa fa-trash'></i>","class"=>"onsidebarSelect"],
    ],
    "sidebar"=>"pageSidebar",
    "contentArea"=>"pageContentArea"
  ]);
?>
