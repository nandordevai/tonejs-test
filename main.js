let synth = null;
let sampler = null;

const button = document.querySelector('button');
button.addEventListener('click', async () => {
    button.setAttribute('disabled', true);
    await Tone.start();
    console.log('audio is ready');
    synth = new Tone.Synth().toDestination();
    synth.oscillator.type = 'square';
    const reverb = new Tone.Reverb({
        wet: 0.3,
    }).toDestination();
    sampler = new Tone.Sampler({
        urls: {
            'C3': 'Kick01.wav',
            'C#3': 'Snare01.wav',
            'D3': 'Closedhat01.wav',
        },
        baseUrl: '/assets/sounds/',
    }).connect(reverb);
});

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
        if (event.data[0] >> 4 === 9) {
            if (sampler === null) return;
            sampler.triggerAttackRelease(Tone.Frequency(event.data[1], 'midi').toNote());
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
