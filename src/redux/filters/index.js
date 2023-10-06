import {createFilter} from 'redux-persist-transform-filter';

const JobDetailFilter = createFilter('JobDetail', [
    'nudgedJobs'
]);

export const AllFilters = [JobDetailFilter];