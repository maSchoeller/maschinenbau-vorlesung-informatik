import * as state from '@codemirror/state';
import * as view from '@codemirror/view';
import * as commands from '@codemirror/commands';
import * as language from '@codemirror/language';
import * as autocomplete from '@codemirror/autocomplete';
import * as search from '@codemirror/search';
import * as highlight from '@lezer/highlight';
import { python, pythonLanguage } from '@codemirror/lang-python';

window.CM = { state, view, commands, language, autocomplete, search, highlight, python, pythonLanguage };
