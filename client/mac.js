const SERVER_URL = 'http://127.0.0.1:5000';
const NAMES = [
    'Yustynn Panicker',
    'Jarvin Ong'
]

const CANVAS_HEIGHT = 500
const CANVAS_WIDTH = 500

const MIN_SIGNAL = 1;
const MAX_SIGNAL = 100;

const COLOR_KNOWN = '#006FFF'
const TEXT_OFFSET = 20;

const TRANSITION_DURATION = 2000

const processSignal = (signal) => {
    const normalized = (signal - MIN_SIGNAL) / (MAX_SIGNAL - MIN_SIGNAL)
    return Math.pow(normalized, 4)
}

let data = null;
let macsToTrack = null;
let isVizInit = false;

function selectRandomMacs(data, n=10) {
    const idxs = []
    while (idxs.length < n) {
        console.dir(idxs)
        const { random, floor } = Math
        const idx = floor(random() * data.length);

        const isName = NAMES.includes(data[idx].mac)
        const isAlreadyIncluded = idxs.includes(idx)

        if (!isName && !isAlreadyIncluded) idxs.push(idx)
    }

    return idxs.map(idx => data[idx].mac)
}

function processRawData(raw) {
    const processed = []

    for (let rowId of Object.keys(raw.sourcemac)) {
        const mac = raw.sourcemac[rowId]
        if (macsToTrack) {
            if (!macsToTrack.includes(mac)) continue
        }

        processed.push({
            mac: mac,
            timestamp: new Date(0).setUTCSeconds(raw.ts_sec[rowId]),
            signal: processSignal(-raw.signal[rowId])
        })
    }
    processed.sort((a, b) => a.mac.localeCompare(b.mac))

    return processed
}

async function updateData() {
    console.log('Fetching the data...')
    const raw = await fetch(`${SERVER_URL}/macs`).then(res => res.json())
    console.log('Processing the data...')


    data = processRawData(raw)
    console.log('Data processsed.')

    if (!macsToTrack) {
        macsToTrack = [...NAMES, ...selectRandomMacs(data)]
        data = data.filter(({mac}) => macsToTrack.includes(mac))
        data.sort((a, b) => a.mac.localeCompare(b.mac))
        vizInit()
    }

    vizUpdate()

    return setTimeout(updateData, 100)
}

function vizInit() {
    console.log('Initializing viz', data)
    d3.select('#viz')
        .attr('height', CANVAS_HEIGHT)
        .attr('width', CANVAS_WIDTH)
        .selectAll('circle')
        .data(data)
        .enter().append('circle')
            .attr('cx', CANVAS_WIDTH / 2)
            .attr('cy', CANVAS_HEIGHT / 2)
            .attr('text-anchor', 'middle')
            .attr('r', ({signal}) => signal * CANVAS_WIDTH / 2)
            .style('stroke', ({mac}) => {
                if (NAMES.includes(mac)) return COLOR_KNOWN
                return '#888'
            })
            .style('stroke-width', 2)
            .style('fill', 'none')

    d3.select('#viz')
        .selectAll('text')
        .data(data)
        .enter().append('text')
        .attr('x', (({signal}) => CANVAS_WIDTH / 2 + signal * CANVAS_WIDTH / 2))
        .attr('y', (({signal}) => CANVAS_HEIGHT / 2 + signal * CANVAS_HEIGHT / 2))
        .attr('fill', COLOR_KNOWN)
        .text(({mac}) => NAMES.includes(mac) ? mac : '')
}

function vizUpdate() {
    console.log('Updating viz', data)
    d3.select('#viz')
        .selectAll('circle')
        .data(data)
        .transition()
        .duration(TRANSITION_DURATION)
        .attr('cx', CANVAS_WIDTH / 2)
        .attr('cy', CANVAS_HEIGHT / 2)
        .attr('r', ({signal}) => signal * CANVAS_WIDTH / 2)
        .style('stroke', ({mac}) => {
            if (NAMES.includes(mac)) return COLOR_KNOWN
            return '#888'
        })
        .style('stroke-width', 2)
        .style('fill', 'none')

    const getTextCoordinate = (signal, canvasDimension) => {
        const {pow, sqrt} = Math
        const center = canvasDimension / 2;
        const pythagorasTerm = sqrt(2 * pow(center, 2))
        return center + signal * pythagorasTerm
    }

    d3.select('#viz')
        .selectAll('text')
        .data(data)
        .transition()
        .duration(TRANSITION_DURATION)
        .attr('x', ({signal}) => CANVAS_WIDTH / 2)
        .attr('y', ({signal}) => CANVAS_HEIGHT / 2 + signal * CANVAS_HEIGHT / 2 + TEXT_OFFSET)
        .attr('fill', COLOR_KNOWN)
        .text(({mac}) => NAMES.includes(mac) ? mac : '')
}

updateData().then(console.log)
