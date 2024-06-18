document.getElementById('hddForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const lowerLimit = parseInt(document.getElementById('lowerLimit').value);
    const upperLimit = parseInt(document.getElementById('upperLimit').value);
    const startPoint = parseInt(document.getElementById('startPoint').value);
    const requestPoints = document.getElementById('requestPoints').value.split(',').map(Number);
    const algorithm = document.getElementById('algorithm').value;

    const outputDiv = document.getElementById('output');
    const seekChart = document.getElementById('seekChart').getContext('2d');
    outputDiv.innerHTML = '';

    if (startPoint < lowerLimit || startPoint > upperLimit) {
        outputDiv.innerHTML = 'Start point must be within the limits.';
        return;
    }

    for (let point of requestPoints) {
        if (point < lowerLimit || point > upperLimit) {
            outputDiv.innerHTML = 'All request points must be within the limits.';
            return;
        }
    }

    let result;
    switch (algorithm) {
        case 'fcfs':
            result = fcfs(startPoint, requestPoints);
            break;
        case 'scan':
            result = scan(startPoint, requestPoints, lowerLimit, upperLimit);
            break;
        case 'cscan':
            result = cscan(startPoint, requestPoints, lowerLimit, upperLimit);
            break;
        case 'look':
            result = look(startPoint, requestPoints);
            break;
        case 'clook':
            result = clook(startPoint, requestPoints);
            break;
    }

    outputDiv.innerHTML = `
        <p>Seek Sequence: ${result.seekSequence.join(' -> ')}</p>
        <p>Total Seek Time: ${result.totalSeekTime}</p>
    `;

    new Chart(seekChart, {
        type: 'line',
        data: {
            labels: result.seekSequence,
            datasets: [{
                label: 'Seek Sequence',
                data: result.seekSequence,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                pointBorderColor: '#fff',
                pointRadius: 5,
                pointHoverRadius: 7,
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Order of Access'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Track Number'
                    },
                    suggestedMin: lowerLimit,
                    suggestedMax: upperLimit
                }
            }
        }
    });
});

function fcfs(start, requests) {
    let totalSeekTime = 0;
    let currentPosition = start;
    const seekSequence = [currentPosition];

    for (let request of requests) {
        totalSeekTime += Math.abs(request - currentPosition);
        currentPosition = request;
        seekSequence.push(currentPosition);
    }

    return { seekSequence, totalSeekTime };
}

function scan(start, requests, lower, upper) {
    let totalSeekTime = 0;
    let currentPosition = start;
    const seekSequence = [currentPosition];

    requests.sort((a, b) => a - b);
    let left = requests.filter(r => r < start);
    let right = requests.filter(r => r >= start);

    right.forEach(request => {
        totalSeekTime += Math.abs(request - currentPosition);
        currentPosition = request;
        seekSequence.push(currentPosition);
    });

    if (right.length > 0) {
        totalSeekTime += Math.abs(upper - currentPosition);
        currentPosition = upper;
        seekSequence.push(currentPosition);
    }

    left.reverse().forEach(request => {
        totalSeekTime += Math.abs(request - currentPosition);
        currentPosition = request;
        seekSequence.push(currentPosition);
    });

    return { seekSequence, totalSeekTime };
}

function cscan(start, requests, lower, upper) {
    let totalSeekTime = 0;
    let currentPosition = start;
    const seekSequence = [currentPosition];

    requests.sort((a, b) => a - b);
    let right = requests.filter(r => r >= start);
    let left = requests.filter(r => r < start);

    right.forEach(request => {
        totalSeekTime += Math.abs(request - currentPosition);
        currentPosition = request;
        seekSequence.push(currentPosition);
    });

    if (right.length > 0) {
        totalSeekTime += Math.abs(upper - currentPosition);
        currentPosition = upper;
        seekSequence.push(currentPosition);
        totalSeekTime += Math.abs(upper - lower);
        currentPosition = lower;
        seekSequence.push(currentPosition);
    }

    left.forEach(request => {
        totalSeekTime += Math.abs(request - currentPosition);
        currentPosition = request;
        seekSequence.push(currentPosition);
    });

    return { seekSequence, totalSeekTime };
}

function look(start, requests) {
    let totalSeekTime = 0;
    let currentPosition = start;
    const seekSequence = [currentPosition];

    requests.sort((a, b) => a - b);
    let left = requests.filter(r => r < start);
    let right = requests.filter(r => r >= start);

    right.forEach(request => {
        totalSeekTime += Math.abs(request - currentPosition);
        currentPosition = request;
        seekSequence.push(currentPosition);
    });

    left.reverse().forEach(request => {
        totalSeekTime += Math.abs(request - currentPosition);
        currentPosition = request;
        seekSequence.push(currentPosition);
    });

    return { seekSequence, totalSeekTime };
}

function clook(start, requests) {
    let totalSeekTime = 0;
    let currentPosition = start;
    const seekSequence = [currentPosition];

    requests.sort((a, b) => a - b);
    let right = requests.filter(r => r >= start);
    let left = requests.filter(r => r < start);

    right.forEach(request => {
        totalSeekTime += Math.abs(request - currentPosition);
        currentPosition = request;
        seekSequence.push(currentPosition);
    });

    if (right.length > 0 && left.length > 0) {
        totalSeekTime += Math.abs(right[right.length - 1] - left[0]);
        currentPosition = left[0];
        seekSequence.push(currentPosition);
    }

    left.forEach(request => {
        totalSeekTime += Math.abs(request - currentPosition);
        currentPosition = request;
        seekSequence.push(currentPosition);
    });

    return { seekSequence, totalSeekTime };
}
