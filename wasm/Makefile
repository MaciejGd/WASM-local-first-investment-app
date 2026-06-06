make build:
	cd /d "E:\magisterka\code\main_code_repo\investment-app\wasm\core" && \
	em++ -O3 -msimd128 -ffast-math -fno-math-errno -s EXPORT_ES6 -s MODULARIZE=1 -s ENVIRONMENT=web -s EXPORT_NAME="createModule" -s EXPORTED_FUNCTIONS="['_runSimulations', '_malloc', '_free']" -s EXPORTED_RUNTIME_METHODS="['cwrap', 'ccall', 'HEAPF64']" "-Wl,--no-entry" "--std=c++20" "main.cpp" "./linalg/algorithms.cpp" "simulation_results.cpp" -o "main.js"

make update_wasm:
	copy /Y "E:\magisterka\code\main_code_repo\investment-app\wasm\core\main.js" "E:\magisterka\code\main_code_repo\investment-app\front-end\src\subpages\simulations\wasm\main.js"
	copy /Y "E:\magisterka\code\main_code_repo\investment-app\wasm\core\main.wasm" "E:\magisterka\code\main_code_repo\investment-app\front-end\src\subpages\simulations\wasm\main.wasm"

make all:
	make build
	make update_wasm
