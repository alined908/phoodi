import * as types from "../../constants/action-types";
import * as actions from "../../actions";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const store = mockStore({});

describe("GlobalMessage actions", () => {
  beforeEach(() => {
    store.clearActions();
  });

  it("should handle addGlobalMessage()", () => {
    const payload = { type: "success", message: "Good job." };
    const expectedAction = { type: types.ADD_GLOBAL_MESSAGE, payload };
    expect(actions.addGlobalMessage(payload.type, payload.message)).toEqual(
      expectedAction
    );
  });

  it("should handle removeGlobalMessage()", () => {
    const expectedAction = { type: types.REMOVE_GLOBAL_MESSAGE };
    expect(actions.removeGlobalMessage()).toEqual(expectedAction);
  });
});
