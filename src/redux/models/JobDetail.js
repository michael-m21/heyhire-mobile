import { reducerActions as reducers } from "./reducers";

const IsState = {
    nudgedJobs: [],
    isLoggedIn: true,
}

export const JobDetail = {
    name: 'JobDetail',
    state: IsState,
    reducers,
    effects: (dispatch) => ({
        async nudgeJobPoster(data, state) {
            dispatch.JobDetail.setError(false); 

            try {
                console.log(state);
                const nudgedJobs = state?.JobDetail?.nudgedJobs;
                // console.log(nudgedJobs, 'from redux');

                // const findAddedNudge = nudgedJobs?.findIndex(object => object.jobId === data.id);
                // console.log(findAddedNudge, 'from redux');
                const newData = [];
                // if(findAddedNudge === -1 || findAddedNudge === undefined) {
                    newData.push({data})
                // }


                dispatch.JobDetail.setState({
                    nudgedJobs: [
                        ...state?.JobDetail?.nudgedJobs,
                        ...newData
                    ]
                })

            } catch (error) {
                console.log(error);
            }
        },
    }) 
}