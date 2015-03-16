from __future__ import division

from vistrails.core.modules.utils import make_modules_dict

try:
    # read_numpy requires numpy
    import numpy
except ImportError: # pragma: no cover
    numpy_modules = []
else:
    from .read_numpy import _modules as numpy_modules

from .read_excel import get_xlrd
if get_xlrd():
    from .read_excel import _modules as excel_modules
else: # pragma: no cover
    excel_modules = []

from .read_csv import _modules as csv_modules
from .read_json import _modules as json_modules

_modules = make_modules_dict(numpy_modules, csv_modules, excel_modules,
                             json_modules,
                             namespace='read')
