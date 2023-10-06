import { reducerActions as reducers } from "./reducers";

const initialState = {
    profile: {},
    token: null,
    profileImage: null,
    showWelocmeMessage: false,
    profileUpdated: false,
}

export const UserData = {
    name: 'UserData',
    state: initialState,
    reducers,
    
}