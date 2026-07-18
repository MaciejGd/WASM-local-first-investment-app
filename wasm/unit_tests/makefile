build:
	g++ --std=c++20 main.cpp ../core/linalg/algorithms.cpp ../core/simulation_results.cpp -o unit_tests.exe

run:
	./unit_tests.exe

buildrun: build run

debug:
	g++ --std=c++20 main.cpp ../core/linalg/algorithms.cpp ../core/simulation_results.cpp -g02 -o unit_tests.exe && unit_tests.exe