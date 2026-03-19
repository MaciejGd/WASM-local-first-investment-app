async function WasmUsage() {
    const wasm = await WebAssembly.instantiateStreaming(fetch(new URL('main.wasm', import.meta.url)));
    

    const { memory, double_check, alloc_f64, dealloc_f64 } = wasm.instance.exports;

    var test_arr = [7,4,2,1,2,
                    1,2,5,4,4, 
                    10,9,5,7,2]                
    // allocate memory for the buffers
    const res_ptr = alloc_f64(4);
    const data_ptr = alloc_f64(test_arr.length);
    const results = new Float64Array(memory.buffer, res_ptr, 4);
    const data = new Float64Array(memory.buffer, data_ptr, test_arr.length)
    data.set(test_arr)
    console.log("Array before running WASM method: ", data);
    console.log("Results array before the operations: ", results);
    
    // run main function utilizing buffers
    double_check(data.byteOffset, data.length, results.byteOffset);
    
    console.log("Array after running WASM method: ", data);
    console.log("Results array after the operations: ", results);
    // dealloc allocated resources
    dealloc_f64(res_ptr);
    dealloc_f64(data_ptr);
}
WasmUsage();