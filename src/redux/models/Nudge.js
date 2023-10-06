import moment from "moment";
import { reducerActions as reducers } from "./reducers";

const IsState = {
    nudgedJobs: [],
    isLoggedIn: true,
}

export const NudgedStatus = {
    name: 'NudgedStatus',
    state: IsState,
    reducers,
    effects: (dispatch) => ({
        async nudgeJobPoster(data, state) {
            dispatch.NudgedStatus.setError(false); 

            try {
                const nudgedJobs = state?.NudgedStatus?.nudgedJobs;

                const findAddedNudge = nudgedJobs?.filter(nudgedUsersJobs => nudgedUsersJobs?.data?.jobId === data?.jobId);

                let newData = [];
                if(findAddedNudge?.length === 0) {
                    newData.push({data})
                }else {
                    const upcomingNudge = findAddedNudge[0]?.data?.nextNudge;
                    const currentDate = moment();
                    const remainingDays = currentDate.diff(upcomingNudge, 'days');


                    if(remainingDays >= 0 ) {
                        newData = Object.assign(findAddedNudge[0]?.data, { nextNudge: moment().add(5, 'days') });   
                        
                        nudgedJobs.forEach((element, index) => {
                            if(element?.data?.jobId === data?.jobId) {
                                nudgedJobs[index] = newData;
                            }
                        });
    
                        dispatch.NudgedStatus.setState({
                            nudgedJobs: [
                                ...state?.NudgedStatus?.nudgedJobs,
                                ...nudgedJobs
                            ]
                        })
                    }

                }
               
                dispatch.NudgedStatus.setState({
                    nudgedJobs: [
                        ...state?.NudgedStatus?.nudgedJobs,
                        ...newData
                    ]
                })

            } catch (error) {
                console.log(error);
            }
        },

        async fetchNudge(_, state) {
            dispatch.NudgedStatus.setError(false);

            return state?.NudgedStatus?.nudgedJobs;
        }
    }) 
}