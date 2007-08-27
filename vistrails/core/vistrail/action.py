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

from datetime import date, datetime
from time import strptime

from core.vistrail.annotation import Annotation
from core.vistrail.operation import AddOp, ChangeOp, DeleteOp
from db.domain import DBAction
from itertools import izip

class Action(DBAction):

    ##########################################################################
    # Constructors and copy

    def __init__(self, *args, **kwargs):
        DBAction.__init__(self, *args, **kwargs)
        if self.timestep is None:
            self.timestep = -1
        if self.parent is None:
            self.parent = -1
        if self.user is None:
            self.user = ''
        if self.prune is None:
            self.prune = 0
        if kwargs.has_key('notes'):
            self.notes = kwargs['notes']

    def __copy__(self):
        return Action.do_copy(self)

    def do_copy(self, new_ids=False, id_scope=None, id_remap=None):
        cp = DBAction.do_copy(self, new_ids, id_scope, id_remap)
        cp.__class__ = Action
        return cp
    
    ##########################################################################
    # Properties

    def _get_timestep(self):
	return self.db_id
    def _set_timestep(self, timestep):
	self.db_id = timestep
    timestep = property(_get_timestep, _set_timestep)
    id = property(_get_timestep, _set_timestep)

    def _get_parent(self):
	return self.db_prevId
    def _set_parent(self, parent):
        self.db_prevId = parent
    parent = property(_get_parent, _set_parent)
    prevId = property(_get_parent, _set_parent)

    def _get_date(self):
	if self.db_date is not None:
	    return self.db_date.strftime('%d %b %Y %H:%M:%S')
	return datetime(1900,1,1).strftime('%d %b %Y %H:%M:%S')

    def _set_date(self, date):
        if type(date) == datetime:
            self.db_date = date
        elif type(date) == type('') and date.strip() != '':
            newDate = datetime(*strptime(date, '%d %b %Y %H:%M:%S')[0:6])
	    self.db_date = newDate
    date = property(_get_date, _set_date)

    def _get_session(self):
        return self.db_session
    def _set_session(self, session):
        self.db_session = session
    session = property(_get_session, _set_session)

    def _get_user(self):
        return self.db_user
    def _set_user(self, user):
        self.db_user = user
    user = property(_get_user, _set_user)

    def _get_prune(self):
        return self.db_prune
    def _set_prune(self, prune):
        self.db_prune = prune
    prune = property(_get_prune, _set_prune)
    
    def _get_annotations(self):
        return self.db_annotations
    def _set_annotations(self, annotations):
        self.db_annotations = annotations
    annotations = property(_get_annotations, _set_annotations)
    
    def _get_notes(self):
        if self.db_has_annotation_with_key('notes'):
            return self.db_get_annotation_by_key('notes').value
        return None
    def _set_notes(self, notes):
        self.db_change_annotation(Annotation(id=0,
                                             key='notes',
                                             value=notes,
                                             ))
    notes = property(_get_notes, _set_notes)

    def _get_operations(self):
        return self.db_operations
    def _set_operations(self, operations):
        self.db_operations = operations
    operations = property(_get_operations, _set_operations)
    def add_operation(self, operation):
        self.db_operations.db_add_operation(operation)

    ##########################################################################
    # DB Conversion
    
    @staticmethod
    def convert(_action):
        if _action.__class__ == Action:
            return
        _action.__class__ = Action
        for _annotation in _action.annotations:
            Annotation.convert(_annotation)
        for _operation in _action.operations:
            if _operation.vtType == 'add':
                AddOp.convert(_operation)
            elif _operation.vtType == 'change':
                ChangeOp.convert(_operation)
            elif _operation.vtType == 'delete':
                DeleteOp.convert(_operation)
            else:
                raise Exception("Unknown operation type '%s'" % \
                                    _operation.vtType)
            
    ##########################################################################
    # Operators

    def __eq__(self, other):
        """ __eq__(other: Module) -> boolean
        Returns True if self and other have the same attributes. Used by == 
        operator. 
        
        """
        if type(self) != type(other):
            return False
        if len(self.annotations) != len(other.annotations):
            return False
        if len(self.operations) != len(other.operations):
            return False
        for f,g in zip(self.annotations, other.annotations):
            if f != g:
                return False
        for f,g in zip(self.operations, other.operations):
            if f != g:
                return False
        return True

    def __ne__(self, other):
        return not self.__eq__(other)


    def __str__(self):
        """__str__() -> str 
        Returns a string representation of an action object.

        """
        msg = "<<type='%s' timestep='%s' parent='%s' date='%s'" + \
            "user='%s' notes='%s'>>"
        return msg % (type(self),
                      self.timestep,
                      self.parent,
                      self.date,
                      self.user,
                      self.notes)

