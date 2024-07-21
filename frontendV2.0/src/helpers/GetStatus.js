const getStatus = (last_active_time) => {
    let last_active_time_date = new Date(last_active_time), now = new Date();

    let passedTime = now.getTime() - last_active_time_date.getTime();
    if(passedTime / (1000 * 60 * 60 * 24) >= 1) {
        if(parseInt(passedTime / (1000 * 60 * 60 * 24), 10) === 1)
            return 'Last seen a day ago';
        return `Last seen ${last_active_time_date.toDateString()}`;
    }
    if(passedTime / (1000 * 60 * 60) >= 1) {
        let passed_hours = parseInt(passedTime / (1000 * 60 * 60), 10);
        if(passed_hours === 1)
            return 'Last seen an hour ago';
        return `Last seen ${passed_hours} hours ago`;
    }
    if(passedTime / (1000 * 60) >= 5) {
        let passed_minutes = parseInt(passedTime / (1000 * 60), 10);
        return `Last seen ${passed_minutes} minutes ago`;
    }
    return 'Online';
}

export default getStatus;