const urls = {
    'C3': 'Kick01.wav',
    'C#3': 'Snare01.wav',
    'D3': 'Closedhat01.wav',
};

const reverb = new Tone.Reverb({
    wet: 0.6,
}).toDestination();

const synth = new Tone.Synth().connect(reverb);
synth.oscillator.type = 'square';

const sampler = new Tone.Sampler({
    urls,
    baseUrl: './assets/sounds/',
}).toDestination();

function onMidiMessage(event) {
    const channel = event.data[0] & 0xf;
    if (channel === 0) {
        if (synth === null) return;
        if (event.data[0] >> 4 === 9) {
            synth.triggerRelease();
            synth.triggerAttack(Tone.Frequency(event.data[1], 'midi'), 0, event.data[2] / 127);
        } else if (event.data[0] >> 4 === 8) {
            synth.triggerRelease();
        }
    } else if (channel === 1) {
        const sampleNum = event.data[1] - 48;
        if (event.data[0] >> 4 === 9) {
            if (sampler === null) return;
            if (sampleNum >= 0 && sampleNum < Object.keys(urls).length) {
                document.querySelectorAll('.playing')[sampleNum].classList.add('active');
            }
            sampler.triggerAttackRelease(Tone.Frequency(event.data[1], 'midi').toNote());
        } else if (event.data[0] >> 4 === 8) {
            document.querySelectorAll('.playing')[sampleNum].classList.remove('active');
        }
    }
}

navigator.requestMIDIAccess()
    .then((access) => {
        const inputs = access.inputs.values();
        Array.from(inputs).forEach(_ => {
            if (_.name === 'IAC Driver Bus 1') {
                _.onmidimessage = onMidiMessage;
            }
        });
    });

function handleUpload(event) {
    event.preventDefault();
    console.log(event.dataTransfer.items[0].getAsFileSystemHandle().then(_ => { console.log(_); }));
}

window.addEventListener('drop', handleUpload);
window.addEventListener('dragover', (event) => {
    event.preventDefault();
});
