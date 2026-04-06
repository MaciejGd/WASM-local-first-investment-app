make all:
	g++ main.cpp -g02 -o unit_tests

make run:
	g++ main.cpp -g02 -o unit_tests && ./unit_tests

make win:
	g++ main.cpp -g02 -o unit_tests.exe

make winrun:
	g++ --std=c++20 main.cpp ../core/linalg/algorithms.cpp ../core/src/simulation_results.cpp -o unit_tests.exe && unit_tests.exe

make windebug:
	g++ --std=c++20 main.cpp ../core/linalg/algorithms.cpp ../core/src/simulation_results.cpp -g02 -o unit_tests.exe && unit_tests.exe