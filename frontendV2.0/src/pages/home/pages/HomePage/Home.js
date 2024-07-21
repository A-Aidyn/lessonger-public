import React from 'react';
import { homeObjOne} from './Data'
import { InfoSection } from '../../components';

const Home = () => {
    document.title = 'Home | Lessonger';
    return (
        <>
            <InfoSection {...homeObjOne} />
            
        </>
    ) 
}

export default Home
