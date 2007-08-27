############################################################################
##
## Copyright (C) 2006-2007 University of Utah. All rights reserved.
##
## This file is part of VisTrails.
##
## This file may be used under the terms of the GNU General Public
## License version 2.0 as published by the Free Software Foundation
## and appearing in the file LICENSE.GPL included in the packaging of
## this file.  Please review the following to ensure GNU General Public
## Licensing requirements will be met:
## http://www.opensource.org/licenses/gpl-license.php
##
## If you are unsure which license is appropriate for your use (for
## instance, you are interested in developing a commercial derivative
## of VisTrails), please contact us at vistrails@sci.utah.edu.
##
## This file is provided AS IS with NO WARRANTY OF ANY KIND, INCLUDING THE
## WARRANTY OF DESIGN, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
##
############################################################################

-- generated automatically by auto_dao.py

CREATE TABLE port_spec(
    id int,
    name varchar(22),
    type varchar(255),
    spec varchar(255),
    parent_type char(16),
    vt_id int,
    parent_id int
);

CREATE TABLE module(
    id int,
    cache int,
    abstraction int,
    name varchar(255),
    package varchar(511),
    version varchar(255),
    parent_type char(16),
    vt_id int,
    parent_id int
);

CREATE TABLE tag(
    id int,
    name varchar(255),
    parent_type char(16),
    vt_id int,
    parent_id int
);

CREATE TABLE port(
    id int,
    type varchar(255),
    moduleId int,
    moduleName varchar(255),
    name varchar(255),
    spec varchar(4095),
    parent_type char(16),
    vt_id int,
    parent_id int
);

CREATE TABLE log_tbl(
    id int,
    vt_id int
);

CREATE TABLE machine(
    id int,
    name varchar(255),
    os varchar(255),
    architecture varchar(255),
    processor varchar(255),
    ram int,
    vt_id int,
    log_id int,
    module_exec_id int
);

CREATE TABLE add_tbl(
    id int,
    what varchar(255),
    object_id int,
    par_obj_id int,
    par_obj_type char(16),
    action_id int,
    vt_id int
);

CREATE TABLE other(
    id int,
    okey varchar(255),
    value varchar(255),
    parent_type char(16),
    vt_id int,
    parent_id int
);

CREATE TABLE location(
    id int,
    x DECIMAL(18,12),
    y DECIMAL(18,12),
    parent_type char(16),
    vt_id int,
    parent_id int
);

CREATE TABLE workflow_exec(
    id int,
    user varchar(255),
    ip varchar(255),
    vt_version varchar(255),
    ts_start datetime,
    ts_end datetime,
    parent_id int,
    parent_type varchar(255),
    parent_version int,
    name varchar(255),
    log_id int,
    vt_id int
);

CREATE TABLE function(
    id int,
    pos int,
    name varchar(255),
    parent_type char(16),
    vt_id int,
    parent_id int
);

CREATE TABLE abstraction(
    id int,
    name varchar(255),
    vt_id int
);

CREATE TABLE workflow(
    id int,
    name varchar(255),
    vt_id int
);

CREATE TABLE abstraction_ref(
    id int,
    abstraction_id int,
    version int,
    parent_type char(16),
    vt_id int,
    parent_id int
);

CREATE TABLE annotation(
    id int,
    akey varchar(255),
    value varchar(8191),
    parent_type char(16),
    vt_id int,
    parent_id int
);

CREATE TABLE change_tbl(
    id int,
    what varchar(255),
    old_obj_id int,
    new_obj_id int,
    par_obj_id int,
    par_obj_type char(16),
    action_id int,
    vt_id int
);

CREATE TABLE parameter(
    id int,
    pos int,
    name varchar(255),
    type varchar(255),
    val varchar(8191),
    alias varchar(255),
    parent_type char(16),
    vt_id int,
    parent_id int
);

CREATE TABLE connection_tbl(
    id int,
    parent_type char(16),
    vt_id int,
    parent_id int
);

CREATE TABLE action(
    id int,
    prev_id int,
    date datetime,
    session varchar(1023),
    user varchar(255),
    parent_type char(16),
    vt_id int,
    parent_id int
);

CREATE TABLE delete_tbl(
    id int,
    what varchar(255),
    object_id int,
    par_obj_id int,
    par_obj_type char(16),
    action_id int,
    vt_id int
);

CREATE TABLE vistrail(
    id int not null auto_increment primary key,
    version char(16),
    name varchar(255)
);

CREATE TABLE module_exec(
    id int,
    ts_start datetime,
    ts_end datetime,
    module_id int,
    module_name varchar(255),
    machine_id int,
    wf_exec_id int,
    vt_id int
);
