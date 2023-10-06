import {init} from '@rematch/core';

import * as models from '../models';
import {persistPlugin} from '../persist';

export default init({
    models,
    plugins: [persistPlugin],
    redux: {}
})