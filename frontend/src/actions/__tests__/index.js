import configureMockStore from 'redux-mock-store';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {AUTH_USER, AUTH_ERROR, CLEAR_STORE, ADD_SETTINGS, EDIT_USER, ADD_GLOBAL_MESSAGE, GET_PREFERENCES, 
    REORDER_PREFERENCES, ADD_PREFERENCE, DELETE_PREFERENCE, EDIT_PREFERENCE} from "../constants/action-types"
import {signup, signout, signin, getProfile, editUser, getPreferences, addPreference, 
    editPreference, reorderPreference, deletePreference, addSettings, setUserSettings} from "../../actions/index"

