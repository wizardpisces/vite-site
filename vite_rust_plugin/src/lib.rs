use napi::bindgen_prelude::*;
use napi_derive::napi;

#[napi]
pub fn transform_code(input: String) -> String {
    input.replace("console.log", "console.debug")
}