import { SampleType } from "./type"
export const features = [
    "sepal length in cm",
    "sepal width in cm",
    "petal length in cm",
    "petal width in cm",
];
export function genSampleDesc(singleInput: SampleType['input']) {
    return features.reduce(
        (pre, curFeature, curIndex) =>
            pre + " | " + `${curFeature}:${singleInput[curIndex]}`,
        ""
    );
}