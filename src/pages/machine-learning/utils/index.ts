import * as mathUtils from './math'
import * as runModelUtils from './runModel'

export { mathUtils, runModelUtils }

export const getPredictedClass = (output: Float32Array)=> {
    if (output.reduce((a, b) => a + b, 0) === 0) {
        return -1;
    }
    return output.reduce(
        (argmax, n, i) => (n > output[argmax] ? i : argmax),
        0
    );
}