################################################################################
# Unit tests

import unittest

class TestAction(unittest.TestCase):
    
    def create_action(self, id_scope=None):
        from core.vistrail.action import Action
        from core.vistrail.module import Module
        from core.vistrail.module_function import ModuleFunction
        from core.vistrail.module_param import ModuleParam
        from core.vistrail.operation import AddOp
        from db.domain import IdScope
        from datetime import datetime
        
        if id_scope is None:
            id_scope = IdScope()
        param = ModuleParam(id=id_scope.getNewId(ModuleParam.vtType),
                            type='Integer',
                            val='1')
        function = ModuleFunction(id=id_scope.getNewId(ModuleFunction.vtType),
                                  name='value',
                                  parameters=[param])
        m = Module(id=id_scope.getNewId(Module.vtType),
                   name='Float',
                   package='edu.utah.sci.vistrails.basic',
                   functions=[function])

        add_op = AddOp(id=id_scope.getNewId('operation'),
                       what='module',
                       objectId=m.id,
                       data=m)
        action = Action(id=id_scope.getNewId(Action.vtType),
                        prevId=0,
                        date=datetime(2007,11,18),
                        operations=[add_op])
        return action

    def test_copy(self):
        import copy
        from db.domain import IdScope
        
        id_scope = IdScope()
        a1 = self.create_action(id_scope)
        a2 = copy.copy(a1)
        self.assertEquals(a1, a2)
        self.assertEquals(a1.id, a2.id)
        a3 = a1.do_copy(True, id_scope, {})
        self.assertEquals(a1, a3)
        self.assertNotEquals(a1.id, a3.id)

    def test_serialization(self):
        import core.db.io
        a1 = self.create_action()
        xml_str = core.db.io.serialize(a1)
        a2 = core.db.io.unserialize(xml_str, Action)
        self.assertEquals(a1, a2)
        self.assertEquals(a1.id, a2.id)

    def test1(self):
        """Exercises aliasing on modules"""
        import core.vistrail
        from core.db.locator import XMLFileLocator
        v = XMLFileLocator(core.system.vistrails_root_directory() +
                           '/tests/resources/dummy.xml').load()
        p1 = v.getPipeline('final')
        p2 = v.getPipeline('final')
        self.assertEquals(len(p1.modules), len(p2.modules))
        for k in p1.modules.keys():
            if p1.modules[k] is p2.modules[k]:
                self.fail("didn't expect aliases in two different pipelines")

    def test2(self):
        """Exercises aliasing on points"""
        import core.vistrail
        from core.db.locator import XMLFileLocator
        import core.system
        v = XMLFileLocator(core.system.vistrails_root_directory() +
                            '/tests/resources/dummy.xml').load()
        p1 = v.getPipeline('final')
        v.getPipeline('final')
        p2 = v.getPipeline('final')
        m1s = p1.modules.items()
        m2s = p2.modules.items()
        m1s.sort()
        m2s.sort()
        for ((i1,m1),(i2,m2)) in izip(m1s, m2s):
            self.assertEquals(m1.center.x, m2.center.x)
            self.assertEquals(m1.center.y, m2.center.y)

# FIXME aliases need to be fixed (see core.vistrail.pipeline)
    def test3(self):
        """ Exercises aliases manipulation """
        pass


#         vistrail = dbservice.openVistrail( \
#             core.system.vistrails_root_directory() +
#             '/tests/resources/test_alias.xml')

#         p1 = v.getPipeline('alias')
#         p2 = v.getPipeline('alias')
        
#         # testing removing an alias
#         old_id = p1.modules[0].functions[0].params[0].db_id
#         old_f_id = p1.modules[0].functions[0].db_id
#         params = [(old_id, "2.0", "Float", "")]
#         action = v.chg_params_action(parent=-1,
#                                      params=params,
#                                      function_id=old_f_id)
#         p1.performAction(action)
#         self.assertEquals(p1.hasAlias('v1'),False)
#         v1 = p2.aliases['v1']
        
#         old_id2 = p2.modules[2].functions[0].params[0].db_id
#         old_f_id2 = p2.modules[2].functions[0].db_id
#         params2 = [(old_id2, "2.0", "Float", "v1")]
#         action2 = v.chg_params_action(parent=-1,
#                                       params=params2,
#                                       function_id=old_f_id2)
#         p2.performAction(action2)
#         self.assertEquals(v1, p2.aliases['v1'])
            
if __name__ == '__main__':
    unittest.main() 
