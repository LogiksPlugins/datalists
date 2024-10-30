<?php
if(!defined('ROOT')) exit('No direct script access allowed');
checkServiceSession(false);

//,["guid"=>$_SESSION['SESS_GUID']]
$whereCommon=[];
if(isset($_REQUEST['action'])) {
    switch($_REQUEST['action']){
			case 'listGroups':
				$data=_db()->_selectQ(_dbTable("lists"),"groupid,count(*) as count",$whereCommon)->_groupBy("groupid");
				if(isset($_REQUEST['term']) && strlen($_REQUEST['term'])>0) {
				    $data->_whereOR(["title"=>[$_REQUEST['term'],"LIKE"],"groupid"=>[$_REQUEST['term'],"LIKE"]]);
				}
				$data=$data->_GET();
				printServiceMsg($data);
				break;
			case 'listData':
				$result = [];
				if(isset($_REQUEST['gid'])) {
				    $result = _db()->_selectQ(_dbTable("lists"),"id,groupid,title,value,class,privilege,sortorder,blocked,edited_on",$whereCommon)->_where(
							["groupid"=>$_REQUEST['gid']]
					)->_orderBy("sortorder ASC")->_GET();
				}
				printServiceMsg($result);
				break;
			case "addRecord":
				if(isset($_REQUEST['gid'])) {
					if(!isset($_POST['privilege']) || strlen($_POST['privilege'])==0) {
						$_POST['privilege']="*";
					}

					$_POST['value']=preg_replace("/[^A-Za-z0-9\-.]/", "_", $_POST['value']);
					
					if(!isset($_POST['class']) || $_POST['class']=="null") $_POST['class'] = "";

					if(isset($_POST['id']) && strlen($_POST['id'])>0) {
						$_POST['edited_on']=date("Y-m-d H:i:s");
						$_POST['edited_by']=$_SESSION['SESS_USER_ID'];
                        if($_SESSION['SESS_PRIVILEGE_ID']<=ADMIN_PRIVILEGE_ID) {
                            $result = _db()->_updateQ(_dbTable("lists"),$_POST,["groupid"=>$_REQUEST['gid'],"id"=>$_REQUEST['id']])->_RUN();
                        } else {
                            $result = _db()->_updateQ(_dbTable("lists"),$_POST,["groupid"=>$_REQUEST['gid'],"id"=>$_REQUEST['id']])->_whereOR("guid",["global",$_SESSION['SESS_GUID']])->_RUN();
                        }
						if($result) {
							printServiceMsg("success");
						} else {
							printServiceErrorMsg("Error in creating record");
						}
					} else {
						$_POST['guid']=$_SESSION['SESS_GUID'];
						$_POST['groupid']=$_REQUEST['gid'];
						$_POST['created_on']=date("Y-m-d H:i:s");
						$_POST['edited_on']=date("Y-m-d H:i:s");
						$_POST['created_by']=$_POST['edited_by']=$_SESSION['SESS_USER_ID'];
						if(isset($_POST['id'])) unset($_POST['id']);
						
						foreach($_POST as $a=>$b) {
							if(strlen($b)<=0) unset($_POST[$a]);
						}
						
						$result = _db()->_insertQ1(_dbTable("lists"),$_POST)->_run();
						if($result) {
							printServiceMsg("success");
						} else {
							printServiceErrorMsg("Error in creating record");
						}
					}
				} else {
					printServiceErrorMsg("No Group Defined");
				}
				break;
			case "updateRecord":
					if(isset($_REQUEST['gid']) && isset($_POST['id'])) {
						$_POST['edited_on']=date("Y-m-d H:i:s");
						$_POST['edited_by']=$_SESSION['SESS_USER_ID'];

                        if(isset($_POST['value'])) {
                          $_POST['value']=preg_replace("/[^A-Za-z0-9]/", "_", $_POST['value']);
                        }

						$result = _db()->_updateQ(_dbTable("lists"),$_POST,["groupid"=>$_REQUEST['gid'],"id"=>$_REQUEST['id']])->_run();
						if($result) {
							printServiceMsg("success");
						} else {
							printServiceErrorMsg("Error in updating record"._db()->get_error());
						}
					} else {
						printServiceErrorMsg("No Group Defined");
					}
				break;
			case "deleteRecord":
					if(isset($_REQUEST['gid']) && isset($_POST['id'])) {
						$result = _db()->_deleteQ(_dbTable("lists"))->_where(["groupid"=>$_REQUEST['gid'],"id"=>$_REQUEST['id']])->_run();
						if($result) {
							printServiceMsg("success");
						} else {
							printServiceErrorMsg("Error in deleting record");
						}
					} else {
						printServiceErrorMsg("No Group Defined");
					}
				break;
    }
}

?>
