let synth = null;

const button = document.querySelector('button');
button.addEventListener('click', async () => {
    button.setAttribute('disabled', true);
    await Tone.start();
    console.log('audio is ready');
    synth = new Tone.Synth().toDestination();
    synth.oscillator.type = 'square';
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
