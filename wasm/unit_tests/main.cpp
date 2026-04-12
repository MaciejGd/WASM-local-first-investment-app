#include <iostream>
#include "./test_source/tests_runner.h"
#include "./inc/matrix_tests.h"
#include "./inc/algos_tests.h"
#include "./inc/utils_test.h"
#include "./inc/finance_api_tests.h"
#include "./inc/random_gen_tests.h"
#include "./inc/sims_results_tests.h"
#include "./inc/simulation_output_tests.h"


void generate_randoms() {
    auto rand = CRandomGenerator();
    std::cout << "Random nums generated\n";
    for (int i = 0; i < 10; i++) {
        for (int j = 0; j < 5; j++) {
            std::cout << "{";
            for (int k = 0; k < 3; k++) {
                std::cout << linalg::algorithms::InverseNormal(rand.GenerateRandom()) << ((k != 2) ? ", " : "");
            }
            std::cout << "},\n";
        }
        std::cout << std::endl;
        
    }
    std::cout << std::endl;
}

int main() {
    utests::UnitTestRunner::RunTests();
    // generate_randoms();
    return 0;
}


